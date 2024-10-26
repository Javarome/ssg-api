import { SsgContext } from "./SsgContext.js"
import { FileContents } from "@javarome/fileutil"

export type OutputFunc = (context: SsgContext, outputFile: FileContents) => Promise<void>
