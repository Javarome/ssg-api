import {BuiltInVars, SsgContext} from "./SsgContext"
import {HtmlLinks, HtmlMeta, HtmlSsgFile} from "./util/file/HtmlSsgFile"

type HtmlBuiltInVars = keyof HtmlMeta | keyof HtmlLinks

type AllHtmlBuiltInVars = BuiltInVars | HtmlBuiltInVars

export type HtmlVarProp<V> = keyof AllHtmlBuiltInVars | keyof V

export interface HtmlSsgContext<V = any> extends SsgContext<V> {

  inputFile: HtmlSsgFile

  outputFile: HtmlSsgFile

  getVar(varName: HtmlVarProp<V>): string | undefined

  setVar(varName: HtmlVarProp<V>, value: any): void
}
