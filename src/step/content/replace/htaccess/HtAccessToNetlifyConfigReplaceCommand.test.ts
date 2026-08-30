import { describe, expect, test } from "@javarome/testscript"
import { testUtil } from "../../../../../test/TestUtil.js"
import { HtAccessToNetlifyConfigReplaceCommand } from "./HtAccessToNetlifyConfigReplaceCommand.js"
import { FileContents, FileContentsLang } from "@javarome/fileutil"
import { rm, writeFile } from "fs/promises"
import os from "os"
import path from "path"

describe("HtAccessToNetlifyConfigReplaceCommand", () => {

  const outputFile = new FileContents("out/netlify.toml", "utf-8", "", new Date(), new FileContentsLang())

  describe("the invariable trunk", () => {

    const TRUNK = `[[redirects]]
  from = "https://elsewhere.example/*"
  to = "https://rr0.org/somewhere/:splat"
  status = 301
  force = true
`

    async function generate(preambleFile?: string): Promise<string> {
      const command = new HtAccessToNetlifyConfigReplaceCommand("https://rr0.org/", preambleFile)
      const context = testUtil.newContext(".htaccess", `Redirect /old.html https://rr0.org/new.html`)
      context.outputFile = outputFile
      await command.execute(context)
      return context.file.contents as string
    }

    test("stands ahead of everything the .htaccess generates", async () => {
      // What .htaccess cannot say and a host still needs: a status, a force, an absolute URL on
      // another domain. It used to live in the generated file itself and be wiped by every build.
      const preamble = path.join(os.tmpdir(), "ssg-preamble-trunk.toml")
      await writeFile(preamble, TRUNK, "utf-8")
      try {
        const contents = await generate(preamble)
        expect(contents.startsWith(TRUNK)).toBe(true)
        expect(contents.includes(`from = "/old.html"`)).toBe(true)
      } finally {
        await rm(preamble, {force: true})
      }
    })

    test("says in the output where it stops, so nobody edits the wrong half", async () => {
      const preamble = path.join(os.tmpdir(), "ssg-preamble-banner.toml")
      await writeFile(preamble, TRUNK, "utf-8")
      try {
        const contents = await generate(preamble)
        const banner = contents.indexOf("generated from .htaccess on every build")
        expect(banner > -1).toBe(true)
        // Between the two halves, and in neither of them.
        expect(banner > contents.indexOf("elsewhere.example")).toBe(true)
        expect(banner < contents.indexOf(`from = "/old.html"`)).toBe(true)
      } finally {
        await rm(preamble, {force: true})
      }
    })

    test("refuses to build at all when the trunk it was told about is missing", async () => {
      // The whole point. Dropping the trunk in silence is the failure being fixed here — it is how
      // a site lost its hand-written redirects and its CORS headers twice without a word.
      let thrown: unknown
      try {
        await generate(path.join(os.tmpdir(), "ssg-preamble-that-does-not-exist.toml"))
      } catch (e) {
        thrown = e
      }
      expect(thrown === undefined).toBe(false)
    })

    test("generates exactly as before when no trunk is named", async () => {
      const contents = await generate()
      expect(contents).toBe(`[[redirects]]
  from = "/old.html"
  to = "/new.html"

`)
    })
  })

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

  test("add CORS headers", async () => {
    const command = new HtAccessToNetlifyConfigReplaceCommand("https://rr0.org/")
    const header1 = `Access-Control-Allow-Origin`
    const value1 = `"*"`
    const context = testUtil.newContext(".htaccess",
      `Header add ${header1} ${value1}`)
    context.outputFile = outputFile
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(`[[headers]]
  for = "/*"
  [headers.values]
    ${header1} = ${value1}

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
