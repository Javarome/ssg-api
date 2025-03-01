import { SsgStep } from "./SsgStep.js"
import { SsgContext } from "../SsgContext.js"
import { FileContents, findDirs } from "@javarome/fileutil"
import { DirectoryStepConfig } from "./DirectoryStepConfig"

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
    const dirNames = await findDirs(this.config.rootDirs, this.config.excludedDirs)
    await this.processDirs(context, dirNames, outputFile)
    return {directoryCount: dirNames.length}
  }

  /**
   * Perform a processing of all found subdirectories.
   *
   * The implementation of this method is responsible for writing the outputfile (using
   * `writeFileInfo(context.outputFile)` typically), if any.
   */
  protected abstract processDirs(context: SsgContext, dirNames: string[], outputFile: FileContents): Promise<void>
}
