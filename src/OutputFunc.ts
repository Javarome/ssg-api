import { SsgContext } from "./SsgContext.js"
import { FileContents } from "./util"

export type OutputFunc = (context: SsgContext, outputFile: FileContents) => Promise<void>
