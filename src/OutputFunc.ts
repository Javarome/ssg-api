import { SsgContext } from "./SsgContext.js"
import { SsgFile } from "./util"

export type OutputFunc = (context: SsgContext, outputFile: SsgFile) => Promise<void>
