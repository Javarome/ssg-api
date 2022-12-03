import {Logger} from "./Logger"

const NOP = () => {
}

const envLogLevels = process.env.LOG_LEVEL?.split(",") ?? ["info", "warn", "error"]

export interface LogConsole {
  log(...data: any[]): void

  debug(...data: any[]): void

  warn(...data: any[]): void

  error(...data: any[]): void
}

const defaultConsole = console

export class DefaultLogger implements Logger {

  readonly log = this.logLevels.includes("info") ? (...data: any[]) => this.console.log(this.name + ":", ...data) : NOP
  readonly debug = this.logLevels.includes("debug") ? (...data: any[]) => this.console.debug(this.name + ":",
    ...data) : NOP
  readonly warn = this.logLevels.includes("warn") ? (...data: any[]) => this.console.warn(this.name + ":",
    ...data) : NOP
  readonly error = this.logLevels.includes("error") ? (...data: any[]) => this.console.error(this.name + ":",
    ...data) : NOP

  constructor(public name: string, protected console: LogConsole = defaultConsole, protected logLevels = envLogLevels) {
  }
}
