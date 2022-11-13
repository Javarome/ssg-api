export class AssertionError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class ObjectUtil {

  static isUndefined(obj: any): boolean {
    return obj === void 0
  }

  static isNotSet(obj?: any): boolean {
    return ObjectUtil.isUndefined(obj) || obj === null
  }

  static asSet<T>(obj?: T | null, msg?: string): T {
    if (this.isNotSet(obj)) {
      throw new AssertionError(msg ?? "value is not set")
    }
    return obj!
  }
}
