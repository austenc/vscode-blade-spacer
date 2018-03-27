'use strict';

import { window, commands, Disposable, ExtensionContext } from 'vscode';

const undoOptions = { undoStopBefore: false, undoStopAfter: true };

export function activate(context: ExtensionContext) {

    console.log('The "Laravel Blade Spacer" extension is now active!');

    let spacer = new Spacer();
    let controller = new SpacerController(spacer);

    context.subscriptions.push(spacer);
    context.subscriptions.push(controller);
}

class CursorMoveCommand {

    constructor(private to: string, private by?: string) {
    }

    public createCommand(args?: any) {
        let cursorMoveArgs: any = {
            to: this.to,
            by: this.by,
            value: args.repeat || 1,
            select: !!args.isVisual
        }
        return {
            commandId: 'cursorMove',
            args: cursorMoveArgs
        };
    }
}

class Spacer {
    public space() {
        const editor = window.activeTextEditor;
        let moveBy = false;

        if (! editor) {
            return;
        }

        editor.selections.map(selection => {
            let pos = selection.active;
            let line = editor.document.lineAt(pos.line).text;
            let before = line.slice(Math.max(pos.character - 2, 0), pos.character);
            let after = line.slice(pos.character, pos.character + 2);

            if (before === '{{' && after === '}}') {
                editor.edit(edit => {
                    edit.insert(pos, '  ');
                }, undoOptions);                

                moveBy = { to: 'left', by: 'character' }
            }
            
            return selection;
        });
        
        if (moveBy) {
            commands.executeCommand('cursorMove', moveBy)

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
        this.spacer.space();
    }

    public dispose() {
        this.disposable.dispose();
    }
}


// this method is called when your extension is deactivated
export function deactivate() {
}