import { describe, expect, test } from "@javarome/testscript"
import { ObjectUtil } from "./ObjectUtil"

describe("ObjectUtil", () => {

  test("check undefined", () => {
    expect(ObjectUtil.isUndefined(undefined)).toBe(true)
    expect(ObjectUtil.isUndefined(null)).toBe(false)
    expect(ObjectUtil.isUndefined("")).toBe(false)
    expect(ObjectUtil.isUndefined(0)).toBe(false)
  })

  test("check not set", () => {
    expect(ObjectUtil.isNotSet(undefined)).toBe(true)
    expect(ObjectUtil.isNotSet(null)).toBe(true)
    expect(ObjectUtil.isNotSet("")).toBe(false)
    expect(ObjectUtil.isNotSet(0)).toBe(false)
  })

  test("asSet", () => {
    expect(() => ObjectUtil.asSet(null, "This is not set")).toThrow("This is not set")
    expect(ObjectUtil.asSet(12)).toBe(12)
    expect(() => ObjectUtil.asSet(undefined)).toThrow("value is not set")
    expect(() => ObjectUtil.asSet(null)).toThrow("value is not set")
  })
})
