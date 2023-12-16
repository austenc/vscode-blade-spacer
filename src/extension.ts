'use strict'

import {
  window,
  workspace,
  SnippetString,
  Range,
  ExtensionContext,
  TextEditor,
  TextDocument,
  TextDocumentContentChangeEvent,
  commands
} from 'vscode'

export function activate(context: ExtensionContext) {
  const triggers = ['{}', '!', '-', '{', '%', '#']
  const expressions = [
    /({{(?!\s|-))(.*?)(}})/,
    /({!!(?!\s))(.*?)?(}?)/,
    /({{[\s]?--)(.*?)?(}})/,
    /({%(?!\s))(.*?)?(}?)/,
    /({#(?!\s))(.*?)?(}?)/,
  ]
  const spacer = new Spacer()
  let tagType: number = -1

  context.subscriptions.push(
    workspace.onDidChangeTextDocument(async e => {
      let editor = window.activeTextEditor
      if (!editor) {
        return
      }

      let ranges: Array<Range> = []
      let offsets: Array<number> = []

      // changes (per line) come in right-to-left when we need them left-to-right
      e.contentChanges
        .slice()
        .reverse()
        .forEach(change => {
          if (triggers.indexOf(change.text) !== -1) {
            if (!offsets[change.range.start.line]) {
              offsets[change.range.start.line] = 0
            }

            let start = change.range.start.translate(
              0,
              offsets[change.range.start.line] -
                spacer.charsForChange(e.document, change)
            )

            let lineEnd = e.document.lineAt(start.line).range.end

            for (let i = 0; i < expressions.length; i++) {
              // if we typed a - or a !, don't consider the "double" tag type
              if (
                i === spacer.TAG_DOUBLE &&
                ['-', '!'].indexOf(change.text) !== -1
              ) {
                continue
              }

              // Only look at unescaped tags if we need to
              if (i === spacer.TAG_UNESCAPED && change.text !== '!') {
                continue
              }

              // Only look at unescaped tags if we need to
              if (i === spacer.TAG_COMMENT && change.text !== '-') {
                continue
              }

              let tag = expressions[i].exec(
                e.document.getText(new Range(start, lineEnd))
              )

              if (tag) {
                tagType = i
                ranges.push(new Range(start, start.translate(0, tag[0].length)))
                offsets[start.line] += tag[1].length
              }
            }
          }
        })

      if (ranges.length > 0) {
        await spacer.replace(editor, tagType, ranges)
        try {
          await commands.executeCommand('extension.vim_escape')
          await commands.executeCommand("extension.vim_insert");
        } catch (error) {}
        ranges = []
        tagType = -1
      }
    })
  )
}

class Spacer {
  TAG_DOUBLE = 0
  TAG_UNESCAPED = 1
  TAG_COMMENT = 2
  TAG_TWIG_PER = 3
  TAG_TWIG_HASH = 4

  public charsForChange(
    doc: TextDocument,
    change: TextDocumentContentChangeEvent
  ) {
    if (change.text === '!') {
      return 2
    } else if (change.text === '-') {
      let textRange = doc.getText(
        new Range(
          change.range.start.translate(0, -2),
          change.range.start.translate(0, -1)
        )
      )
      if (textRange === ' ') {
        return 4
      }
      return 3
    }
    return 1
  }

  public replace(editor: TextEditor, tagType: number, ranges: Array<Range>) {
    if (tagType === this.TAG_DOUBLE) {
      return editor.insertSnippet(
        new SnippetString('{{ ${1:${TM_SELECTED_TEXT/[{}]//g}} }}$0'),
        ranges
      )
    } else if (tagType === this.TAG_UNESCAPED) {
      return editor.insertSnippet(
        new SnippetString('{!! ${1:${TM_SELECTED_TEXT/[{} !]//g}} !!}$0'),
        ranges
      )
    } else if (tagType === this.TAG_COMMENT) {
      return editor.insertSnippet(
        new SnippetString('{{-- ${1:${TM_SELECTED_TEXT/(--)|[{} ]//g}} --}}$0'),
        ranges
      )
    } else if (tagType === this.TAG_TWIG_PER) {
      return editor.insertSnippet(
        new SnippetString('{% $1 %}$0'),
        ranges
      )
    } else if (tagType === this.TAG_TWIG_HASH) {
      return editor.insertSnippet(
        new SnippetString('{# $1 #}$0'),
        ranges
      )
    }
  }
}
