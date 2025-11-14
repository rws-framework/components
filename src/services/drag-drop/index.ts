import DragDropService, { DragDropServiceInstance } from './DragDropService';

// Create and export singleton instance to maintain backward compatibility

export default DragDropService;
export { DragDropService as DragDropServiceInstance };

// Re-export types for convenience
export * from './types';
export { EventManager } from './EventManager';
export { HandlerManager } from './HandlerManager';
