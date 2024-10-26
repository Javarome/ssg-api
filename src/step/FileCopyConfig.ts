import { FileWriteConfig } from "../FileWriteConfig"
import { GlobOptionsWithFileTypesUnset } from "glob"

export interface FileCopyConfig extends FileWriteConfig {
  readonly sourcePatterns: string[]
  readonly options?: GlobOptionsWithFileTypesUnset
}
