import { CopyStep } from './CopyStep';
import { SsgContextImpl } from '../SsgContextImpl';
import { describe, expect, test } from '@javarome/testscript';
import path from 'path';

describe('CopyStep', () => {

  test('copy', async () => {
    const config = {outDir: 'out/'};
    const copies = ['**/test.html', '**/*.bpmn'];
    const step = new CopyStep(copies, config, {ignore: 'out/**'});
    const context = new SsgContextImpl('fr');
    const result = await step.execute(context);
    expect(result).toEqual(
      {files: [path.join(config.outDir, 'test/test.html'), path.join(config.outDir, 'test/dir/example.bpmn')]});
  });
});
