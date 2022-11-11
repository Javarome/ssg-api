import {testUtil} from "../../test/TestUtil"
import {HtmlSsgFile} from "./HtmlSsgFile"

describe("HtmlSsgFile", () => {

  test("defined title", () => {
    const fileName = "src/test/test.html"
    const fileContents = `<!--#include virtual="/header-start.html" -->
<title>Introduction à l'édition du NCAS - Rapport Condon</title>
<meta content="https://www.ncas.org/condon/text/test.html" name="url">
<meta name="author" content="Paul Jaffe (président du NCAS, janvier 1999)">
<!--#include virtual="/header-end.html" -->`
    const context = testUtil.newHtmlContext(fileName, fileContents)
    const fileInfo = HtmlSsgFile.read(context, fileName)
    expect(fileInfo.title).toBe("Introduction à l'édition du NCAS")
    expect(fileInfo.meta.author).toEqual(["Paul Jaffe (président du NCAS, janvier 1999)"])
    expect(fileInfo.meta.url).toBe("https://www.ncas.org/condon/text/intro.htm")
    const titleElem = fileInfo.dom.window.document.documentElement.querySelector("title")
    expect(titleElem?.textContent).toBe("Introduction à l'édition du NCAS - Rapport Condon")
  })

  test("undefined title", () => {
    const fileName = "src/test/test.html"
    const fileContents = `<!--#include virtual="/header.html" -->
<ul><li>Item 1</li><li>Item 2</li></ul>
<!--#include virtual="/footer.html" -->`
    const context = testUtil.newHtmlContext(fileName, fileContents)
    const fileInfo = HtmlSsgFile.read(context, fileName)
    expect(fileInfo.title).toBe("Introduction à l'édition du NCAS")
    expect(fileInfo.meta.author).toEqual(["Paul Jaffe (président du NCAS, janvier 1999)"])
    expect(fileInfo.meta.url).toBe("https://www.ncas.org/condon/text/intro.htm")
  })
})
