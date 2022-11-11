import {SsgContextImpl} from "./SsgContextImpl"

interface MyVars {
  someVar?: string
}

describe("SsgContextImpl", () => {

  test("sets and gets variable", () => {
    const myVars: MyVars = {someVar: undefined}
    const context = new SsgContextImpl<MyVars>("fr", myVars)
    const value = "someValue"
    context.setVar("someVar", value)
    expect(context.getVar("someVar")).toBe(value)
  })
})
