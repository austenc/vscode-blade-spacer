# Change Log
### [Unreleased]

- Fix npm install issues
- Fix console errors when translating selections
- Add support for Twig syntax `{# #}` and `{% %}`

### 2.1.3

- Fixed npm vulnerabilities
- Use async/await to fix interaction with some extensions - #17

### 2.1.2

- Fixed npm vulnerability

### 2.1.1

- Fixed issues noted in [#14](https://github.com/austenc/vscode-blade-spacer/issues/14)

### 2.1.0

- Automatically enable `editor.autoClosingBrackets` for blade and html language types
- Fixed greedy regex for `{{ }}` and `{!! !!}` tag pairs - #11

### 2.0.2

- Fixed bug causing issues with other extensions, thanks @KapitanOczywisty!

### 2.0.1

- Fixed bug with comment and unescaped tag types when making from existing `{{`

### 2.0.0

- Dropped support for `{{{ }}}` tags
- Improved how extension activates, should be more performant
- Fixed https://github.com/austenc/vscode-blade-spacer/issues/3
- Fixed https://github.com/austenc/vscode-blade-spacer/issues/4

### 1.0.2

- Fixed an issue that caused extraneous brackets when cursor at the beginning of a comment - #2

### 1.0.1

- Added workaround for braces not matching when a trailing quote or angle bracket exists - see Microsoft/vscode#35197

### 1.0.0

- Improved support for multi cursor and selection wrapping
- Fixed multi cursor undo problem
- Added support for triple brace syntax
- Added support for comment syntax

### 0.1.0

- Initial version supporting `{{` and `{!!` tags. Buggy, but it's a start!
