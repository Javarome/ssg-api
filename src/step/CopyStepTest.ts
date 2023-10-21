import { CopyStep } from './CopyStep';
import { SsgContextImpl } from '../SsgContextImpl';
import { describe, expect, test } from '@javarome/testscript';

describe("CopyStep", () => {

  test("copy", async () => {
    const config = {outDir: "out/"}
    const copies = ['test/test.html', '**/*.bpmn'];
    const step = new CopyStep(copies, config)
    const context = new SsgContextImpl("fr")
    const result = await step.execute(context)
    expect(result).toEqual({files: ['out/test/test.html', 'test/dir/example.bpmn']});
  })
})
