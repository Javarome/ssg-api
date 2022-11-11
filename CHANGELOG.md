# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.0] - To be released

### Changed

- context variables scoped
    - under `context.` prefix to avoid collision with JS variables.
        - under reserved prefixes for each built-in object (like `context.inputFile`, etc.)

## [1.1.0] - 2022-11-11

This release adds API consistency and generalization, as well as a number of tests.

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
