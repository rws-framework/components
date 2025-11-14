import { DragHandlers, DropHandlers } from './types';

export class HandlerManager {
    private dragStartHandlers: Map<HTMLElement, (event: DragEvent) => void> = new Map();
    private dragEndHandlers: Map<HTMLElement, (event: DragEvent) => void> = new Map();
    private dragOverHandlers: Map<HTMLElement, (event: DragEvent) => void> = new Map();
    private dropHandlers: Map<HTMLElement, (event: DragEvent) => void> = new Map();
    private dragLeaveHandlers: Map<HTMLElement, (event: DragEvent) => void> = new Map();

    /**
     * Store drag handlers for an element
     */
    storeDragHandlers(element: HTMLElement, handlers: DragHandlers): void {
        this.dragStartHandlers.set(element, handlers.dragStart);
        this.dragEndHandlers.set(element, handlers.dragEnd);
    }

    /**
     * Store drop handlers for an element
     */
    storeDropHandlers(element: HTMLElement, handlers: DropHandlers): void {
        this.dragOverHandlers.set(element, handlers.dragOver);
        this.dragLeaveHandlers.set(element, handlers.dragLeave);
        this.dropHandlers.set(element, handlers.drop);
    }

    /**
     * Remove drag event handlers from element
     */
    removeDragHandlers(element: HTMLElement): void {
        const dragStartHandler = this.dragStartHandlers.get(element);
        const dragEndHandler = this.dragEndHandlers.get(element);

        if (dragStartHandler) {
            element.removeEventListener('dragstart', dragStartHandler);
            this.dragStartHandlers.delete(element);
        }

        if (dragEndHandler) {
            element.removeEventListener('dragend', dragEndHandler);
            this.dragEndHandlers.delete(element);
        }
    }

    /**
     * Remove drop event handlers from element
     */
    removeDropHandlers(element: HTMLElement): void {
        const dragOverHandler = this.dragOverHandlers.get(element);
        const dragLeaveHandler = this.dragLeaveHandlers.get(element);
        const dropHandler = this.dropHandlers.get(element);

        if (dragOverHandler) {
            element.removeEventListener('dragover', dragOverHandler);
            this.dragOverHandlers.delete(element);
        }

        if (dragLeaveHandler) {
            element.removeEventListener('dragleave', dragLeaveHandler);
            this.dragLeaveHandlers.delete(element);
        }

        if (dropHandler) {
            element.removeEventListener('drop', dropHandler);
            this.dropHandlers.delete(element);
        }
    }

    /**
     * Get all elements with drag handlers
     */
    getDragElements(): HTMLElement[] {
        return Array.from(this.dragStartHandlers.keys());
    }

    /**
     * Get all elements with drop handlers
     */
    getDropElements(): HTMLElement[] {
        return Array.from(this.dropHandlers.keys());
    }

    /**
     * Clear all handlers
     */
    clearAll(): void {
        // Remove all drag handlers
        for (const element of this.getDragElements()) {
            this.removeDragHandlers(element);
        }

        // Remove all drop handlers
        for (const element of this.getDropElements()) {
            this.removeDropHandlers(element);
        }
    }
}
