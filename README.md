# Laravel Blade Spacer

An extension to automatically add spacing to blade templating markers.

## Features

Supports the following tags:

- `{{ }}`
- `{!! !!}`
- `{{-- --}}`
- `{% %}`
- `{# #}`

![Extension Preview](img/preview.gif)

## Known Issues

- Wrapping selected text with `{!! !!}`, `{{-- --}}`, `{% %}`, or `{# #}` tags doesn't work

## Configuration

The extension can be configured by adding the following settings to your `settings.json` file:

### Twig Templating

The extension includes support for Twig templates (`{%  %}` and `{#  #}`) out of the box, but can be disabled by adding the following setting to your `settings.json` file:
```json
"bladeSpacer.enableTwig": false,
```

## Release Notes

See the [changelog](CHANGELOG.md) for more information.
