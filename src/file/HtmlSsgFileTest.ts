import { HtmlFileContents, LinkType } from "./HtmlFileContents.js"
import { describe, expect, test } from "@javarome/testscript"

describe("HtmlFileContents", () => {

  test("defined title", () => {
    const fileName = "test/test.html"
    const inputFile = HtmlFileContents.read(fileName)
    expect(inputFile.title).toBe("Some title")
    expect(inputFile.meta.author).toEqual(["Jérôme Beau"])
    expect(inputFile.meta.url).toBe("https://rr0.org/tech/info/soft")
    expect(inputFile.links.start).toEqual({text: "Tests root", url: "..", type: LinkType.start})
    const titleElem = inputFile.document.documentElement.querySelector("title")
    expect(titleElem?.textContent).toBe("Some title - Some website")
  })

  test("undefined title", () => {
    const fileName = "test/test.html"
    const inputFile = HtmlFileContents.read(fileName)
    expect(inputFile.title).toBe("Some title")  // // TODO: Fix mocking to really have undefined title
    expect(inputFile.meta.author).toEqual(["Jérôme Beau"])
    expect(inputFile.meta.url).toBe("https://rr0.org/tech/info/soft")
    expect(inputFile.links.start).toEqual({text: "Tests root", url: "..", type: LinkType.start})
  })

  test("split title", () => {
    const fileName = "test/test_split.html"
    const inputFile = HtmlFileContents.read(fileName)
    expect(inputFile.title).toBe("Some split title")  // // TODO: Fix mocking to really have undefined title
  })
})
