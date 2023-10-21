import { TestRunner } from '@javarome/testscript';

new TestRunner().run().then(result => {
  console.log('Executed', result.suites.length, 'test suites in', result.duration, 'ms');
});
