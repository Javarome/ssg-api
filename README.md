# ssg-api

TypeScript API to generate a static website.

- [Setup](#Setup)
  - [Testing](#Testing)
- [Concepts](#Concepts)
  - [Step](#Step)
    - [ContentStep](#ContentStep)
      - [Replacements](#Replacements)
  - [Context](#Context)
- [Examples](#Examples)

## Setup

Install `ssg-api` as a project dependency:

```
npm install --save ssg-api
```

Then import the required types to implement your own SSG code:

```ts
import {Ssg, SsgContextImpl, SsgConfig} from "ssg-api"

const config: SsgConfig = {outDir: "out"}
const ssg = new Ssg(config)
        .add(firstStep)
        .add(nextStep)  // See "Concepts" for a description of steps

const context = new SsgContextImpl("fr")
try {
  const result = await ssg.start(context)
  console.log("Completed", result)
} catch (e) {
  console.error(err, context.inputFile.name, "=>", context.outputFile.name)
}
```

### Testing

`ssg-api` is a provided as a native ESM package, so it may [not be supported by all test frameworks out of the box](https://stackoverflow.com/a/66279352/650104).

For instance, [Jest will require some specifics](https://jestjs.io/fr/docs/ecmascript-modules) in its `jest.config.js` to transform the package code (here as ts-jest config):

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

## Concepts

### Steps

The [Ssg](https://github.com/Javarome/ssg-api/blob/main/src/Ssg.ts) execute a number of [Step](https://github.com/Javarome/ssg-api/blob/main/src/step/SsgStep.ts)s, sequentially.
A Step can do anything and return its own results.

Some predefined steps are provided:

- [CopyStep](https://github.com/Javarome/ssg-api/blob/main/src/step/CopyStep.ts) copies files;
- [ContentStep](#Contentstep) executes a series of [ReplaceCommands](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/ReplaceCommand.ts), sequentially.
- [DirectoryStep](https://github.com/Javarome/ssg-api/blob/main/src/step/DirectoryStep.ts) completes a template based on sub-directories, sequentially (to produce a listing of them, typically).

Example:

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
        .start(context)
```

You can create **your own steps** by implementing the [SsgStep](https://github.com/Javarome/ssg-api/blob/main/src/step/SsgStep.ts) interface.

#### ContentStep

A [ContentStep](https://github.com/Javarome/ssg-api/blob/main/src/step/content/ContentStep.ts) is parameterized by its `ContentStepConfig`s.
Each of these configs specifies how the ContentStep will:

1. gather each file from its specified `roots`.
2. execute its `replacements` on each of them, until the file doesn't change anymore.
3. saves the modified file contents in according to its `outputSpec`.

##### Replacements

ContentStep replacements are classes implementing the [`ReplaceCommand`](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/ReplaceCommand.ts) interface,
so **you can define your own replacements**.

A number predefined replace commands are also available:

- Abstract classes mutualize the basics of different replacement techniques:
  - [RegexReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/RegexReplaceCommand.ts) runs a [RegexReplacer](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/RegexReplacer.ts) as long it changes the contents of the current file.
  - [DomReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/DomReplaceCommand.ts) runs a [DomReplacer](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/DomReplacer.ts) on all nodes matched by a DOM selector.
  - [HtAccessReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/htaccess/HtAccessReplaceCommand.ts) replaces sections of an `.htaccess` file.
- Concrete classes specialize those techniques to achieve concrete goals, such as:
  - ~~[HtmlTagReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/tag/HtmlTagReplaceCommand.ts) replaces HTML tags using Regexes (use DOM version instead if you have inner tags).~~
  - ~~[ClassRegexReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/class/ClassRegexReplaceCommand.ts) replaces HTML tags bearing a specific class using Regexes (use DOM version instead if you have inner tags).~~
  - [SsiLastModifiedReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiLastModifiedReplaceCommand.ts) replaces a SSI last-modified directive with the input file's last modified date.
  - [SsiIncludeReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiIncludeReplaceCommand.ts) replaces a SSI #include directive with the specified file contents.
  - [SsiIfReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiIfReplaceCommand.ts) replaces a SSI #if directive with some content or another, depending on the truthyness of the expression.
  - [StringEchoVarReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/StringEchoVarReplaceCommand.ts) replaces variables expressed as template literals (`${varName}`) in the input files.
  - [SsiSetVarCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiSetVarCommand.ts) sets a context variable from the template (which can be checked by the `SsiIfReplaceCommand` or displayed by the `SsiEchoVarCommand`).
  - [SsiEchoVarCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiEchoVarCommand.ts)

and others in the repository (you'll find a number of [SSI](https://fr.wikipedia.org/wiki/Server_Side_Includes) ones because RR0 used to rely on them).

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

### Context

A [SsgContext](https://github.com/Javarome/ssg-api/blob/main/src/SsgContext.ts) is provided to Ssg methods (`SsgStep.execute(content)` and `ReplaceCommand.execute(context)`) to carry information about :

- the current `locale`(s)
- the current `inputFile` that has been read
- the current `outputFile` that is about to be written
- current values of **variables** values (through `getVar()`) that may have been set by current or previous replacements (through `setVar()`).

It also provides utility logging methods (`log()`/`warn()`/`error()`/`debug()`) and a `clone()` method.

You can create **your own context** by implementing the [SsgContext](https://github.com/Javarome/ssg-api/blob/main/src/SsgContext.ts) interface
(typically to provide custom info to custom steps).

## Examples

`ssg-api` has been developed to generate the [RR0 website](https://rr0.org),
so [its repository](https://github.com/RR0/rr0.org) is a good place to find examples.

A good place to start is to look at RR0's [build source code](https://github.com/RR0/rr0.org/blob/master/build.ts) to see
how it initializes and run its configuration, comprised of:

- a [TimeReplaceCommand](https://github.com/RR0/rr0.org/blob/master/time/TitleReplaceCommand.ts) to replace `<time>yyyy-mm-dd hh:mm</time>` tags with links to a page about that very date.
- a [PlaceReplacer](https://github.com/RR0/rr0.org/blob/master/place/PlaceReplacer.ts) to be used through a `ClassDomReplaceCommand("place", new PlaceReplacerFactory(placeService))` to replace `<span class="place">Paris (France)</span>` tags with a clickable tag to display the map of the mentioned place.
- a [OutlineReplaceCommand](https://github.com/RR0/rr0.org/blob/master/outline/OutlineReplaceCommand.ts) to insert an outline of the current HTML page.
- a [LinkReplaceCommand](https://github.com/RR0/rr0.org/blob/master/LinkReplaceCommand.ts) to insert navigation links matching the `"start"`, `"contents"`, `"prev"` and `"next"` relationships of the current HTML page.
- a [CopyStep]() to copy images in the output dir;
- a [RR0SsgContext](https://github.com/RR0/rr0.org/blob/master/RR0SsgContext.ts) specializes `SsgContextImpl` aht adds access to locale-specific messages and time context.
- a [AnchorReplaceCommand](https://github.com/RR0/rr0.org/blob/master/anchor/AnchorReplaceCommand.ts) to add trailing slash to links and a `target="_blank"` if the url is outside of the current website.
- a [CaseDirectoryStep](https://github.com/RR0/rr0.org/blob/master/science/crypto/ufo/enquete/dossier/CaseDirectoryStep.ts) and [PeopleDirectoryStep](https://github.com/RR0/rr0.org/blob/master/people/PeopleDirectoryStep.ts) to generate live indexes of UFO cases and people subdirectories.
