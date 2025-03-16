import fs from "fs"
import { glob } from "glob"
import { SsgStep } from "../SsgStep.js"
import { ContentStepConfig } from "./ContentStepConfig.js"
import { OutputFunc } from "../../OutputFunc.js"
import { SsgContext } from "../../SsgContext.js"

export type ContentStepResult = {
  processedFiles: string[]
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
    const result: ContentStepResult = {processedFiles: []}
    for (const contentsConfig of this.contentsConfigs) {
      const processedFiles = await this.processRoots(context, contentsConfig)
      result.processedFiles = result.processedFiles.concat(processedFiles)
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
  protected async processRoots(context: C, contentsConfig: ContentStepConfig): Promise<string[]> {
    let rootsProcessedFiles: string[] = []
    for (const contentsRoot of contentsConfig.roots) {
      let processedFiles = await this.processRoot(context, contentsRoot, contentsConfig)
      rootsProcessedFiles = rootsProcessedFiles.concat(processedFiles)
    }
    return rootsProcessedFiles
  }

  /**
   * Process all files from a given content root.
   *
   * @param context
   * @param contentsRoot
   * @param contentsConfig
   * @protected
   */
  protected async processRoot(context: C, contentsRoot: string, contentsConfig: ContentStepConfig): Promise<string[]> {
    context.debug("Processing root", contentsRoot)
    const contentFiles = await glob(contentsRoot)
    context.setVar("contentsTotal", contentFiles.length)
    const processedFiles: string[] = []
    for (const filePath of contentFiles) {
      Object.assign(context, {_file: {name: filePath}})
      const lastModified = fs.statSync(context.file.name).mtime
      Object.assign(context.file, {lastModified})
      const doProcessFile = await this.shouldProcessFile(context, contentsConfig)
      if (doProcessFile) {
        let processedFile = await this.processFile(context, filePath, contentsConfig)
        if (processedFile) {
          processedFiles.push(processedFile)
        }
      } else {
        context.debug("Skipping file", filePath)
      }
    }
    return processedFiles
  }

  /**
   * Process one content file (found in content root).
   *
   * This method can be overridden to perform some additional task at each file processing.
   *
   * @param context
   * @param filePath
   * @param contentsConfig
   * @return {string|undefined} The output file.
   * @see #shouldProcessFile(context)
   * @see #shouldProcessContent(context)
   * @protected
   */
  protected async processFile(context: C, filePath: string,
                              contentsConfig: ContentStepConfig): Promise<string | undefined> {
    context.debug("Processing file", filePath)
    context.file = context.read(filePath)
    const processContent = await this.shouldProcessContent(context, contentsConfig)
    let outputName: string | undefined
    if (processContent) {
      outputName = await this.processFileContents(context, filePath, contentsConfig)
    } else {
      context.debug("Not processing contents of", filePath)
    }
    return outputName
  }

  protected async processFileContents(context: C, filePath: string, contentsConfig: ContentStepConfig<SsgContext>) {
    context.debug("Processing contents of", filePath)
    for (const replacement of contentsConfig.replacements) {
      await replacement.execute(context)
    }
    const outputPath = contentsConfig.getOutputPath(context)
    const output = context.newOutput(outputPath)
    context.debug("Writing new contents of", output.name)
    await this.write(context, output)
    return output.name
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
      const file = context.file
      inputHasChanged = file.lastModified.getTime() > outputStats.mtime.getTime()
      if (!inputHasChanged) {
        console.debug(file.name, "is not more recent than", outputPath)
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
