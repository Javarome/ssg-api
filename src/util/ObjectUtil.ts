export class ObjectUtil {

  static isUndefined(obj: any): boolean {
    return obj === void 0
  }

  static isNotSet(obj?: any): boolean {
    return ObjectUtil.isUndefined(obj) || obj === null
  }

  static asSet<T>(obj?: T | null | undefined, msg: string = "value is not set"): T {
    if (this.isNotSet(obj)) {
      throw new Error(msg)
    }
    return obj!
  }
}
