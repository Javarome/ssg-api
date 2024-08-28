import fs from "fs"
import { SsgStep } from "../SsgStep.js"
import { ContentStepConfig } from "./ContentStepConfig.js"
import { OutputFunc } from "../../OutputFunc.js"
import { glob } from "glob"
import { SsgContext } from "../../SsgContext"

export type ContentStepResult = {
  contentCount: number
}

/**
 * A SsgStep that can perform replacements in files' contents.
 */
export class ContentStep<C extends SsgContext = SsgContext> implements SsgStep<C, ContentStepResult> {
  /**
   *
   * @param contentsConfigs The content roots and associated replacements to perform.
   * @param write The function that writes the output contents once they are ready.
   * @param name Logger name
   */
  constructor(protected contentsConfigs: ContentStepConfig<C>[], protected write: OutputFunc,
              readonly name = "content") {
  }

  /**
   * Execute the step for each config,
   * then calls `contentStepEnd()` on all content replacers.
   *
   * @param context
   * @return an object with the `contentCount` of processed files.
   */
  async execute(context: C): Promise<ContentStepResult> {
    const result = {contentCount: 0}
    for (const contentsConfig of this.contentsConfigs) {
      result.contentCount += await this.processRoots(context, contentsConfig)
    }
    await this.postExecute(result)
    return result
  }

  /**
   * Calls `contentStepEnd()` on all content replacers.
   *
   * @param result
   * @protected
   */
  protected async postExecute(result: ContentStepResult) {
    for (const contents of this.contentsConfigs) {
      for (const replacement of contents.replacements) {
        await replacement.contentStepEnd()
      }
    }
    return result
  }

  /**
   * Process files of all roots of a content config.
   *
   * @param context
   * @param contentsConfig
   * @protected
   */
  protected async processRoots(context: C, contentsConfig: ContentStepConfig): Promise<number> {
    let fileCount = 0
    for (const contentsRoot of contentsConfig.roots) {
      fileCount = await this.processRoot(context, contentsRoot, contentsConfig, fileCount)
    }
    return fileCount
  }

  /**
   * Process all files from a given content root.
   *
   * @param context
   * @param contentsRoot
   * @param contentsConfig
   * @param fileCount
   * @protected
   */
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
   * This method can be overridden to perform some additional task at each file processing.
   *
   * @param context
   * @param filePath
   * @param contentsConfig
   * @return If the file was processed.
   * @see #shouldProcessFile(context)
   * @see #shouldProcessFile(context)
   * @protected
   */
  protected async processFile(context: C, filePath: string, contentsConfig: ContentStepConfig): Promise<boolean> {
    Object.assign(context, {_file: {name: filePath}})
    context.file.lastModified = fs.statSync(context.file.name).mtime
    const processFile = await this.shouldProcessFile(context, contentsConfig)
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
        console.debug(context.file.name, "is not more recent than", outputPath)
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
