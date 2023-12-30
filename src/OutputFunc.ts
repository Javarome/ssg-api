import { SsgContext } from './SsgContext.js';
import { SsgFile } from './util/index.js';

export type OutputFunc = (context: SsgContext, outputFile: SsgFile) => Promise<void>
