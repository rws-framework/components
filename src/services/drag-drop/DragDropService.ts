import { RWSInject, RWSService, RWSViewComponent } from '@rws-framework/client';
import { DragData, DropZone, IDragOpts } from './types';

import { EventManager } from './EventManager';
import { HandlerManager } from './HandlerManager';

class DragDropService extends RWSService {
    private currentDrag: DragData<any> | null = null;
    private dropZones: Map<HTMLElement, DropZone<any>> = new Map();
    private handlerManager: HandlerManager = new HandlerManager();
    private successfulDrop: boolean = false;
    private originalPosition: number = -1;
    private originalNextSibling: Element | null = null;

    /**
     * Initialize drag functionality for an element
     */
    drag<T>(draggedElement: HTMLElement, component?: RWSViewComponent, dragOptions: Partial<IDragOpts> = {}): void {
        EventManager.validateComponent(component);
        
        draggedElement.draggable = true;
        
        const dragStartHandler = (event: DragEvent) => {
            if(!dragOptions.getDragElementData){
                throw new Error('DragDropService.drag: getDragElementData function must be provided in dragOptions');
            }

            const data = dragOptions.getDragElementData(draggedElement).data as T;     
            const type = dragOptions.dragElementType || 'tab';

            // For sortable items, ensure data-order attribute exists
            if (dragOptions.sortable || type === 'sortable-item') {
                const dataOrderAttr = draggedElement.getAttribute('data-order');
                if (!dataOrderAttr) {
                    throw new Error('DragDropService: data-order attribute is required on draggable elements for sortable functionality');
                }
            }

            // Reset successful drop flag for new drag operation
            this.successfulDrop = false;

            // Store original position for sortable behavior
            if (draggedElement.parentElement) {
                const siblings = Array.from(draggedElement.parentElement.children);
                this.originalPosition = siblings.indexOf(draggedElement);
                this.originalNextSibling = draggedElement.nextElementSibling;
            }

            // Store original order from DOM attribute
            const originalOrderAttr = draggedElement.getAttribute('data-order');
            const originalOrder = originalOrderAttr ? parseFloat(originalOrderAttr) : 0;

            this.currentDrag = {
                element: draggedElement,
                data: data,
                type,
                originalPosition: this.originalPosition,
                originalOrder: originalOrder
            };

            if(dragOptions.onDropOut){
                this.currentDrag.onDropOut = dragOptions.onDropOut;
            }

            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', JSON.stringify({ type, data }));
            }

            // Add visual feedback via dragstate attribute
            draggedElement.setAttribute('dragstate', 'dragging');

            // Emit drag start event
            EventManager.emitEvent(component!, 'drag-start', {
                element: draggedElement,
                data: data,
                type: type
            });
        };

        const dragEndHandler = async (event: DragEvent) => {
            // Remove visual feedback via dragstate attribute
            draggedElement.removeAttribute('dragstate');
            
            // Clear sortstate attributes from all items
            if (draggedElement.parentElement) {
                this.clearSortStateAttributes(draggedElement.parentElement);
            }
            
            // Check if element was dropped outside of any drop zone
            if (!this.successfulDrop && this.currentDrag?.onDropOut) {
                try {
                    await this.currentDrag.onDropOut(this.currentDrag);
                } catch (error) {
                    console.error('Error executing onDropOut callback:', error);
                }
            }
            
            // Emit drag end event
            EventManager.emitEvent(component!, 'drag-end', {
                element: draggedElement,
                data: this.currentDrag?.data,
                type: this.currentDrag?.type
            });

            this.currentDrag = null;
        };

        // Remove existing handlers if any
        this.handlerManager.removeDragHandlers(draggedElement);

        // Add new handlers
        draggedElement.addEventListener('dragstart', dragStartHandler);
        draggedElement.addEventListener('dragend', dragEndHandler);

