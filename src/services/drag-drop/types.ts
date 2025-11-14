import { RWSViewComponent } from '@rws-framework/client';

export interface DragData<T> {
    element: HTMLElement;
    data: T;
    type: string;
    onDropOut?: DropOutCallback
}

export interface DropZone<T> {
    element: HTMLElement;
    accepts: string[];
    onDrop?: (dragData: DragData<T>, dropZone: DropZone<T>) => void;
}
export interface DragHandlers {
    dragStart: (event: DragEvent) => void;
    dragEnd: (event: DragEvent) => void;
}

export interface DropHandlers {
    dragOver: (event: DragEvent) => void;
    dragLeave: (event: DragEvent) => void;
    drop: (event: DragEvent) => void;
}

export interface DragDropEventDetail {
    element: HTMLElement;
    data: any;
    type: string;
}

export interface DropEventDetail<T> {
    dragData: DragData<T>;
    dropZone: DropZone<T>;
    targetElement: HTMLElement;
}

export type DropOutCallback = <T>(dragData: DragData<T>) => Promise<void> | void;

export interface IDragOpts {
    getDragElementData: (element: HTMLElement) => DragData<any>;
    dragElementType: string;
    onDropOut?: DropOutCallback;
}
