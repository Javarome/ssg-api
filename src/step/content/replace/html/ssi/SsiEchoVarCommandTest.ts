import { SsiEchoVarReplaceCommand } from "./SsiEchoVarCommand"
import { RegexReplacer } from "../../RegexReplacer"
import { HtmlSsgContext } from "../../../../../HtmlSsgContext"
import { testUtil } from "../../../../../../test/TestUtil"
import { describe, expect, test } from "@javarome/testscript"

describe("SsiEchoVarReplaceCommand", () => {

  test("replace a var", async () => {
    const command = new class extends SsiEchoVarReplaceCommand {
      protected async createReplacer(context: HtmlSsgContext): Promise<RegexReplacer> {
        return {
          replace(_match: string, ..._args: any[]): string {
            let inputFile = context.file
            return inputFile.title || inputFile.name
          }
        }
      }
    }("title")
    const context = testUtil.newHtmlContext("index.html",
      `<title>RR0</title><h1 class="full-page"><!--#echo var="title" --></h1>`)
    await command.execute(context)
    expect(context.file.contents).toBe(`<title>RR0</title><h1 class="full-page">RR0</h1>`)
  })
})
