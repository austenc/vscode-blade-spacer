'use strict';

import { window, SnippetString, Range, Position, Selection, Disposable, ExtensionContext, TextEditor, TextDocument } from 'vscode';

export function activate(context: ExtensionContext) {
    let spacer = new Spacer();
    let controller = new SpacerController(spacer);

    context.subscriptions.push(spacer);
    context.subscriptions.push(controller);
}

class Spacer {

    public measurements(document: TextDocument, selection: Selection) {
        return {
            start: selection.start,
            end: selection.end,
            selected: document.getText(new Range(selection.start, selection.end)),
            firstChar: document.getText(new Range(
                selection.start, 
                new Position(selection.start.line, selection.start.character + 1)
            )),
            twoBefore: document.getText(new Range(
                new Position(selection.start.line, Math.max(selection.start.character - 2, 0)),
                selection.start
            )),
            threeBefore: document.getText(new Range(
                new Position(selection.start.line, Math.max(selection.start.character - 3, 0)),
                selection.start
            )),
            fourBefore: document.getText(new Range(
                new Position(selection.start.line, Math.max(selection.start.character - 4, 0)),
                selection.start
            ))            
        };
    }

    public space(editor: TextEditor) {
        let selections = editor.selections;
        let document = editor.document;
        let tagType = '';

        for (let i = 0; i < selections.length; i++) {

            
            let s = this.measurements(document, selections[i]);
            if (s.twoBefore === '{{' && s.firstChar !== ' ') {
                tagType = 'double';
            }

            if (s.fourBefore === '{{ {' && s.firstChar !== ' ') {
                tagType = 'triple';
            }

            if (s.threeBefore === '{!!' && s.firstChar !== ' ') {
                tagType = 'unescaped';
            }

            if (s.fourBefore === '{{ -' && s.firstChar === ' ') {
                tagType = 'comment';
            }
        }

        if (tagType === 'double') {
            let allRanges = selections.map(value => {
                return new Range(value.start.line, value.start.character - 2, value.end.line, value.end.character + 2);
            });
            editor.insertSnippet(new SnippetString("{{ ${1:${TM_SELECTED_TEXT/[\{\}\ ]/$1/g}} }}$0"), allRanges);
        }

        if (tagType === 'triple') {
            let allRanges = selections.map(value => {
                return new Range(value.start.line, value.start.character - 4, value.end.line, value.end.character + 4);
            });
            editor.insertSnippet(new SnippetString("{{{ ${1:${TM_SELECTED_TEXT/[\{\}\ ]/$1/g}} }}}$0"), allRanges);
        }

        if (tagType === 'unescaped') {
            let allRanges = selections.map(value => {
                return new Range(value.start.line, value.start.character - 3, value.end.line, value.end.character + 1);
            });
            editor.insertSnippet(new SnippetString("{!! ${1:${TM_SELECTED_TEXT/[!\{\}\ ]/$1/g}} !!}$0"), allRanges);
        }

        if (tagType === 'comment') {
            let allRanges = selections.map(value => {
                return new Range(value.start.line, value.start.character - 4, value.end.line, value.end.character + 3);
            });
            editor.insertSnippet(new SnippetString("{{-- ${1:${TM_SELECTED_TEXT/[\-\{\}\ ]/$1/g}} --}}$0"), allRanges, {undoStopBefore: false, undoStopAfter: true});
        }

    }

    dispose() {
    
    }
}

class SpacerController {
    private spacer: Spacer;
    private disposable: Disposable;

    constructor(spacer: Spacer) {
        this.spacer = spacer;

        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);

        this.disposable = Disposable.from(...subscriptions);
    }

    private onEvent() {
        const editor = window.activeTextEditor;

        if (editor) {
            this.spacer.space(editor);
        }
    }

    public dispose() {
        this.disposable.dispose();
    }
}


// this method is called when your extension is deactivated
export function deactivate() {
}