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
    expect(fileInfo.title).toBe("Some title")
    expect(fileInfo.meta.author).toEqual(["Jérôme Beau"])
    expect(fileInfo.meta.url).toBe("https://rr0.org/tech/info/soft")
    const titleElem = fileInfo.dom.window.document.documentElement.querySelector("title")
    expect(titleElem?.textContent).toBe("Some title - Some website")
  })

  test("undefined title", () => {
    const fileName = "src/test/test.html"
    const fileContents = `<!--#include virtual="/header.html" -->
<ul><li>Item 1</li><li>Item 2</li></ul>
<!--#include virtual="/footer.html" -->`
    const context = testUtil.newHtmlContext(fileName, fileContents)
    const inputFile = HtmlSsgFile.read(context, fileName)
    expect(inputFile.title).toBe("Some title")  // // TODO: Fix mocking to really have undefined title
    expect(inputFile.meta.author).toEqual(["Jérôme Beau"])
    expect(inputFile.meta.url).toBe("https://rr0.org/tech/info/soft")
  })
})
