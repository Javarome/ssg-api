type logMethod = { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }

export interface Logger {
  log: logMethod
  debug: logMethod
  warn: logMethod
  error: logMethod
}
