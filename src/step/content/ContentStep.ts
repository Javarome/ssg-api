import fs from "fs"
import { promise as glob } from "glob-promise"
import { SsgStep } from "../SsgStep.js"
import { SsgContext } from "../../SsgContext.js"
import { ContentStepConfig } from "./ContentStepConfig.js"
import { OutputFunc } from "../../OutputFunc"

export type ContentStepResult = {
  contentCount: number
}

/**
 * A SsgStep that can perform replacements in files' contents.
 */
export class ContentStep<C extends SsgContext = SsgContext> implements SsgStep<C, ContentStepResult> {
  /**
   * Logger name
   */
  readonly name = "content"

  /**
   *
   * @param contents The content roots and associated replacements to perform.
   * @param output The function that writes the output contents once they are ready.
   */
  constructor(protected contents: ContentStepConfig<C>[], protected output: OutputFunc) {
  }

  async execute(context: C): Promise<ContentStepResult> {
    let contentCount = 0
    for (const contents of this.contents) {
      contentCount += await this.processRoots(context, contents)
    }
    for (const contents of this.contents) {
      for (const replacement of contents.replacements) {
        await replacement.contentStepEnd()
      }
    }
    return {contentCount}
  }

  protected async processRoots(context: C, contentsConfig: ContentStepConfig): Promise<number> {
    let fileCount = 0
    for (const contentsRoot of contentsConfig.roots) {
      fileCount = await this.processRoot(context, contentsRoot, contentsConfig, fileCount)
    }
    return fileCount
  }

  protected async processRoot(context: C, contentsRoot: string, contentsConfig: ContentStepConfig,
                              fileCount: number): Promise<number> {
    context.debug("Processing root", contentsRoot)
    const contentFiles = await glob(contentsRoot)
    for (const filePath of contentFiles) {
      fileCount += await this.processFile(context, filePath, contentsConfig) ? 1 : 0
    }
    return fileCount
  }

  /**
   * Process one content file (found in content root).
   *
   * This method can be overriden to perform some additional task at each file processing.
   *
   * @param context
   * @param filePath
   * @param contentsConfig
   * @return If the file was processed.
   * @see #shouldProcess(context)
   * @protected
   */
  protected async processFile(context: C, filePath: string, contentsConfig: ContentStepConfig): Promise<boolean> {
    context.debug("Processing file", filePath)
    context.inputFile = context.getInputFrom(filePath)
    context.outputFile = context.getOutputFrom(contentsConfig.getOutputFile(context).name)
    const processed = this.shouldProcess(context)
    if (processed) {
      for (const replacement of contentsConfig.replacements) {
        context.outputFile = await replacement.execute(context)
      }
      await this.output(context, context.outputFile)
    }
    return processed
  }

  /**
   * Override this method if you want to use a different strategy than file date to decide if a file should be
   * processed (return true to always process for instance).
   *
   * @param context
   * @return If the for this context should be processed or not.
   * @protected
   */
  protected shouldProcess(context: C): boolean {
    let process: boolean
    const exists = fs.existsSync(context.outputFile.name)
    if (exists) {
      const outStats = fs.statSync(context.outputFile.name)
      process = outStats.mtime < context.inputFile.lastModified
      if (!process) {
        console.debug(context.inputFile.name, "is not older that current out file")
      }
    } else {
      process = true
    }
    return process
  }
}
