import * as assert from "node:assert"

export class ObjectUtil {

  static isUndefined(obj: any): boolean {
    return obj === void 0
  }

  static isNotSet(obj?: any): boolean {
    return ObjectUtil.isUndefined(obj) || obj === null
  }

  static asSet<T>(obj?: T | null | undefined, msg?: string): T {
    assert.ok(!this.isNotSet(obj), msg)
    return obj!
  }
}
