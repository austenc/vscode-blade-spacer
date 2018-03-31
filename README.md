# laravel-blade-spacer

A VSCode extension to automatically space blade templating markers. 
For example, typing `{{}}` would automatically make `{{ | }}`.

## Features

Currently only `{{` and `{!!` tags are supported, but pull requests are always welcome!

![Extension Preview](img/preview.gif)

## Known Issues
> **Currently only the regular `{{` tag works with selections**
 - Brace matching / end brace does not work inside quotes (working on this)
 - Undo sometimes acts strangely when wrapping multiple selections

## Release Notes

Users appreciate release notes as you update your extension.

### 0.1.0
Initial version supporting `{{` and `{!!` tags