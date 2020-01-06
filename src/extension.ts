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
// - fix multiple instances on single line multi selection bug (multiple selections?)
// - split spacer into its own file?

export function activate(context: ExtensionContext) {
  const spacer = new Spacer();
  const triggers = ['{}', '!', '-', '{'];

  context.subscriptions.push(
    workspace.onDidChangeTextDocument(e => {
      // Make sure we have an editor to work with
      const editor = window.activeTextEditor;
      if (!editor) {
        return;
      }

      let ranges: Array<Range> = [];
      let offsets: Array<number> = [];

      // reverse here so we can calculate line offsets
      e.contentChanges.reverse().forEach(change => {
        if (triggers.indexOf(change.text) !== -1) {
          const regex = /({{)([^\s].*?)?(}})/;

          if (!offsets[change.range.start.line]) {
            offsets[change.range.start.line] = 0;
          }

          // find the next match after change start)
          const start = change.range.start.translate(
            0,
            offsets[change.range.start.line] - 1
          );
          const lineEnd = e.document.lineAt(start.line).range.end;
          const match = regex.exec(
            e.document.getText(new Range(start, lineEnd))
          );

          if (match) {
            let offsetStart = start.translate(0, offsets[start.line]);
            ranges.push(new Range(start, start.translate(0, match[0].length)));
            offsets[start.line] += 2;
          }
        }
      });

      if (ranges.length > 0) {
        editor.insertSnippet(
          new SnippetString('{{ ${1:${TM_SELECTED_TEXT/[{}]//g}} }}$0'),
          ranges
        );
      }
    })
  );
}

class Spacer {}

// this method is called when your extension is deactivated
export function deactivate() {}
