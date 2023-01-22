# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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

- `SsgFileLang.variants` can contain `""` if there is the same file is found without language suffix.

## [1.2.5] - 2022-11-13

### Fixed

- Publish src

## [1.2.4] - 2022-11-13

### Fixed

- `SsgFile.lang.variants` don't include current `SsgFile.lang.lang`

## [1.2.3] - 2022-11-13

### Fixed

- Find `SsgFile.lang.variants` for path with no directory.

## [1.2.2] - 2022-11-13

### Added

- `DomReplaceCommand` now accepts a second Context type parameter, to allow it to query custom context members without casting.

## [1.2.1] - 2022-11-13

### Removed

- Unnecessary dependency.

## [1.2.0] - 2022-11-13

### Changed

- `SsgFile.lang` changed from a single string to a `{ lang, variants }` so that you can know which variants of a file exist.

## [1.1.1] - 2022-11-11

### Fixed

- Parsing of HTML files

### Added

- ContentStep test.

## [1.1.0] - 2022-11-11

This release adds API consistency and generalization, as well as a number of tests.

_However it contains a regression that prevents HTML files to be parsed, so use 1.1.1+ instead._

### Added

- `SsgFile.readOrNew()` to allow creating a SsgFile in memory that doesn't exist on disk.

### Changed

- `FileInfo` renamed as `SsgFile` to both improve consistency and avoid name collisions.
- `HtmlFileInfo` renamed as `HtmlSsgFile` for the same reasons.
- `writeFileInfo()` becomes `ssgFile.write()`
- `getFileInfo()` becomes `SsgFile.read()`
- `SsgContext.locale` becomes a single string (not an array of strings anymore) as you cannot output for multiple languages at once (use one context per language if you need to do so).

### Fixed

- Ability to use any variables names in a context.

### Regressions

- HTML are not parsed anymore.
