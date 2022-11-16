type logMethod = { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }

export interface Logger {
  name: string
  log: logMethod
  debug: logMethod
  warn: logMethod
  error: logMethod
}
