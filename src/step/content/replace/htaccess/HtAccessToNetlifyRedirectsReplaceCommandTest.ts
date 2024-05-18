import { HtAccessToNetlifyRedirectsReplaceCommand } from "./HtAccessToNetlifyRedirectsReplaceCommand"
import { testUtil } from "../../../../../test/TestUtil"
import { describe, expect, test } from "@javarome/testscript"

describe("HtAccessToNetlifyRedirectsReplaceCommand", () => {

  test("redirect html file to html file", async () => {
    const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
    const context = testUtil.newContext(".htaccess",
      `Redirect /Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html https://rr0.org/time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
    await command.execute(context)
    expect(context.file.contents).toBe(
      `/Documents/Articles/Vallee/1990_5ArgumentsContreHET_Vallee_fr.html /time/1/9/9/0/Vallee_5ArgumentsAgainstTheExtraterrestrialOriginOfUnidentifiedFlyingObjects/index_fr.html`)
  })

  test("redirect directory to directory", async () => {
    const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
    const context = testUtil.newContext(".htaccess",
      `Redirect /science/crypto/ufologie https://rr0.org/science/crypto/ufo`)
    await command.execute(context)
    expect(context.file.contents).toBe(`/science/crypto/ufologie/* /science/crypto/ufo/:splat`)
  })

  describe("redirect directory to directory", () => {

    test("with trailing slash", async () => {
      const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
      const context = testUtil.newContext(".htaccess",
        `Redirect /science/crypto/ufo/analyse/hypotheses/HET/ https://rr0.org/science/crypto/ufo/analyse/hypotheses/intelligence/HET/`)
      await command.execute(context)
      expect(context.file.contents).toBe(
        `/science/crypto/ufo/analyse/hypotheses/HET/* /science/crypto/ufo/analyse/hypotheses/intelligence/HET/:splat`)
    })

    test("without trailing slash", async () => {
      const command = new HtAccessToNetlifyRedirectsReplaceCommand("https://rr0.org/")
      const context = testUtil.newContext(".htaccess",
        `Redirect /science/crypto/ufologie https://rr0.org/science/crypto/ufo`)
      await command.execute(context)
      expect(context.file.contents).toBe(`/science/crypto/ufologie/* /science/crypto/ufo/:splat`)
    })
  })
})
