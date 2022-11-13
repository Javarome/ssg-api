import {testUtil} from "../../../../../test/TestUtil"
import {HtmlSsgFile} from "../../../../util/file/HtmlSsgFile"
import {StringEchoVarReplaceCommand} from "./StringEchoVarReplaceCommand"

describe("StringEchoVarReplaceCommand", () => {

  test("replaces var in string", async () => {
    const command = new StringEchoVarReplaceCommand("mail", [])
    const context = testUtil.newHtmlContext("Contact.html",
      `<a href="mailto:\$\{mail\}">Commentaires</a>`)
    context.setVar("mail", "javarome@gmail.com")
    expect(context.getVar("mail")).toBe("javarome@gmail.com")
    const file = await command.execute(context) as HtmlSsgFile
    expect(file.contents).toBe(`<a href="mailto:javarome@gmail.com">Commentaires</a>`)
  })
})

