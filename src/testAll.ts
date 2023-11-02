import { TestRunner } from '@javarome/testscript';

let runner = new TestRunner();
runner.run().then(result => {
  console.log('Executed', result.suites.length, 'test suites in', runner.durationStr(result.duration));
});
