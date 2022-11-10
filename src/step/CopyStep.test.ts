import {CopyStep} from "./CopyStep"
import {SsgContextImpl} from "../SsgContextImpl"

describe("CopyStep", () => {

  test("copy", async () => {
    const config = {outDir: "out/"}
    const copies = ["src/test/test.html"]
    const step = new CopyStep(copies, config)
    const context = new SsgContextImpl("fr")
    const result = await step.execute(context)
    expect(result).toEqual({filesCount: 1})
  })
})
