import fs from "fs"
import { SsgStep } from "../SsgStep.js"
import { ContentStepConfig } from "./ContentStepConfig.js"
import { OutputFunc } from "../../OutputFunc.js"
import { glob } from "glob"
import { SsgContextImpl } from "../../SsgContextImpl"

export type ContentStepResult = {
  contentCount: number
}

/**
 * A SsgStep that can perform replacements in files' contents.
 */
export class ContentStep<C extends SsgContextImpl = SsgContextImpl> implements SsgStep<C, ContentStepResult> {
  /**
   * Logger name
   */
  readonly name = "content"

  /**
   *
   * @param contentsConfigs The content roots and associated replacements to perform.
   * @param write The function that writes the output contents once they are ready.
   */
  constructor(protected contentsConfigs: ContentStepConfig<C>[], protected write: OutputFunc) {
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
    context._file = {
      name: filePath
    } as any
    const processFile = await this.shouldProcessFile(context, contentsConfig)
    context.file.lastModified = fs.statSync(context.file.name).mtime
    if (processFile) {
      context.file = context.read(filePath)
      const processContent = await this.shouldProcessContent(context, contentsConfig)
      if (processContent) {
        context.debug("Processing", filePath)
        for (const replacement of contentsConfig.replacements) {
          await replacement.execute(context)
        }
        const outputPath = contentsConfig.getOutputPath(context)
        const output = context.newOutput(outputPath)
        context.debug("Writing", output.name)
        await this.write(context, output)
      } else {
        context.debug("Skipping content of", filePath)
      }
    } else {
      context.debug("Skipping file", filePath)
    }
    return processFile
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
  protected async shouldProcessFile(context: C, contentsConfig: ContentStepConfig): Promise<boolean> {
    let inputHasChanged: boolean
    const outputPath = contentsConfig.getOutputPath(context)
    const outputExists = fs.existsSync(outputPath)
    if (outputExists) {
      const outputStats = fs.statSync(outputPath)
      inputHasChanged = context.file.lastModified.getTime() > outputStats.mtime.getTime()
      if (!inputHasChanged) {
        console.debug(context.file.name, "is not older that current out file")
      }
    } else {
      inputHasChanged = true
    }
    return inputHasChanged
  }

  protected async shouldProcessContent(_context: C, _contentsConfig: ContentStepConfig): Promise<boolean> {
    return true
  }
}
