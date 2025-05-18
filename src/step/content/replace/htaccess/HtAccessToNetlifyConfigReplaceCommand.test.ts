import { describe, expect, test } from "@javarome/testscript"
import { testUtil } from "../../../../../test/TestUtil.js"
import { HtAccessToNetlifyConfigReplaceCommand } from "./HtAccessToNetlifyConfigReplaceCommand.js"
import { FileContents, FileContentsLang } from "@javarome/fileutil"

describe("HtAccessToNetlifyConfigReplaceCommand", () => {

  const outputFile = new FileContents("out/netlify.toml", "utf-8", "", new Date(), new FileContentsLang())

  test("redirect html file to html file", async () => {
    const command = new HtAccessToNetlifyConfigReplaceCommand("https://rr0.org/")
    const context = testUtil.newContext(".htaccess",
      `Redirect /Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html https://rr0.org/time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
    context.outputFile = outputFile
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(`[[redirects]]
  from = "/Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html"
  to = "/time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html"

`)
  })

  test("redirect directory to directory", async () => {
    const command = new HtAccessToNetlifyConfigReplaceCommand("https://rr0.org/")
    const context = testUtil.newContext(".htaccess",
      `Redirect /science/crypto/ufologie https://rr0.org/science/crypto/ufo`)
    context.outputFile = outputFile
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(`[[redirects]]
  from = "/science/crypto/ufologie/*"
  to = "/science/crypto/ufo/:splat"

`)
  })

  describe("redirect directory to directory", () => {

    test("with trailing slash", async () => {
      const command = new HtAccessToNetlifyConfigReplaceCommand("https://rr0.org/")
      const context = testUtil.newContext(".htaccess",
        `Redirect /science/crypto/ufo/analyse/hypotheses/HET/ https://rr0.org/science/crypto/ufo/analyse/hypotheses/intelligence/HET/`)
      context.outputFile = outputFile
      await command.execute(context)
      const contents = context.file.contents as string
      expect(contents).toBe(`[[redirects]]
  from = "/science/crypto/ufo/analyse/hypotheses/HET/*"
  to = "/science/crypto/ufo/analyse/hypotheses/intelligence/HET/:splat"

`)
    })

    test("without trailing slash", async () => {
      const command = new HtAccessToNetlifyConfigReplaceCommand("https://rr0.org/")
      const context = testUtil.newContext(".htaccess",
        `Redirect /science/crypto/ufologie https://rr0.org/science/crypto/ufo`)
      context.outputFile = outputFile
      await command.execute(context)
      const contents = context.file.contents as string
      expect(contents).toBe(`[[redirects]]
  from = "/science/crypto/ufologie/*"
  to = "/science/crypto/ufo/:splat"

`)
    })
  })
})
