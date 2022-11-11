import {ContextVarName, SsgContext} from "./SsgContext"
import {HtmlLinks, HtmlMeta, HtmlSsgFile} from "./util/file/HtmlSsgFile"

export type HtmlContextVarName = ContextVarName | keyof HtmlMeta | keyof HtmlLinks

export type HtmlVarName = HtmlContextVarName | keyof HtmlSsgFile

export interface HtmlSsgContext extends SsgContext {

  inputFile: HtmlSsgFile

  outputFile: HtmlSsgFile

  getVar(varName: HtmlVarName): string | undefined

  setVar(varName: HtmlVarName, value: any): void
}
