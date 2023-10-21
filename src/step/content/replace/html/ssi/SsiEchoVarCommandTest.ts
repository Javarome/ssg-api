import { SsiEchoVarReplaceCommand } from './SsiEchoVarCommand';
import { RegexReplacer } from '../../RegexReplacer';
import { HtmlSsgContext } from '../../../../../HtmlSsgContext';
import { testUtil } from '../../../../../../test/TestUtil';
import { describe, expect, test } from '@javarome/testscript';

describe("SsiEchoVarReplaceCommand", () => {

  test("", async () => {
    const command = new class extends SsiEchoVarReplaceCommand {
      protected async createReplacer(context: HtmlSsgContext<any>): Promise<RegexReplacer> {
        return {
          replace(_match: string, ..._args: any[]): string {
            let inputFile = context.inputFile
            return inputFile.title || inputFile.name
          }
        }
      }
    }("title")
    const context = testUtil.newHtmlContext("index.html",
      `<title>RR0</title><h1 class="full-page"><!--#echo var="title" --></h1>`)
    const output = await command.execute(context)
    expect(output.contents).toBe(`<title>RR0</title><h1 class="full-page">RR0</h1>`)
  })
})
