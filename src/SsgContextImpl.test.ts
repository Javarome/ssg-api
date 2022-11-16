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

  test("change name", () => {
    const context = new SsgContextImpl<MyVars>("fr", {})
    expect(context.name).toBe(SsgContextImpl.DEFAULT_NAME)
    let newName = "New name"
    context.name = newName
    expect(context.name).toBe(newName)
    expect(context.logger.name).toBe(newName)
  })
})
