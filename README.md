# Laravel Blade Spacer

An extension to automatically add spacing to blade templating markers. 

## Features
Supports the following tags:
- `{{  }}`
- `{!!  !!}`
- `{{--  --}}`

![Extension Preview](img/preview.gif)

## Known Issues
 - Wrapping selected text with `{!!  !!}` and `{{--  --}}` tags doesn't work. PR welcomed! 

## Release Notes

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

