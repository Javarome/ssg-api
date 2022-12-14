import {DefaultLogger, LogConsole} from "./DefaultLogger"

class TestConsole implements LogConsole {
  _info: any[] = []
  _debug: any[] = []
  _error: any[] = []
  _warn: any[] = []

  log(...data: any[]) {
    this._info.push(data)
  }

  debug(...data: any[]): void {
    this._debug.push(data)
  }

  error(...data: any[]): void {
    this._error.push(data)
  }

  warn(...data: any[]): void {
    this._warn.push(data)
  }
}

describe("DefaultLogger", () => {

  test("default log levels", () => {
    const console = new TestConsole()
    const name = "test logger"
    const logger = new DefaultLogger(name, console)
    const someInfo = "some info"
    logger.log(someInfo)
    expect(console._info).toEqual([[name + ":", someInfo]])
  })

  test("error only", () => {
    const console = new TestConsole()
    const name = "test logger"
    const logger = new DefaultLogger(name, console, ["error"])
    const someInfo = "some info"
    logger.log(someInfo)
    expect(console._info).toEqual([])
    const someError = "some error"
    logger.error(someError)
    expect(console._error).toEqual([[name + ":", someError]])
  })
})
