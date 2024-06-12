# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.10.5..6] - 2024-06-12

### Fixed

- ConsoleLogger export

## [1.10.3] - 2024-06-10

### Fixed

- Don't display warning if detected encoding but no declared encoding

## [1.10.3] - 2024-06-09

### Fixed

- Leave literal template unchanged if no var is found with this name.

## [1.10.1] - 2024-06-03

### Fixed

- Regression when using a var name in VarRegexReplacer.

## [1.10.0] - 2024-06-03

### Changed

- the `VarRegexReplacer` used by `StringEchoVarReplaceCommand` and `SsiEchoVarCommand` defaults to generic replacements when no variable name is specified.

## [1.9.1] - 2024-05-20

### Changed

- `DirectoryStep.config` visibility to public readonly.

### Fixed

- `CopyStep` now uses its config `outDir`.

## [1.9.0] - 2024-05-20

### Changed

- `SsgConfig.outDir` is now `SsgConfig.getOutputPath(context)`
- All steps configs now extend `SsgConfig` to benefit from output path resolution.

## [1.8.0] - 2024-05-18

### Changed

- `SsgContext.inputFile` and `SsgContext.inputFile` are replaced by `SsgContext.file`

## [1.7.7] - 2024-05-17

### Changed

- `ContentStepConfig.getOutputFile(context)` can now return FileContents or file path

## [1.7.6] - 2024-05-17

### Changed

- `SsgContext.setOutputFrom(filename)` instead of `SsgContext.setOutputFrom(filename)` to unify apis.

### Fixed

- make sure context `inputFile` and `outputFile` are assigned.

## [1.7.5] - 2024-05-15

### Changed

- `SsgContext.read(filename)` becomes `SsgContext.getInputFrom(filename)` to denote it affects the context's `inputFile`.
- `SsgContext.readOrNew(filename, dir)` becomes `SsgContext.setOutputFrom(filename)` to denote it affects the context's `outputFile`.
- `HtmlFileContents.create(fileInfo, fileContents)` becomes `HtmlFileContents.create(fileInfo)` to denote it uses `fileInfo`'s `contents`.

## [1.7.4] - 2024-04-13

### Fixed

HTML lang overrides lang from filename.

## [1.7.3] - 2024-04-10

### Fixed

Update document title from FileContents title.

### Changed

`ContentStep.processFile()` hasn't `fileCount` parameter anymore and returns a `boolean`.

## [1.7.2] - 2024-02-22

### Changed

Replaced native charset detection by JS one.

## [1.7.0] - 2024-01-17

### Added

Add `generator` meta info as `ssg-api` by default.

### Fixed

Serialize meta info.

## [1.6.0] - 2023-12-10

### Added

`ReplaceCommand.contentStepEnd()` callback when the relevant ContentStep is terminating.

## [1.5.2] - 2023-11-02

### Fixed

`FileUtil.ssgCopy()` removed `cpy` dependency which has a bug causing output dir not always applied.

## [1.5.1] - 2023-10-21

### Fixed

Replaced jest by testscript

## [1.5.0] - 2023-09-16

### Added

- HtmlFileContents:meta.description

## [1.4.5] - 2023-04-23

### Fixed

- Create files from context sets outputfile

## [1.4.4] - 2023-04-23

### Fixed

- Read files from context now read HTML files as such.

## [1.4.3] - 2023-04-23

### Fixed

- Read files from context now read HTML files as such.

## [1.4.2] - 2023-01-22

### Fixed

- Remove duplicated spaces, carriage returns and tabs from HTML titles.

## [1.4.1] - 2023-01-21

### Added

- Overridable method to allow processing a content file.

## [1.4.0] - 2023-01-21

### Added

- Process only files that have been updated after output.

## [1.3.2] - 2023-01-14

### Fixed

- Angular replacement of {{6000|number}} failure with 'Could not find variable "6000"'

## [1.3.1] - 2023-01-14

### Changed

- Exported `Logger` and `DefaultLogger`

## [1.3.0] - 2022-12-04

### Changed

- context variables scoped
    - under `$context.` prefix to avoid collision with JS variables.
        - under reserved prefixes for each built-in object (like `$context._name`, `$context.inputFile.name`, etc.)

## [1.2.13] - 2022-12-03

### Fixed

- `DefaultLogger` uses levels from `process.env.LOG_LEVEL` split with comma.

## [1.2.12] - 2022-12-03

### Changed

- Make `DomReplaceCommand.postExecute()` async.

## [1.2.11] - 2022-12-03

### Added

- `DomReplaceCommand.postExecute()` can be overriden to execute some operation after some given replacements have been performed.

## [1.2.10] - 2022-11-27

### Added

- `SsgContext.document` and `SsgContext.serialize()` to avoid using deprecated JSDOM-dependent `SsgContext.dom`.

### Fixed

- TagReplaceCommand is now the DOM implementation. Deprecated Regex implementation is renamed as such.
- Avoid redundancing in Ssg logs

## [1.2.9] - 2022-11-27

### Added

- TagReplaceCommand, a DomReplacement to ease replacement of tags by name.
- Nested contexts with `push()` and `pop()`, reflected in logs.

### Changed

- TagReplaceCommand, a DomReplacement to ease replacement of tags by name.
- More parameterable context type in Ssg.

## [1.2.8] - 2022-11-20

### Changed

- change `ContentStep.processFile` visibility from `private` to `protected` to allow more fine-tuned specialization.

## [1.2.7] - 2022-11-16

### Added

- `Logger.name` is the context name to be displayed before a log.
- `SsgContext.logger` is the logger object used to perform context.logs. `DefaultLogger` will be used by `SsgContextImpl` unless another `Logger` implementation is provided at construction.

### Fixed

- Changing `context.name` will change context's logger's name as well.

## [1.2.6] - 2022-11-13

### Added

- `FileContentsLang.variants` can contain `""` if there is the same file is found without language suffix.

## [1.2.5] - 2022-11-13

### Fixed

- Publish src

## [1.2.4] - 2022-11-13

### Fixed

- `FileContents.lang.variants` don't include current `FileContents.lang.lang`

## [1.2.3] - 2022-11-13

### Fixed

- Find `FileContents.lang.variants` for path with no directory.

## [1.2.2] - 2022-11-13

### Added

- `DomReplaceCommand` now accepts a second Context type parameter, to allow it to query custom context members without casting.

## [1.2.1] - 2022-11-13

### Removed

- Unnecessary dependency.

## [1.2.0] - 2022-11-13

### Changed

- `FileContents.lang` changed from a single string to a `{ lang, variants }` so that you can know which variants of a file exist.

## [1.1.1] - 2022-11-11

### Fixed

- Parsing of HTML files

### Added

- ContentStep test.

## [1.1.0] - 2022-11-11

This release adds API consistency and generalization, as well as a number of tests.

_However it contains a regression that prevents HTML files to be parsed, so use 1.1.1+ instead._

### Added

- `FileContents.readOrNew()` to allow creating a FileContents in memory that doesn't exist on disk.

### Changed

- `FileInfo` renamed as `FileContents` to both improve consistency and avoid name collisions.
- `HtmlFileInfo` renamed as `HtmlFileContents` for the same reasons.
- `writeFileInfo()` becomes `FileContents.write()`
- `getFileInfo()` becomes `FileContents.read()`
- `SsgContext.locale` becomes a single string (not an array of strings anymore) as you cannot output for multiple languages at once (use one context per language if you need to do so).

### Fixed

- Ability to use any variables names in a context.

### Regressions

- HTML are not parsed anymore.
