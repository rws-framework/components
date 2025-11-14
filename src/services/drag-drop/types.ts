import { RWSViewComponent } from '@rws-framework/client';

export interface DragData<T> {
    element: HTMLElement;
    data: T;
    type: string;
    onDropOut?: DropOutCallback;
    sortingOrder?: number;
    originalPosition?: number;
    originalOrder?: number;
    allItemsOrder?: Array<{id: string, order: number}>;
    intendedAfterElement?: HTMLElement | null;
    lastDropY?: number;
}

export interface DropZone<T> {
    element: HTMLElement;
    accepts: string[];
    onDrop?: (dragData: DragData<T>, dropZone: DropZone<T>, event?: DragEvent) => void;
    sortable?: boolean;
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
    sortable?: boolean;
}

export interface SortableDropZoneOptions<T> {
    sortable: boolean;
    calculateSortingOrder?: (dragData: DragData<T>, dropEvent: DragEvent, container: HTMLElement) => number;
}
