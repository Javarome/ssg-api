import {SsgStep} from "./SsgStep.js"
import {SsgConfig} from "../Ssg.js"
import {SsgContext} from "../SsgContext.js"
import {FileUtil} from "../util/index.js"

export interface DirectoryResult {
  directoryCount: number
}

/**
 * A step to enrich a template from some subdirectories processing.
 *
 * A typical use case is to generate an index page from subdirectories.
 */
export abstract class DirectoryStep<C extends SsgContext = SsgContext> implements SsgStep<C, DirectoryResult> {

  constructor(protected dirs: string[], protected excludedDirs: string[], protected template: string,
              protected config: SsgConfig, readonly name = "directory") {
  }

  /**
   * Execute the directory step by:
   * 1. finding all the subdirectories of each this.dirs
   * 2. processing the found directories through the `processDirs()` method.
   * 3. returning the count of processed directories
   */
  async execute(context: SsgContext): Promise<DirectoryResult> {
    context.read(this.template)
    context.readOrNew(this.template, this.config.outDir)
    const dirNames = (await this.findDirs(this.dirs))
      .filter(dirName => !this.excludedDirs.includes(dirName))
    await this.processDirs(context, dirNames)
    return {directoryCount: dirNames.length}
  }

  /**
   * Perform a processing of all found subdirectories.
   *
   * The implementation of this method is responsible for writing the outputfile (using
   * `writeFileInfo(context.outputFile)` typically), if any.
   */
  protected abstract processDirs(context: SsgContext, dirames: string[]): Promise<void>

  private async findDirs(fromDirs: string[]) {
    let dirNames: string[] = []
    for (let fromDir of fromDirs) {
      const subDirs = await this.findSubDirs(fromDir)
      dirNames = dirNames.concat(subDirs)
    }
    return dirNames
  }

  private async findSubDirs(ofDir: string): Promise<string[]> {
    let subDirs: string[] = []
    if (ofDir.endsWith("/*/")) {
      const baseDir = ofDir.substring(0, ofDir.length - 3)
      if (baseDir.endsWith("/*")) {
        const dirs = (await this.findDirs([baseDir + "/"]))
          .filter(dirName => !this.excludedDirs.includes(dirName))
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
