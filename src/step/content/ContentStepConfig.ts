import { SsgContext } from '../../SsgContext';
import { ReplaceCommand } from './replace';
import { SsgFile } from '../../util';

export type ContentStepConfig<C extends SsgContext = SsgContext> = {
  /**
   * The glob roots of contents to process.
   */
  roots: string[],

  /**
   * The replacements to process on contents.
   */
  replacements: ReplaceCommand<C>[],

  /**
   * @param context
   * @return the file where to output.
   */
  getOutputFile(context: C): SsgFile
}
