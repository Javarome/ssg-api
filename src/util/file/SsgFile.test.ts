import {SsgFile} from "./SsgFile"
import {testUtil} from "../../test/TestUtil"

describe("SsgFile", () => {

  test("langs", () => {
    const context = testUtil.newContext("src/test/test.html", "")

    const langDefault = SsgFile.getLang(context, "src/test/test.html", context.locale)
    expect(langDefault).toEqual({lang: "fr", variants: ["fr", "en"]})

    const langEn = SsgFile.getLang(context, "src/test/test_en.html", context.locale)
    expect(langEn).toEqual({lang: "en", variants: ["fr", "en"]})

    const langNoDir = SsgFile.getLang(context, "LICENSE", context.locale)
    expect(langNoDir).toEqual({lang: "fr", variants: []})
  })

  test("files", () => {
    const context = testUtil.newContext("src/test/test.html", "")

    const fileDefault = SsgFile.read(context, "src/test/test.html")
    expect(fileDefault.lang).toEqual({lang: "fr", variants: ["fr", "en"]})

    const langEn = SsgFile.read(context, "src/test/test_en.html")
    expect(langEn.lang).toEqual({lang: "en", variants: ["fr", "en"]})
  })

})
