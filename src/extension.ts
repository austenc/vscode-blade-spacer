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

      e.contentChanges.forEach(change => {
        if (triggers.indexOf(change.text) !== -1) {
          const regex = /({{)(.*)(}})/g;

          console.log(
            e.document.getText(
              new Range(
                change.range.start,
                e.document.lineAt(change.range.start.line).range.end
              )
            )
          );

          // find the next match after change start
          const match = regex.exec(
            e.document.getText(
              new Range(
                change.range.start.translate(0, -1),
                e.document.lineAt(change.range.start.line).range.end
              )
            )
          );

          if (match) {
            console.log(match);
          }
        }
      });
    })
  );
}

class Spacer {}

// this method is called when your extension is deactivated
export function deactivate() {}
