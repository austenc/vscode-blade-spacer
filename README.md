# Laravel Blade Spacer

An extension to automatically add spacing to blade templating markers. 
For example, typing `{{}}` would generate `{{  }}`.

## Features
Supports the following tags:
- `{{  }}`
- `{{{  }}}`
- `{!!  !!}`
- `{{--  --}}`

![Extension Preview](img/preview.gif)

## Known Issues
 - Wrapping selected text with `{!!  !!}` and `{{--  --}}` tags doesn't work yet. 

## Release Notes

### 1.0.0
- Improved support for multi cursor and selection wrapping
- Fixed multi cursor undo problem
- Added support for triple brace syntax
- Added support for comment syntax

### 0.1.0
- Initial version supporting `{{` and `{!!` tags. Buggy, but it's a start!

