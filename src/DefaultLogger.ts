import {Logger} from "./Logger"

const NOP = () => {
}

export class DefaultLogger implements Logger {

  readonly log = process.env.LOG_LEVEL === "none" ? NOP : (...data: any[]) => console.log(this.name + ":", ...data)
  readonly debug = process.env.LOG_LEVEL === "debug" ? (...data: any[]) => console.debug(this.name + ":", ...data) : NOP
  readonly warn = process.env.LOG_LEVEL === "warn" ? (...data: any[]) => console.warn(this.name + ":", ...data) : NOP
  readonly error = process.env.LOG_LEVEL === "error" ? (...data: any[]) => console.error(this.name + ":", ...data) : NOP

  constructor(public name: string) {
  }
}
