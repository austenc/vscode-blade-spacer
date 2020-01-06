'use strict';

import {
  window,
  workspace,
  SnippetString,
  Range,
  Position,
  Selection,
  ExtensionContext,
  TextDocument,
  TextEditor
} from 'vscode';

// TODO:
// - change "look before" offset to match tag type

export function activate(context: ExtensionContext) {
  const triggers = ['{}', '!', '-', '{'];
  const expressions = [
    /({{)([^\s].*?)?(}})/,
    /({!!)(.*?)?(})/,
    /({{\s--)(.*?)?(}})/
  ];
  const spacer = new Spacer();
  let tagType: number = -1;

  context.subscriptions.push(
    workspace.onDidChangeTextDocument(e => {
      let editor = window.activeTextEditor;
      if (!editor) {
        return;
      }

      let ranges: Array<Range> = [];
      let offsets: Array<number> = [];

      // changes (per line) come in right-to-left when we need them left-to-right
      e.contentChanges.reverse().forEach(change => {
        let charsBefore: number = 1;

        if (triggers.indexOf(change.text) !== -1) {
          if (!offsets[change.range.start.line]) {
            offsets[change.range.start.line] = 0;
          }

          // some tags need more characters to be matched from the start
          if (change.text === '!') {
            charsBefore = 2;
          } else if (change.text === '-') {
            charsBefore = 4;
          }

          let start = change.range.start.translate(
            0,
            offsets[change.range.start.line] - charsBefore
          );
          let lineEnd = e.document.lineAt(start.line).range.end;
          expressions.forEach((expression, index) => {
            let match = expression.exec(
              e.document.getText(new Range(start, lineEnd))
            );

            if (match) {
              tagType = index;
              ranges.push(
                new Range(start, start.translate(0, match[0].length))
              );
              offsets[start.line] += match[1].length;
            }
          });
        }
      });

      if (ranges.length > 0) {
        spacer.replace(editor, tagType, ranges);
        ranges = [];
        tagType = -1;
      }
    })
  );
}

class Spacer {
  TAG_DOUBLE = 0;
  TAG_UNESCAPED = 1;
  TAG_COMMENT = 2;

  public replace(editor: TextEditor, tagType: number, ranges: Array<Range>) {
    if (tagType === this.TAG_DOUBLE) {
      editor.insertSnippet(
        new SnippetString('{{ ${1:${TM_SELECTED_TEXT/[{}]//g}} }}$0'),
        ranges
      );
    } else if (tagType === this.TAG_UNESCAPED) {
      editor.insertSnippet(
        new SnippetString('{!! ${1:${TM_SELECTED_TEXT/[{}!]//g}} !!}$0'),
        ranges
      );
    } else if (tagType === this.TAG_COMMENT) {
      editor.insertSnippet(
        new SnippetString('{{-- ${1:${TM_SELECTED_TEXT/[{}- ]//g}} --}}$0'),
        ranges
      );
    }
  }
}
