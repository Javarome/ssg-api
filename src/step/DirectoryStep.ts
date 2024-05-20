import { SsgStep } from "./SsgStep.js"
import { SsgContext } from "../SsgContext.js"
import { SsgConfig } from "../SsgConfig"
import { FileUtil, SsgFile } from "../util"

export interface DirectoryStepConfig extends SsgConfig {
  /**
   * A list of directories to look into.
   */
  readonly rootDirs: string[]

  /**
   * A list of directories to avoid looking into.
   */
  readonly excludedDirs: string[]

  /**
   * The name of the file containing the <--#echo var="directories"--> tag
   */
  readonly templateFileName: string
}

export interface DirectoryResult {
  directoryCount: number;
}

/**
 * A step to enrich a template from some subdirectories processing.
 *
 * A typical use case is to generate an index page from subdirectories.
 */
export abstract class DirectoryStep<C extends SsgContext = SsgContext> implements SsgStep<C, DirectoryResult> {

  /**
   * Creates a new directory step.
   *
   * @param config The step configuration.
   * @param name The step name ("directory" by default)
   */
  constructor(readonly config: DirectoryStepConfig, readonly name = "directory") {
  }

  /**
   * Execute the directory step by:
   * 1. finding all the subdirectories of each this.dirs
   * 2. processing the found directories through the `processDirs()` method.
   * 3. returning the count of processed directories
   */
  async execute(context: SsgContext): Promise<DirectoryResult> {
    context.file = context.read(this.config.templateFileName)
    const outputFilePath = this.config.getOutputPath(context)
    const outputFile = context.newOutput(outputFilePath)
    const dirNames = (await this.findDirs(this.config.rootDirs))
      .filter(dirName => !this.config.excludedDirs.includes(dirName))
    await this.processDirs(context, dirNames, outputFile)
    return {directoryCount: dirNames.length}
  }

  /**
   * Perform a processing of all found subdirectories.
   *
   * The implementation of this method is responsible for writing the outputfile (using
   * `writeFileInfo(context.outputFile)` typically), if any.
   */
  protected abstract processDirs(context: SsgContext, dirNames: string[], outputFile: SsgFile): Promise<void>

  protected async findDirs(fromDirs: string[]): Promise<string[]> {
    let dirNames: string[] = []
    for (let fromDir of fromDirs) {
      const subDirs = await this.findSubDirs(fromDir)
      dirNames = dirNames.concat(subDirs)
    }
    return dirNames
  }

  protected async findSubDirs(ofDir: string): Promise<string[]> {
    let subDirs: string[] = []
    if (ofDir.endsWith("/*/")) {
      const baseDir = ofDir.substring(0, ofDir.length - 3)
      if (baseDir.endsWith("/*")) {
        const dirs = (await this.findDirs([baseDir + "/"]))
          .filter(dirName => !this.config.excludedDirs.includes(dirName))
        for (const dir of dirs) {
          subDirs = subDirs.concat(await this.findDirs([dir + "/*/"]))
        }
      } else {
        subDirs = (await FileUtil.dirNames(baseDir)).map(x => baseDir + "/" + x)
      }
    } else {
      subDirs = [ofDir]
    }
    return subDirs
  }
}
