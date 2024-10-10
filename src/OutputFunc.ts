import { SsgContext } from "./SsgContext.js"
import { FileContents } from "./file/index.js"

export type OutputFunc = (context: SsgContext, outputFile: FileContents) => Promise<void>
