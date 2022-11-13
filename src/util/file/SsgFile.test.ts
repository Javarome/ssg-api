import {SsgFile} from "./SsgFile"
import {testUtil} from "../../../test/TestUtil"

describe("SsgFile", () => {

  test("lang", () => {
    const context = testUtil.newContext("test/test.html", "")

    const langDefault = SsgFile.getLang(context, "test/test.html")
    expect(langDefault).toEqual({lang: undefined, variants: ["en", "fr"]})

    const langFr = SsgFile.getLang(context, "test/test_fr.html")
    expect(langFr).toEqual({lang: "fr", variants: ["en"]})
  })

  test("lang with no path", () => {
    const context = testUtil.newContext("test/test.html", "")
    const langNoDir = SsgFile.getLang(context, "LICENSE")
    expect(langNoDir).toEqual({lang: undefined, variants: []})
  })

  test("files", () => {
    const context = testUtil.newContext("test/test.html", "")

    const langFr = SsgFile.getLang(context, "test/test_fr.html")
    expect(langFr).toEqual({lang: "fr", variants: ["en"]})

    const fileDefault = SsgFile.read(context, "test/test.html")
    expect(fileDefault.lang).toEqual({lang: undefined, variants: ["en", "fr"]})

    const langEn = SsgFile.read(context, "test/test_en.html")
    expect(langEn.lang).toEqual({lang: "en", variants: ["fr"]})
  })
})
