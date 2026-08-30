import { describe, expect, test } from "vitest"
import { SsgContextImpl } from "./SsgContextImpl.js"
import { ConsoleLogger } from "./ConsoleLogger"

interface MyVars {
  someVar?: string
  name?: string
}

describe("SsgContextImpl", () => {

  test("no file", () => {
    const context = new SsgContextImpl<MyVars>("fr")
    expect(() => context.file).toThrow("Should have a file")
  })

  test("bug", () => {
    const locale = "fr"
    const currentFile = undefined
    const context = new SsgContextImpl(locale, new Map(), "RR0", new ConsoleLogger("RR0"), currentFile)
    expect(context.locale).toBe("fr")
  })

  test("sets and gets variable", () => {
    const myVars = new Map([["someVar", undefined]])
    const context = new SsgContextImpl<MyVars>("fr", myVars)
    const value = "someValue"
    context.setVar("someVar", value)
    expect(context.getVar("someVar")).toBe(value)
  })

  test("sets and gets context variable", () => {
    const myVars = new Map([["_name", "some name"]])
    const context = new SsgContextImpl("fr", myVars)
    expect(context.getVar("_name")).toBeDefined()
    expect(context.getVar("$context._name")).toBe("Ssg")
  })

  test("change name", () => {
    const context = new SsgContextImpl<MyVars>("fr")
    expect(context.name).toBe(SsgContextImpl.DEFAULT_NAME)
    let newName = "New name"
    context.name = newName
    expect(context.name).toBe(newName)
    expect(context.logger.name).toBe(newName)
  })

  test("push and pop", () => {
    const context = new SsgContextImpl<MyVars>("fr")
    expect(context.name).toBe(SsgContextImpl.DEFAULT_NAME)
    const hierarchicalName = SsgContextImpl.DEFAULT_NAME
    expect(context.logger.name).toBe(hierarchicalName)
    {
      const subName1 = "Sub name 1"
      context.push(subName1)
      expect(context.name).toBe(subName1)
      const hierarchicalName1 = SsgContextImpl.DEFAULT_NAME + ":" + subName1
      expect(context.logger.name).toBe(hierarchicalName1)
      {
        const subName2 = "Sub name 2"
        context.push(subName2)
        expect(context.name).toBe(subName2)
        const hierarchicalName2 = `${SsgContextImpl.DEFAULT_NAME}:${subName1}:${subName2}`
        expect(context.logger.name).toBe(hierarchicalName2)
      }
      context.pop()
      expect(context.name).toBe(subName1)
      expect(context.logger.name).toBe(hierarchicalName1)
    }
    context.pop()
    expect(context.name).toBe(SsgContextImpl.DEFAULT_NAME)
    expect(context.name).toBe(hierarchicalName)
    expect(context.logger.name).toBe(hierarchicalName)
  })

  describe("newOutput", () => {
    test("a different output file starts empty rather than inheriting the source's contents", () => {
      const context = new SsgContextImpl<MyVars>("fr")
      Object.assign(context, {file: {name: ".htaccess", contents: "Options +Indexes"}})
      const output = context.newOutput("netlify.toml")
      expect(output.contents).toBe("")
    })

    test("the same output file (in-place edit) inherits the source's current contents", () => {
      const context = new SsgContextImpl<MyVars>("fr")
      Object.assign(context, {file: {name: "style.css", contents: "body { color: red }"}})
      const output = context.newOutput("out/style.css")
      expect(output.contents).toBe("body { color: red }")
    })
  })

  describe("clone", () => {
    test("unread file", () => {
      const context = new SsgContextImpl<MyVars>("fr")
      const name = "FAQ.html"
      const file = {name, lastModified: new Date(2023, 10, 8, 17, 21, 50)}
      Object.assign(context, {file})
      const clone = context.clone()
      expect(clone.file.name).toBe(name)
      expect(clone.locale).toBe("fr")
    })
  })
})
