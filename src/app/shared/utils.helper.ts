import { CommandOptions, ContextMenuItem } from "../../../app/main";
import { ContextMenuItemActionType } from "../core/services/electron/git.service";
import { ElectronableModalData } from "../home/modals/electronable-modal-base/electronable-modal-base.component";

export function startsWith(wholeText: string, whatWithStarts: string): boolean {
    if (!wholeText) return false;
    return wholeText.substring(0, whatWithStarts.length) == whatWithStarts;
}

export function shortHash(hash: string): string {
    return hash.substring(0, 7);
}

export function all<T>(collection: T[], predicate: (value: T, index: number, array: T[]) => boolean): boolean {
    return collection.filter(predicate).length === collection.length;
}

export function none<T>(collection: T[], predicate: (value: T, index: number, array: T[]) => boolean): boolean {
    return collection.filter(predicate).length === 0;
}

export function ceItem(label: string, action: ContextMenuItemActionType, options: { actionContent?: string, path?: string, nested?: ContextMenuItem[], modalData?: ElectronableModalData, commandOptions?: CommandOptions }): ContextMenuItem {
    return {
        label: label,
        action: action,
        actionContent: options.actionContent,
        path: options.path,
        nested: options.nested ?? [],
        modalData: options.modalData,
        commandOptions: options.commandOptions,
    }
}