import {SsgContext} from "../src/SsgContext"
import {HtmlSsgFile} from "../src/util/file/HtmlSsgFile"
import {HtmlSsgContext} from "../src/HtmlSsgContext"
import {SsgFile} from "../src/util/file/SsgFile"
import {SsgContextImpl} from "../src/SsgContextImpl"
import {ObjectUtil} from "../src/util/ObjectUtil"

class TestUtil {

  newContext(inputFileName: string, contents?: string): SsgContext {
    const context = new SsgContextImpl("fr", {})
    if (ObjectUtil.isUndefined(contents)) {
      context.inputFile = SsgFile.read(context, inputFileName)
    } else {
      context.inputFile = new SsgFile(inputFileName, "utf8", ObjectUtil.asSet(contents), new Date(),
        {lang: "fr", variants: []})
    }
    context.outputFile = context.inputFile  // By default
    return context
  }

  newHtmlContext(inputFileName: string, contents: string): HtmlSsgContext {
    const context = this.newContext(inputFileName, contents)
    const titleExec = /<title>(.*)<\/title>/.exec(contents)
    const title = titleExec && titleExec.length > 0 ? titleExec[1].trim() : undefined
    const currentFile = context.inputFile
    context.inputFile = new HtmlSsgFile(currentFile.name, currentFile.encoding, currentFile.contents,
      currentFile.lastModified, currentFile.lang, {author: []}, {}, title)
    context.outputFile = context.inputFile  // By default
    return context as HtmlSsgContext
  }
}

export const testUtil = new TestUtil()
