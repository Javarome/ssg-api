import { SsgStep } from './SsgStep';
import { SsgConfig } from '../Ssg';
import { SsgContext } from '../SsgContext';
import { FileUtil } from '../util';
import * as process from 'process';
import { IOptions } from 'glob';

export type CopyStepResult = {
  files: string[]
}

/**
 * Perform copies to out directory.
 */
export class CopyStep<C extends SsgContext = SsgContext> implements SsgStep<C, CopyStepResult> {

  readonly name = 'copy';

  constructor(protected copies: string[], protected config: SsgConfig, protected options?: IOptions) {
  }

  async execute(context: SsgContext): Promise<CopyStepResult> {
    const copies: string[] = this.copies;
    const dest = this.config.outDir;
    try {
      context.log('Copying to', dest, copies);
      const copiedFiles = await FileUtil.ssgCopy(dest, copies, this.options);
      const cwd = process.cwd();
      const files = copiedFiles.map(file => file.startsWith(cwd) ? file.substring(cwd.length + 1) : file);
      return {files};
    } catch (e) {
      throw Error(`Could not copy ${copies} because of ${e}`);
    }
  }
}
