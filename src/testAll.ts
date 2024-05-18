import { TestRunner } from "@javarome/testscript"

let runner = new TestRunner(["**/*Test.ts"], ["node_modules/**/*.*"])
runner.run().then(result => {
  console.log('Executed', result.suites.length, 'test suites in', runner.durationStr(result.duration));
});
