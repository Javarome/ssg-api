import { ObjectUtil } from "../src/util/ObjectUtil.js"
import { HtmlFileContents, HtmlSsgContext, SsgContext, SsgContextImpl } from "../src/index.js"
import { FileContents } from "@javarome/fileutil"

class TestUtil {

  newContext(inputFileName: string, contents?: string): SsgContext {
    const context = new SsgContextImpl("fr")
    if (ObjectUtil.isUndefined(contents)) {
      context.file = FileContents.read(inputFileName)
    } else {
      context.file = new FileContents(inputFileName, "utf8", ObjectUtil.asSet(contents), new Date(),
        {lang: "fr", variants: []})
    }
    return context
  }

  newHtmlContext(inputFileName: string, contents?: string): HtmlSsgContext {
    const context = this.newContext(inputFileName, contents)
    let title: string | undefined
    if (contents) {
      const titleExec = /<title>(.*)<\/title>/.exec(contents)
      title = titleExec && titleExec.length > 0 ? titleExec[1].trim() : undefined
    }
    const currentFile = context.file
    const htmlFile = new HtmlFileContents(currentFile.name, currentFile.encoding, currentFile.contents,
      currentFile.lastModified, currentFile.lang)
    context.file = htmlFile
    htmlFile.title = title
    return context as HtmlSsgContext
  }
}

export const testUtil = new TestUtil()
