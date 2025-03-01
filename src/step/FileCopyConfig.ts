import { FileWriteConfig } from "../FileWriteConfig.js"
import { GlobOptionsWithFileTypesUnset } from "glob"

export abstract class FileCopyConfig extends FileWriteConfig {
  readonly sourcePatterns: string[] = []
  readonly options?: GlobOptionsWithFileTypesUnset
}
