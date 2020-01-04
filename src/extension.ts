'use strict'

import * as vscode from 'vscode'

import {
  window,
  workspace,
  SnippetString,
  Range,
  Position,
  Selection,
  Disposable,
  ExtensionContext,
  TextEditor,
  TextDocument,
  Event,
  TextDocumentChangeEvent
} from 'vscode'

export function activate(context: ExtensionContext) {
  let spacer = new Spacer()

  context.subscriptions.push(
    workspace.onDidChangeTextDocument(e => {
      const triggers = ['{}', '!', '-', '{']
      e.contentChanges.forEach(change => {
        if (triggers.indexOf(change.text) !== -1) {
          spacer.space(e.document)
        }
      })
    })
  )
}

class Spacer {
  public measurements(document: TextDocument, selection: Selection) {
    return {
      start: selection.start,
      end: selection.end,
      selected: document.getText(
        new Range(
          selection.start.translate(0, 1),
          selection.end.translate(0, 1)
        )
      ),
      firstChar: document.getText(this.textAt(selection.start, 0, 1)),
      twoBefore: document.getText(this.textAt(selection.start, -1, 1)),
      threeBefore: document.getText(this.textAt(selection.start, -2, 1)),
      fourBefore: document.getText(this.textAt(selection.start, -3, 1)),
      charAfter: document.getText(this.textAt(selection.end, 1, 2)),
      twoAfter: document.getText(this.textAt(selection.end, 1, 3))
    }
  }

  protected textAt(anchor: Position, startOffset: number, endOffset: number) {
    let start = 0
    if (anchor.character + startOffset > -1) {
      start = startOffset
    }
    return new Range(anchor.translate(0, start), anchor.translate(0, endOffset))
  }

  public space(document: TextDocument) {
    const editor = window.activeTextEditor

    if (!editor) {
      return
    }

    let selections = editor.selections
    let tagType = ''
    let offsetEnd = 2

    selections.forEach(selection => {
      let s = this.measurements(document, selection)
      if (s.twoBefore === '{{' && s.firstChar !== ' ' && s.twoAfter !== '--') {
        tagType = 'double'
        if (s.twoAfter !== '}}') {
          offsetEnd = 0
        }
      }

      if (s.fourBefore === '{{ {' && s.firstChar !== ' ') {
        tagType = 'triple'
      }

      if (s.threeBefore === '{!!' && s.firstChar !== ' ') {
        tagType = 'unescaped'
        offsetEnd = 1

        if (s.charAfter !== '}') {
          offsetEnd = 0
        }
      }

      if (s.fourBefore === '{{ -' && s.firstChar === ' ') {
        tagType = 'comment'
      }
    })

    console.log(tagType)

    if (tagType === 'double') {
      let allRanges = selections.map(value => {
        return new Range(
          value.start.line,
          value.start.character - 1,
          value.end.line,
          value.end.character + 3
        )
      })
      editor.insertSnippet(
        new SnippetString('{{ ${1:${TM_SELECTED_TEXT/[{{|}}| }}]//g}} }}$0'),
        allRanges
      )
    }

    // if (tagType === 'doubleWithoutEnd') {
    //   let allRanges = selections.map(value => {
    //     return new Range(
    //       value.start.line,
    //       value.start.character - 2,
    //       value.end.line,
    //       value.end.character
    //     )
    //   })
    //   editor.insertSnippet(
    //     new SnippetString('{{ ${1:${TM_SELECTED_TEXT/[{} ]/$1/g}} }}$0'),
    //     allRanges
    //   )
    // }

    // if (tagType === 'triple') {
    //   let allRanges = selections.map(value => {
    //     return new Range(
    //       value.start.line,
    //       value.start.character - 4,
    //       value.end.line,
    //       value.end.character + 4
    //     )
    //   })
    //   editor.insertSnippet(
    //     new SnippetString('{{{ ${1:${TM_SELECTED_TEXT/[{} ]/$1/g}} }}}$0'),
    //     allRanges
    //   )
    // }

    // if (tagType === 'unescaped') {
    //   let allRanges = selections.map(value => {
    //     return new Range(
    //       value.start.line,
    //       value.start.character - 3,
    //       value.end.line,
    //       value.end.character + offsetEnd
    //     )
    //   })
    //   editor.insertSnippet(
    //     new SnippetString('{!! ${1:${TM_SELECTED_TEXT/[!{} ]/$1/g}} !!}$0'),
    //     allRanges
    //   )
    // }

    // if (tagType === 'comment') {
    //   let allRanges = selections.map(value => {
    //     return new Range(
    //       value.start.line,
    //       value.start.character - 4,
    //       value.end.line,
    //       value.end.character + 3
    //     )
    //   })
    //   editor.insertSnippet(
    //     new SnippetString('{{-- ${1:${TM_SELECTED_TEXT/[-{} ]/$1/g}} --}}$0'),
    //     allRanges,
    //     { undoStopBefore: false, undoStopAfter: true }
    //   )
    // }
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
