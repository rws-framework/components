import { RWSInject, RWSService, RWSViewComponent } from '@rws-framework/client';
import { DragData, DropZone, IDragOpts } from './types';
import { Tab } from '../../types/tab.types';
import TabReaderService, { TabReaderServiceInstance } from '../TabReaderService';
import { EventManager } from './EventManager';
import { HandlerManager } from './HandlerManager';

class DragDropService extends RWSService {
    private currentDrag: DragData<any> | null = null;
    private dropZones: Map<HTMLElement, DropZone<any>> = new Map();
    private handlerManager: HandlerManager = new HandlerManager();
    private successfulDrop: boolean = false;

    constructor(
        @TabReaderService private tabReader: TabReaderServiceInstance
    ){        
        super();
    }

    /**
     * Initialize drag functionality for an element
     */
    drag<T>(draggedElement: HTMLElement, component?: RWSViewComponent, dragOptions: Partial<IDragOpts> = {}): void {
        EventManager.validateComponent(component);
        
        draggedElement.draggable = true;
        
        const dragStartHandler = (event: DragEvent) => {
            const data = this.tabReader.getTabDomData(draggedElement) as T;            
            const type = dragOptions.dragElementType || 'tab';

            // Reset successful drop flag for new drag operation
            this.successfulDrop = false;

            this.currentDrag = {
                element: draggedElement,
                data: data,
                type
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
    drop<T>(targetArea: HTMLElement, acceptedTypes: string[] = ['default'], onDropCallback?: (dragData: DragData<T>, dropZone: DropZone<T>) => void, component?: RWSViewComponent): void {
        const dropZone: DropZone<T> = {
            element: targetArea,
            accepts: acceptedTypes,
            onDrop: onDropCallback
        };

        const dragOverHandler = (event: DragEvent) => {
            event.preventDefault();
            
            if (this.currentDrag && this.canAcceptDrop(dropZone, this.currentDrag)) {
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = 'move';
                }
                targetArea.setAttribute('dragstate', 'drag-over');
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

                // Execute callback if provided
                if (dropZone.onDrop) {
                    dropZone.onDrop(this.currentDrag, dropZone);
                }

                // Emit drop event using component's $emit if available
                if (component && typeof component.$emit === 'function') {                    
                    EventManager.emitEvent(component, 'drop', {
                        dragData: this.currentDrag,
                        dropZone: dropZone,
                        targetElement: targetArea
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
