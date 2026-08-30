import { HtAccessToNetlifyRedirectsReplaceCommand } from "./HtAccessToNetlifyRedirectsReplaceCommand.js"
import { testUtil } from "../../../../../test/TestUtil.js"
import { describe, expect, test } from "@javarome/testscript"
import { FileContents, FileContentsLang } from "@javarome/fileutil"

describe("HtAccessToNetlifyRedirectsReplaceCommand", () => {

  const outputFile = new FileContents("out/netlify.toml", "utf-8", "", new Date(), new FileContentsLang())

  test("redirect html file to html file", async () => {
    const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
    const context = testUtil.newContext(".htaccess",
      `Redirect /Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html https://rr0.org/time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
    context.outputFile = outputFile
    await command.execute(context)
    expect(context.file.contents).toBe(
      `/Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html /time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
  })

  test("never carries anything over from what the output already held", async () => {
    // THE TEST THAT USED TO SAY THE OPPOSITE, and it is worth knowing why it was wrong. It handed
    // the command an output file already holding a [build] section and asserted the result kept it,
    // which passed — and could never happen in a real build, because a real output comes from
    // SsgContext.newOutput(), which builds a fresh empty one and does not read the file on disk. So
    // the "complete what is already there" behaviour was alive in the tests and dead in production,
    // and a site's hand-written configuration went missing twice with everything green.
    //
    // A trunk now comes from a named source file instead (see HtAccessReplaceCommand's preamble),
    // and the output's own former contents are no longer an input to anything.
    const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
    const context = testUtil.newContext(".htaccess",
      `Redirect /Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html https://rr0.org/time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
    context.outputFile = new FileContents("netlify.toml", "utf-8", `[build]
  publish = "out"
  command = "Echo deploying..."
`, new Date(), new FileContentsLang())
    await command.execute(context)
    expect(context.file.contents).toBe(
      `/Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html /time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
  })

  test("redirect directory to directory", async () => {
    const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
    const context = testUtil.newContext(".htaccess",
      `Redirect /science/crypto/ufologie https://rr0.org/science/crypto/ufo`)
    context.outputFile = outputFile
    await command.execute(context)
    expect(context.file.contents).toBe(`/science/crypto/ufologie/* /science/crypto/ufo/:splat`)
  })

  describe("redirect directory to directory", () => {

    test("with trailing slash", async () => {
      const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
      const context = testUtil.newContext(".htaccess",
        `Redirect /science/crypto/ufo/analyse/hypotheses/HET/ https://rr0.org/science/crypto/ufo/analyse/hypotheses/intelligence/HET/`)
      context.outputFile = outputFile
      await command.execute(context)
      expect(context.file.contents).toBe(
        `/science/crypto/ufo/analyse/hypotheses/HET/* /science/crypto/ufo/analyse/hypotheses/intelligence/HET/:splat`)
    })

    test("without trailing slash", async () => {
      const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
      const context = testUtil.newContext(".htaccess",
        `Redirect /science/crypto/ufologie https://rr0.org/science/crypto/ufo`)
      context.outputFile = outputFile
      await command.execute(context)
      expect(context.file.contents).toBe(`/science/crypto/ufologie/* /science/crypto/ufo/:splat`)
    })
  })
})
