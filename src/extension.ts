'use strict';

import { window, Range, Position, Selection, Disposable, ExtensionContext, TextEditor } from 'vscode';

export function activate(context: ExtensionContext) {

    console.log('The "Laravel Blade Spacer" extension is now active!');

    let spacer = new Spacer();
    let controller = new SpacerController(spacer);

    context.subscriptions.push(spacer);
    context.subscriptions.push(controller);
}

class Spacer {

    public space(editor: TextEditor) {
        let selections = editor.selections;
        let document = editor.document;
        let shrink = false;

        editor.edit(edit => {

            for (let i = 0; i < selections.length; i++) {
                let start = selections[i].start;
                let selected = document.getText(new Range(selections[i].start, selections[i].end));

                let first = document.getText(new Range(
                    start,
                    new Position(start.line, start.character + 1)
                ));
                let before = document.getText(new Range(
                    new Position(start.line, Math.max(start.character - 2, 0)), 
                    start
                ));

                if (before === '{{' && first !== ' ') {                
                    edit.replace(selections[i], ' ' + selected + ' ');
                    shrink = true;
                }
            }
        }, { undoStopBefore: false, undoStopAfter: true })
        
        .then(success => {
            if (success && shrink) {
                editor.selections = editor.selections.map(selection => {
                    return new Selection(
                        new Position(selection.start.line, selection.start.character + 1),
                        new Position(selection.end.line, Math.max(selection.end.character - 1, 0))
                    );
                });

                shrink = false;
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