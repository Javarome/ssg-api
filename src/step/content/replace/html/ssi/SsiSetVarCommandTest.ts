import { SsiSetVarReplaceCommand } from "./SsiSetVarCommand"
import { testUtil } from "../../../../../../test/TestUtil"
import { describe, expect, test } from "@javarome/testscript"

describe("SsiVarCommand", () => {

  test("replaces title var", async () => {
    const command = new SsiSetVarReplaceCommand("title",
      (_match: string, ...args: any[]) => `<title>${args[0]}</title>`)
    const context = testUtil.newHtmlContext("org/eu/fr/asso/spepse/projet/Magonia.html",
      `<!--#set var="title" value="Le projet Magonia" -->`)
    await command.execute(context)
    expect(context.file.contents).toBe(`<title>Le projet Magonia</title>`)
  })

  test("replaces url var", async () => {
    const command = new SsiSetVarReplaceCommand("url",
      (_match: string, ...args: any[]) => `<meta name="url" content="${args[0]}"/>`)
    const context = testUtil.newHtmlContext("org/eu/fr/dn/gendarmerie/index.html",
      `<!--#set var="url" value="https://www.defense.gouv.fr/gendarmerie/" -->`)
    await command.execute(context)
    expect(context.file.contents).toBe(`<meta name="url" content="https://www.defense.gouv.fr/gendarmerie/"/>`)
  })
})
