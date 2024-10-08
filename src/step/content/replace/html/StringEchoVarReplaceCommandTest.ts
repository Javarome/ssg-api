import { describe, expect, test } from "@javarome/testscript"
import { testUtil } from "../../../../../test/TestUtil.js"
import { StringEchoVarReplaceCommand } from "./StringEchoVarReplaceCommand.js"

describe("StringEchoVarReplaceCommand", () => {

  test("replaces var in string", async () => {
    const command = new StringEchoVarReplaceCommand("mail")
    const context = testUtil.newHtmlContext("Contact.html",
      `<a href="mailto:\$\{mail\}">Ecrire à \$\{mail\}</a>`)
    context.setVar("mail", "javarome@gmail.com")
    expect(context.getVar("mail")).toBe("javarome@gmail.com")
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(`<a href="mailto:javarome@gmail.com">Ecrire à javarome@gmail.com</a>`)
  })

  test("replaces alls var in string", async () => {
    const command = new StringEchoVarReplaceCommand()
    const context = testUtil.newHtmlContext("Contact.html",
      `<script>
var x = 12; console.log('x = \${x}')
</script>
<a href="mailto:\$\{mail\}">Ecrire à \$\{mail\}</a>`)
    context.setVar("mail", "javarome@gmail.com")
    expect(context.getVar("mail")).toBe("javarome@gmail.com")
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(`<script>
var x = 12; console.log('x = \${x}')
</script>
<a href="mailto:javarome@gmail.com">Ecrire à javarome@gmail.com</a>`)
  })
})
