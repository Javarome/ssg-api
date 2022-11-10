import {CopyStep} from "./CopyStep"
import {SsgContextImpl} from "../SsgContextImpl"

describe("CopyStep", () => {

  test("copy", async () => {
    const config = {outDir: "out/"}
    const copies = ["src/test/test.htm"]
    const copyStep = new CopyStep(copies, config)
    const context = new SsgContextImpl("fr")
    const copyResult = await copyStep.execute(context)
    expect(copyResult).toEqual({filesCount: 1})
  })
})
