import fs from 'fs';
import { promise as glob } from 'glob-promise';
import { SsgStep } from '../SsgStep.js';
import { SsgContext } from '../../SsgContext.js';
import { HtmlSsgFile } from '../../util/index.js';
import { ContentStepConfig } from './ContentStepConfig.js';
import { OutputFunc } from '../../OutputFunc';

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
    return {
      contentCount
    }
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
      fileCount = await this.processFile(context, filePath, contentsConfig, fileCount)
    }
    return fileCount
  }

  protected async processFile(context: C, filePath: string, contentsConfig: ContentStepConfig,
                              fileCount: number): Promise<number> {
    context.debug("Processing file", filePath)
    context.inputFile = HtmlSsgFile.read(context, filePath)
    context.outputFile = contentsConfig.getOutputFile(context)
    if (this.shouldProcess(context)) {
      for (const replacement of contentsConfig.replacements) {
        context.outputFile = await replacement.execute(context)
      }
      fileCount++
      await this.output(context, context.outputFile)
    }
    return fileCount
  }

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
