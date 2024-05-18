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
   * @param contentsConfigs The content roots and associated replacements to perform.
   * @param output The function that writes the output contents once they are ready.
   */
  constructor(protected contentsConfigs: ContentStepConfig<C>[], protected output: OutputFunc) {
  }

  async execute(context: C): Promise<ContentStepResult> {
    let contentCount = 0
    for (const contentsConfig of this.contentsConfigs) {
      contentCount += await this.processRoots(context, contentsConfig)
    }
    for (const contents of this.contentsConfigs) {
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
    context.file = context.getInputFrom(filePath)
    const outputPath = contentsConfig.getOutputFile(context)
    const outputFile = context.getOutputFrom(outputPath)
    const processed = this.shouldProcess(context, contentsConfig)
    if (processed) {
      for (const replacement of contentsConfig.replacements) {
        await replacement.execute(context)
      }
      await this.output(context, outputFile)
    }
    return processed
  }

  /**
   * Override this method if you want to use a different strategy than file date to decide if a file should be
   * processed (return true to always process for instance).
   *
   * @param context
   * @param contentsConfig
   * @return If the for this context should be processed or not.
   * @protected
   */
  protected shouldProcess(context: C, contentsConfig: ContentStepConfig): boolean {
    let inputHasChanged: boolean
    const outputPath = contentsConfig.getOutputFile(context)
    const outputExists = fs.existsSync(outputPath)
    if (outputExists) {
      const outputStats = fs.statSync(outputPath)
      inputHasChanged = context.file.lastModified > outputStats.mtime
      if (!inputHasChanged) {
        console.debug(context.file.name, "is not older that current out file")
      }
    } else {
      inputHasChanged = true
    }
    return inputHasChanged
  }
}
