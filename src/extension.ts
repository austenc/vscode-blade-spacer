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
      let tagType: string = '';
      e.contentChanges.forEach(change => {
        if (triggers.indexOf(change.text) !== -1) {
          // find a matching selection to where this change started
          let selection = spacer.matchingSelection(editor, change.range.start);
          if (selection) {
            tagType = spacer.tagType(e.document, selection);
            let range = spacer.rangeForTagType(selection, tagType);
            if (range) {
              ranges.push(range);
            }
          }
        }
      });

      // If we found a tag type, do the snippet replacement
      if (tagType !== '') {
        console.log('Total Ranges: ' + ranges.length);
        spacer.spaceForTag(editor, ranges, tagType);
      }
    })
  );
}

class Spacer {
  public textAt(anchor: Position, startOffset: number, endOffset: number) {
    let start = 0;
    if (anchor.character + startOffset > -1) {
      start = startOffset;
    }
    return new Range(
      anchor.translate(0, start),
      anchor.translate(0, endOffset)
    );
  }

  public rangeForTagType(selection: Selection, tagType: string) {
    if (tagType === 'double') {
      return new Range(
        selection.start.line,
        selection.start.character + 1,
        selection.end.line,
        selection.end.character + 1
      );
    } else if (tagType === 'triple') {
      return new Range(
        selection.start.line,
        selection.start.character - 1,
        selection.end.line,
        selection.end.character + 3
      );
    } else if (tagType === 'unescaped') {
      return new Range(
        selection.start.line,
        selection.start.character,
        selection.end.line,
        selection.end.character + 1
      );
    } else if (tagType === 'comment') {
      return new Range(
        selection.start.line,
        selection.start.character - 2,
        selection.end.line,
        selection.end.character + 2
      );
    }

    return false;
  }

  public matchingSelection(editor: TextEditor, start: Position) {
    return editor.selections.find(selection => selection.start.isEqual(start));
  }

  public tagType(document: TextDocument, selection: Selection) {
    let chars = {
      oneBefore: document.getText(this.textAt(selection.start, 0, 1)),
      twoBefore: document.getText(this.textAt(selection.start, -1, 1)),
      threeBefore: document.getText(this.textAt(selection.start, -2, 1)),
      fourBefore: document.getText(this.textAt(selection.start, -3, 1)),
      fiveBefore: document.getText(this.textAt(selection.start, -4, 1)),
      twoAfter: document.getText(this.textAt(selection.end, 1, 3))
    };

    if (
      chars.twoBefore === '{{' &&
      chars.threeBefore !== '{{ ' &&
      chars.twoAfter !== '--'
    ) {
      return 'double';
    }

    if (chars.fourBefore === '{{ {' && chars.oneBefore !== ' ') {
      return 'triple';
    }

    if (chars.threeBefore === '{!!' && chars.oneBefore !== ' ') {
      return 'unescaped';
    }

    if (chars.fiveBefore === '{{ --' && chars.oneBefore === '-') {
      return 'comment';
    }

    return '';
  }

  public spaceForTag(editor: TextEditor, ranges: Array<Range>, tag: string) {
    if (tag === 'double') {
      editor.insertSnippet(
        new SnippetString(' ${1:${TM_SELECTED_TEXT}} $0'),
        ranges
      );
    } else if (tag === 'triple') {
      editor.insertSnippet(
        new SnippetString('{ ${1:${TM_SELECTED_TEXT/[ {}]//g}} }$0'),
        ranges,
        { undoStopBefore: false, undoStopAfter: true }
      );
    } else if (tag === 'unescaped') {
      editor.insertSnippet(
        new SnippetString('! ${1:${TM_SELECTED_TEXT/[!{} ]/$1/g}} !!$0'),
        ranges
      );
    } else if (tag === 'comment') {
      editor.insertSnippet(
        new SnippetString('-- ${1:${TM_SELECTED_TEXT/[-{} ]/$1/g}} --$0'),
        ranges,
        { undoStopBefore: false, undoStopAfter: true }
      );
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
