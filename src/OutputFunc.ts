import { SsgContext } from "./SsgContext.js"
import { FileContents } from "./util/index.js"

export type OutputFunc = (context: SsgContext, outputFile: FileContents) => Promise<void>
