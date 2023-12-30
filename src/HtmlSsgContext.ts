import {SsgContext} from "./SsgContext"
import {HtmlSsgFile} from './util'

export interface HtmlSsgContext<V = any> extends SsgContext<V> {

  inputFile: HtmlSsgFile

  outputFile: HtmlSsgFile

  getVar(varName: string): string | undefined

  setVar(varName: string, value: any): void
}
