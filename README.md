# ssg-api

TypeScript API to generate a static website.

ssg-api has been developed to generate the [RR0 website](https://rr0.org),
so you'll find examples of Steps and Replacers in [the website repository](https://github.com/RR0/rr0.org).

## Concepts

### Step

The [Ssg](https://github.com/Javarome/ssg-api/blob/main/src/Ssg.ts) execute a number of [Step](https://github.com/Javarome/ssg-api/blob/main/src/step/SsgStep.ts)s, sequentially.
A Step can do anything, but here are some pre-defined steps:

- [CopyStep](https://github.com/Javarome/ssg-api/blob/main/src/step/CopyStep.ts) copies files;
- [ContentStep](https://github.com/Javarome/ssg-api/blob/main/src/step/content/ContentStep.ts) executes a series of [ReplaceCommands](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/ReplaceCommand.ts), sequentially.
- [DirectoryStep](https://github.com/Javarome/ssg-api/blob/main/src/step/DirectoryStep.ts) performs operations on sub-directories, sequentially.

For instance:

```ts 
import {SsgConfig, SsgContextImpl, Ssg, ContentStep, CopyStep} from "ssg-api"

const config: SsgConfig = {outDir: "out"}
const context = new SsgContextImpl("fr")

new Ssg(config)
        .add(new ContentStep(contentConfigs, outputFunc))
        .add(dir1SubdirectoriesStep)
        .add(dir2SubdirectoriesStep)
        .add(...anArrayOfSteps)
        .add(new CopyStep(copiesToDo))
        .start(context)   // Start the generation
        .then(result => console.log("Completed", result))
        .catch(err => console.error(err, context.inputFile.name, "=>", context.outputFile.name))
```

#### Extensibility

You can create:

- **your own steps** by implementing the [SsgStep](https://github.com/Javarome/ssg-api/blob/main/src/step/SsgStep.ts) interface.
- **your own context** by implementing the [SsgContext](https://github.com/Javarome/ssg-api/blob/main/src/SsgContext.ts) interface,
  typically to provide additional info to the custom .

### Replacements

In the case of a [ContentStep](https://github.com/Javarome/ssg-api/blob/main/src/step/content/ContentStep.ts), predefined replacements are also available.
You'll find find a number of [SSI](https://fr.wikipedia.org/wiki/Server_Side_Includes) commands because the RR0 website used to rely on them.

- [RegexReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/RegexReplaceCommand.ts) executes a [RegexReplacer](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/RegexReplacer.ts) as long it changes the contents of the current file.
  - ~~[HtmlTagReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/tag/HtmlTagReplaceCommand.ts) replaces HTML tags using Regexes (use DOM version instead if you have inner tags).~~
  - ~~[ClassRegexReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/class/ClassRegexReplaceCommand.ts) replaces HTML tags bearing a specific class using Regexes (use DOM version instead if you have inner tags).~~
  - [SsiLastModifiedReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiLastModifiedReplaceCommand.ts) replaces a SSI last-modified directive with the input file's last modified date.
  - [SsiIncludeReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiIncludeReplaceCommand.ts) replaces a SSI #include directive with the specified file contents.
  - [SsiIfReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiIfReplaceCommand.ts) replaces a SSI #if directive with some content or another, depending on the truthyness of the expression.
  - [StringEchoVarReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/StringEchoVarReplaceCommand.ts) replaces variables expressed as template literals (`${varName}`) in the input files.
  - [SsiSetVarCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiSetVarCommand.ts) sets a context variable from the template (which can be checked by the `SsiIfReplaceCommand` or displayed by the `SsiEchoVarCommand`).
  - [SsiEchoVarCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiEchoVarCommand.ts)
- [DomReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/DomReplaceCommand.ts) replaces a [DomReplacer](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/DomReplacer.ts) on all nodes matched by a DOM selector.
- [HtAccessReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/htaccess/HtAccessReplaceCommand.ts) replaces `.htaccess` sections.

and others in the repository.

- For instance:

```ts 
const contentConfigs: ContentStepConfig[] = [
  {  // A content config that converts .htaccess to netlify.toml format
    roots: [".htaccess"],
    replacements: [new HtAccessToNetlifyConfigReplaceCommand("https://rr0.org/")],
    getOutputFile(context: SsgContext): FileInfo {
      return getFileInfo(context, "netlify.toml", "utf-8")
    }
  },
  {  // A content config that replaces parts in roots
    roots: ["index.html", "404.html", "pages/**/*.html"],
    replacements: [
      new SsiIncludeReplaceCommand(),
      new TitleReplaceCommand(),
      new StringEchoVarReplaceCommand("mail"),
      new AngularExpressionReplaceCommand(),
      new SsiEchoVarReplaceCommand("copyright"),
      new SsiIfReplaceCommand(),
      new SsiSetVarReplaceCommand("title", (match: string, ...args: any[]) => `<title>${args[0]}</title>`),
      new SsiLastModifiedReplaceCommand(context.time.options),
      new AuthorReplaceCommand(),
      new HtmlTagReplaceCommand("time", new MyTimeReplacerFactory()),
      new ClassRegexReplaceCommand("people", new MyPeopleClassReplacerFactory()),
      new ClassRegexReplaceCommand("part(.?)", new MyPartXReplacerFactory()),
      new LinkReplaceCommand(),
      new AnchorReplaceCommand("https://my.base.url/")
    ],
    getOutputFile(context: SsgContext): FileInfo {
      return context.inputFile  // Under output root, I don't want to change the file path.
    }
  }
]

new Ssg(config)
        .add(new ContentStep(contentConfigs, outputFunc))
        .start(context)   // Start the generation
        .then(result => console.log("Completed", result))
        .catch(err => console.error(err, context.inputFile.name, "=>", context.outputFile.name))
```

## Setup

Install the package as a dependency of your NodeJS app:

```
npm install --save ssg-api
```

Then import the required types to implement your own SSG tool.

## Testing

No that this is a native ESM package so it may not be supported by all test frameworks out of the box.

For instance, Jest will require some specifics in its `jest.config.js` to transform the package code (here as ts-jest config):

```js
/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transformIgnorePatterns: ["node_modules/(?!ssg-api)"],
  transform: {
    "^.+\\.[tj]s$": "ts-jest"
  }
}
```