        // Store handlers for cleanup
        this.handlerManager.storeDragHandlers(draggedElement, {
            dragStart: dragStartHandler,
            dragEnd: dragEndHandler
        });
    }

    /**
     * Initialize drop functionality for an element
     */
    drop<T>(targetArea: HTMLElement, acceptedTypes: string[] = ['default'], onDropCallback?: (dragData: DragData<T>, dropZone: DropZone<T>, event?: DragEvent) => void, component?: RWSViewComponent, options?: { sortable?: boolean }): void {
        const dropZone: DropZone<T> = {
            element: targetArea,
            accepts: acceptedTypes,
            onDrop: onDropCallback,
            sortable: options?.sortable || false
        };

        const dragOverHandler = (event: DragEvent) => {
            event.preventDefault();
            
            if (this.currentDrag && this.canAcceptDrop(dropZone, this.currentDrag)) {
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = 'move';
                }
                targetArea.setAttribute('dragstate', 'drag-over');
                
                // Handle sortable behavior - just visual feedback, no DOM manipulation
                if (dropZone.sortable && this.currentDrag.element !== event.target) {
                    // Store intended drop position for later calculation, but don't manipulate DOM
                    // DOM manipulation conflicts with RWS template system
                    this.storeIntendedDropPosition(event, dropZone);
                }
            } else {
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = 'none';
                }
            }
        };

        const dragLeaveHandler = (event: DragEvent) => {
            targetArea.removeAttribute('dragstate');
        };

        const dropHandler = (event: DragEvent) => {
            event.preventDefault();
            targetArea.removeAttribute('dragstate');

            if (this.currentDrag && this.canAcceptDrop(dropZone, this.currentDrag)) {
                // Mark as successful drop
                this.successfulDrop = true;

                // Handle sortable drop
                if (dropZone.sortable) {
                    this.handleSortableDrop(event, dropZone, this.currentDrag);
                }

                // Execute callback if provided - now with event information
                if (dropZone.onDrop) {
                    dropZone.onDrop(this.currentDrag, dropZone, event);
                }

                // Emit drop event using component's $emit if available
                if (component && typeof component.$emit === 'function') {                    
                    EventManager.emitEvent(component, 'drop', {
                        dragData: this.currentDrag,
                        dropZone: dropZone,
                        targetElement: targetArea,
                        dropEvent: event
                    });
                }                                
            }
        };

        // Remove existing handlers if any
        this.handlerManager.removeDropHandlers(targetArea);

        // Add new handlers
        targetArea.addEventListener('dragover', dragOverHandler);
        targetArea.addEventListener('dragleave', dragLeaveHandler);
        targetArea.addEventListener('drop', dropHandler);

        // Store handlers and drop zone for cleanup
        this.handlerManager.storeDropHandlers(targetArea, {
            dragOver: dragOverHandler,
            dragLeave: dragLeaveHandler,
            drop: dropHandler
        });
        this.dropZones.set(targetArea, dropZone);
    }

    /**
     * Remove drag functionality from an element
     */
    removeDrag(element: HTMLElement): void {
        this.handlerManager.removeDragHandlers(element);
        element.draggable = false;
        element.removeAttribute('dragstate');
    }

    /**
     * Remove drop functionality from an element
     */
    removeDrop(element: HTMLElement): void {
        this.handlerManager.removeDropHandlers(element);
        this.dropZones.delete(element);
        element.removeAttribute('dragstate');
    }

    /**
     * Get current drag data
     */
    getCurrentDrag<T>(): DragData<T> | null {
        return this.currentDrag;
    }

    /**
     * Check if a drop zone can accept the current drag
     */
    private canAcceptDrop<T>(dropZone: DropZone<T>, dragData: DragData<T>): boolean {
        return dropZone.accepts.includes(dragData.type) || dropZone.accepts.includes('*');
    }

    /**
     * Handle sortable dragover behavior - store intended position without DOM manipulation
     */
    private storeIntendedDropPosition(event: DragEvent, dropZone: DropZone<any>): void {
        // Just store the intended drop position for later calculation
        // Don't manipulate DOM to avoid conflicts with RWS template system
        const container = dropZone.element;
        const afterElement = this.getDragAfterElement(container, event.clientY);
        
        // Clear previous sortstate attributes
        this.clearSortStateAttributes(container);
        
        // Add sortstate attributes for visual feedback
        this.applySortStateAttributes(container, afterElement, event.clientY);
        
        // Store intended position in currentDrag for later use in calculateSortingOrder
        if (this.currentDrag) {
            this.currentDrag.intendedAfterElement = afterElement;
            this.currentDrag.lastDropY = event.clientY;
        }
    }

    /**
     * Get all items order from container - calculate new order based on drag operation
     */
    private getAllItemsOrder(container: HTMLElement, dragData?: DragData<any>): Array<{id: string, order: number}> {
        const allItems = Array.from(container.children) as HTMLElement[];
        
        // If no drag data, just return current DOM order
        if (!dragData || dragData.sortingOrder === undefined) {
            return allItems.map((item, index) => {
                const id = item.getAttribute('data-id') || '';
                return { id, order: index };
            }).filter(item => item.id);
        }
        
        // Calculate new order based on drag operation
        const draggedId = dragData.element.getAttribute('data-id') || '';
        const newPosition = dragData.sortingOrder;
        
        // Create new order array
        const itemsWithIds = allItems.map((item, index) => ({
            id: item.getAttribute('data-id') || '',
            originalIndex: index,
            element: item
        })).filter(item => item.id);
        
        // Find dragged item
        const draggedItem = itemsWithIds.find(item => item.id === draggedId);
        if (!draggedItem) {
            // Fallback to original order if dragged item not found
            return itemsWithIds.map((item, index) => ({
                id: item.id,
                order: index
            }));
        }
        
        // Remove dragged item from its current position
        const otherItems = itemsWithIds.filter(item => item.id !== draggedId);
        
        // Insert dragged item at new position
        const newOrderItems = [...otherItems];
        newOrderItems.splice(newPosition, 0, draggedItem);
        
        // Return with new 0-based ordering
        return newOrderItems.map((item, index) => ({
            id: item.id,
            order: index
        }));
    }

    /**
     * Handle sortable drop behavior
     */
    private handleSortableDrop(event: DragEvent, dropZone: DropZone<any>, dragData: DragData<any>): void {
        // Calculate the new order based on DOM position and data-order attributes
        const newSortingOrder = this.calculateSortingOrder(event, dropZone.element, dragData);
        
        // Set the new sorting order (this will be different from originalOrder)
        dragData.sortingOrder = newSortingOrder;
        
        // The originalOrder should already be set from dragstart, but ensure it's there
        if (dragData.originalOrder === undefined) {
            const originalOrderAttr = dragData.element.getAttribute('data-order');
            dragData.originalOrder = originalOrderAttr ? parseFloat(originalOrderAttr) : 0;
        }
        
        // Store original position index if not already set
        if (dragData.originalPosition === undefined) {
            dragData.originalPosition = this.originalPosition;
        }
        
        // Get all items order for component to use - pass dragData to calculate new order
        dragData.allItemsOrder = this.getAllItemsOrder(dropZone.element, dragData);
    }

    /**
     * Clear sortstate attributes from all items in container
     */
    private clearSortStateAttributes(container: HTMLElement): void {
        const allItems = Array.from(container.children) as HTMLElement[];
        allItems.forEach(item => {
            item.removeAttribute('sortstate');
        });
    }

    /**
     * Apply sortstate attributes to provide visual feedback
     */
    private applySortStateAttributes(container: HTMLElement, afterElement: HTMLElement | null, dropY: number): void {
        if (!this.currentDrag) return;
        
        const allItems = Array.from(container.children) as HTMLElement[];
        const draggedElement = this.currentDrag.element;
        const draggedIndex = allItems.indexOf(draggedElement);
        
        // Calculate where the item will be inserted
        let insertIndex: number;
        if (afterElement === null) {
            insertIndex = allItems.length - 1; // Insert at end
        } else {
            insertIndex = allItems.indexOf(afterElement);
        }
        
        allItems.forEach((item, index) => {
            if (item === draggedElement) return; // Skip the dragged item
            
            if (draggedIndex < insertIndex) {
                // Moving item down - items between current and target move up
                if (index > draggedIndex && index <= insertIndex) {
                    item.setAttribute('sortstate', 'move-up');
                    // Show gap above the target position
                    if (index === insertIndex) {
                        item.setAttribute('sortstate', 'gap-above');
                    }
                }
            } else if (draggedIndex > insertIndex) {
                // Moving item up - items between target and current move down
                if (index >= insertIndex && index < draggedIndex) {
                    item.setAttribute('sortstate', 'move-down');
                    // Show gap above the target position
                    if (index === insertIndex) {
                        item.setAttribute('sortstate', 'gap-above');
                    }
                }
            }
            
            // Special case: if inserting at the very end, show gap below last item
            if (afterElement === null && index === allItems.length - 2) {
                item.setAttribute('sortstate', 'gap-below');
            }
        });
    }

    /**
     * Get the element that should come after the dragged element
     */
    private getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
        const draggableElements = Array.from(container.children).filter(
            (child: Element) => child as HTMLElement !== this.currentDrag?.element
        ) as HTMLElement[];
        
        return draggableElements.reduce((closest: any, child: HTMLElement) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    /**
     * Calculate sorting order based on drop position
     */
    private calculateSortingOrder(event: DragEvent, container: HTMLElement, dragData: DragData<any>): number {
        const allItems = Array.from(container.children) as HTMLElement[];
        const draggedElement = dragData.element;
        
        // Use intended drop position if available, otherwise calculate from mouse position
        let newIndex: number;
        if (dragData.intendedAfterElement !== undefined) {
            if (dragData.intendedAfterElement === null) {
                // Intended to be at the end
                newIndex = allItems.length - 1;
            } else {
                // Intended to be before a specific element
                const afterIndex = allItems.indexOf(dragData.intendedAfterElement);
                newIndex = afterIndex > 0 ? afterIndex - 1 : 0;
            }
        } else {
            // Calculate based on mouse position
            const dropY = dragData.lastDropY || event.clientY;
            newIndex = 0;
            
            for (let i = 0; i < allItems.length; i++) {
                const item = allItems[i] as HTMLElement;
                if (item === draggedElement) continue;
                
                const rect = item.getBoundingClientRect();
                const itemCenterY = rect.top + (rect.height / 2);
                
                if (dropY < itemCenterY) {
                    newIndex = i;
                    break;
                } else {
                    newIndex = i + 1;
                }
            }
            
            // Adjust if we're moving the dragged element
            const currentIndex = allItems.indexOf(draggedElement);
            if (currentIndex < newIndex) {
                newIndex--;
            }
        }
        
        // Ensure index is within bounds
        newIndex = Math.max(0, Math.min(newIndex, allItems.length - 1));
        
        return newIndex;
    }

    /**
     * Cleanup all drag and drop handlers
     */
    cleanup(): void {
        // Clean up all handlers using handler manager
        this.handlerManager.clearAll();

        // Clear drop zones
        this.dropZones.clear();

        this.currentDrag = null;
    }
}

export default DragDropService.getSingleton();
export { DragDropService as DragDropServiceInstance };
