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
 const context = new SsgContextImpl("fr")

new Ssg(config)
        .add(new ContentStep(contentConfigs, outputFunc))
        .add(dir1SubdirectoriesStep)
        .add(dir2SubdirectoriesStep)
        .add(...anArrayOfSteps)
        .add(new CopyStep(copiesToDo))
        .start(context)
        .then(result => console.log("Completed", result))
        .catch(err => console.error(err, context.inputFile.name, "=>", context.outputFile.name))
```

#### Extensibility

You can create:

- **your own steps** by implementing the [SsgStep](https://github.com/Javarome/ssg-api/blob/main/src/step/SsgStep.ts) interface.
- **your own context** by implementing the [SsgContext](https://github.com/Javarome/ssg-api/blob/main/src/SsgContext.ts) interface,
  typically to provide additional info to the custom .

### Replacements

In the case of a [ContentStep](https://github.com/Javarome/ssg-api/blob/main/src/step/content/ContentStep.ts), predefined replacements are also available:

- [RegexReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/RegexReplaceCommand.ts) executes a [RegexReplacer](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/RegexReplacer.ts) as long it changes the contents of the current file.
  - [StringEchoVarReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/StringEchoVarReplaceCommand.ts) replaces variables expressed as template literals (`${varName}`) in the input files.
  - [SsiEchoVarCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/html/ssi/SsiEchoVarCommand.ts)
- [DomReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/DomReplaceCommand.ts) replaces a [DomReplacer](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/DomReplacer.ts) on all nodes matched by a DOM selector.
- [HtAccessReplaceCommand](https://github.com/Javarome/ssg-api/blob/main/src/step/content/replace/htaccess/HtAccessReplaceCommand.ts) replaces `.htaccess` sections.
