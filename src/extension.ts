'use strict';

import { window, Range, Position, Selection, Disposable, ExtensionContext, TextEditor, TextDocument } from 'vscode';

export function activate(context: ExtensionContext) {

    console.log('The Laravel Blade Spacer extension is now active!');

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
        let offsetL = 1;
        let offsetR = 1;

        editor.edit(edit => {

            for (let i = 0; i < selections.length; i++) {

                let s = this.measurements(document, selections[i]);

                if (s.twoBefore === '{{' && s.firstChar !== ' ') {                
                    edit.replace(selections[i], ' ' + s.selected + ' ');
                    tagType = 'double';
                }

                if (s.threeBefore === '{!!' && s.firstChar !== ' ') {
                    edit.replace(selections[i], ' ' + s.selected + ' !!');
                    tagType = 'unescaped';
                    offsetR = 3;
                }
            }
        }, { undoStopBefore: false, undoStopAfter: false })
        
        .then(success => {
            if (success && tagType.length) {
                editor.selections = editor.selections.map(selection => {
                    return new Selection(
                        new Position(selection.start.line, selection.start.character + offsetL),
                        new Position(selection.end.line, Math.max(selection.end.character - offsetR, 0))
                    );
                });

                tagType = '';
            }
        });
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