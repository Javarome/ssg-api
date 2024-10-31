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
    expect(inputFile.title).toBe("Some title")
    expect(inputFile.meta.author).toEqual(["Jérôme Beau"])
    expect(inputFile.meta.url).toBe("https://rr0.org/tech/info/soft")
    expect(inputFile.links.start).toEqual({text: "Tests root", url: "..", type: LinkType.start})
  })

  test("split title", () => {
    const fileName = "test/test_split.html"
    const inputFile = HtmlFileContents.read(fileName)
    expect(inputFile.title).toBe("Some split title")
  })

  describe("lang", () => {

    test("from file variant", () => {
      {
        const inputFile = HtmlFileContents.read("test/test_fr.html")
        const lang = inputFile.lang.lang as string
        expect(lang).toBe("fr")
        const variants = inputFile.lang.variants as string[]
        expect(variants).toEqual(["en"])
      }
      {
        const inputFile = HtmlFileContents.read("test/test_en.html")
        const lang = inputFile.lang.lang as string
        expect(lang).toBe("en")
        const variants = inputFile.lang.variants as string[]
        expect(variants).toEqual(["fr"])
      }
    })

    test("from contents", () => {
      {
        const frFile = new HtmlFileContents("testfrench", "utf-8", `<html lang="fr">`, new Date(),
          {lang: "", variants: []},
          {author: []}, {})
        let lang = frFile.lang.lang as string
        expect(lang).toBe("fr")
      }
      {
        const enFile = new HtmlFileContents("testfrench", "utf-8", `<html lang="en">`, new Date(),
          {lang: "", variants: []},
          {author: []}, {})
        let lang = enFile.lang.lang as string
        expect(lang).toBe("en")
      }
    })
  })
})
