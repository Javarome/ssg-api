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

  test("don't use existing output if same file", async () => {
    const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
    const fileName = ".htaccess"
    const context = testUtil.newContext(fileName,
      `Redirect /Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html https://rr0.org/time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
    context.outputFile = new FileContents(`out/${fileName}`, "utf-8", "", new Date(), new FileContentsLang())
    await command.execute(context)
    expect(context.file.contents).toBe(
      `/Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html /time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
  })

  test("append on existing output file", async () => {
    const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
    const context = testUtil.newContext(".htaccess",
      `Redirect /Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html https://rr0.org/time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
    const existingOutputContents = `[build]
  publish = "out"
  command = "Echo deploying..."
`
    context.outputFile = new FileContents("netlify.toml", "utf-8", existingOutputContents, new Date(),
      new FileContentsLang())
    await command.execute(context)
    expect(context.file.contents).toBe(existingOutputContents +
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
