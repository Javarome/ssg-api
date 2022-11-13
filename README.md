# ssg-api [![CircleCI](https://dl.circleci.com/status-badge/img/gh/Javarome/ssg-api/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/Javarome/ssg-api/tree/main)

TypeScript API to generate output files from input files.

It can be used to generate:

- **a static website** from HTML templates (but those templates can include client-side JavaScript and CSS of course).
- (and/or) **other files** such as configuration files (for instance converting an `.htaccess` file to a `netlify.toml` file)

To install `ssg-api` as a project dependency:

```
npm install --save ssg-api
```

Then import the required types to implement your own SSG code:

```ts
import {Ssg, SsgContextImpl, SsgConfig} from "ssg-api"

const config: SsgConfig = {outDir: "out"}
const ssg = new Ssg(config)
        .add(firstStep)
        .add(nextStep)

const context = new SsgContextImpl("fr", {})
try {
  const result = await ssg.start(context)
  console.log("Completed", result)
} catch (e) {
  console.error(err, context.inputFile.name, "=>", context.outputFile.name)
}
```

[Steps](https://github.com/Javarome/ssg-api/wiki/Steps) can do anything, you can implement your owns; but there are predefined ones.
Check the [documentation](https://github.com/Javarome/ssg-api/wiki) for more.
