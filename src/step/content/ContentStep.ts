import {SsgStep} from "../SsgStep"
import {SsgContext} from "../../SsgContext"
import {OutputFunc} from "../../Ssg"
import {promise as glob} from "glob-promise"
import {ReplaceCommand} from "./replace/ReplaceCommand"
import {SsgFile} from "../../util/file/SsgFile"
import {HtmlSsgFile} from "../../util"

export type ContentStepConfig = {
  /**
   * The glob roots of contents to process.
   */
  roots: string[],

  /**
   * The replacements to process on contents.
   */
  replacements: ReplaceCommand<SsgContext>[],

  /**
   * @param context
   * @return the file where to output.
   */
  getOutputFile(context: SsgContext): SsgFile
}

export type ContentStepResult = {
  contentCount: number
}

export class ContentStep implements SsgStep<ContentStepResult> {

  readonly name = "content"

  constructor(protected contents: ContentStepConfig[], protected output: OutputFunc) {
  }

  async execute(context: SsgContext): Promise<ContentStepResult> {
    let contentCount = 0
    for (const contents of this.contents) {
      contentCount += await this.processRoots(context, contents)
    }
    return {
      contentCount
    }
  }

  protected async processRoots(context: SsgContext, contentsConfig: ContentStepConfig): Promise<number> {
    let contentCount = 0
    for (const contentsRoot of contentsConfig.roots) {
      contentCount = await this.processRoot(context, contentsRoot, contentsConfig, contentCount)
    }
    return contentCount
  }

  protected async processRoot(context: SsgContext, contentsRoot: string, contentsConfig: ContentStepConfig,
                              contentCount: number): Promise<number> {
    context.debug("Processing root", contentsRoot)
    const contentFiles = await glob(contentsRoot)
    for (const filePath of contentFiles) {
      contentCount = await this.processFile(context, filePath, contentsConfig, contentCount)
    }
    return contentCount
  }

  protected async processFile(context: SsgContext, filePath: string, contentsConfig: ContentStepConfig,
                              contentCount: number): Promise<number> {
    context.inputFile = HtmlSsgFile.read(context, filePath)
    context.outputFile = contentsConfig.getOutputFile(context)
    for (const replacement of contentsConfig.replacements) {
      context.outputFile = await replacement.execute(context)
    }
    contentCount++
    await this.output(context, context.outputFile)
    return contentCount
  }
}
