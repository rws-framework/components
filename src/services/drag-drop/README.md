# Drag & Drop Service

This directory contains the refactored drag and drop functionality, broken down into modular components for better maintainability and separation of concerns.

## Structure

```
drag-drop/
├── index.ts              # Main entry point and exports
├── DragDropService.ts    # Core service class
├── EventManager.ts       # Event handling utilities
├── HandlerManager.ts     # DOM event handler management
├── types.ts             # TypeScript interfaces and types
└── README.md            # This documentation
```

## Files Overview

### `index.ts`
- Main entry point that exports the singleton instance
- Maintains backward compatibility with the original `DragDropService.ts`
- Re-exports all types and utilities for convenience

### `DragDropService.ts`
- Core service class containing the main drag and drop logic
- Uses composition with `EventManager` and `HandlerManager`
- Maintains the same public API as the original service

### `EventManager.ts`
- Static utility class for handling RWS component events
- Centralizes event emission logic
- Provides component validation

### `HandlerManager.ts`
- Manages DOM event handlers for drag and drop operations
- Handles cleanup and memory management
- Provides methods to store, retrieve, and remove handlers

### `types.ts`
- TypeScript interfaces and type definitions
- Re-exports types from the main tab types
- Defines handler interfaces for better type safety

## Usage

The refactored service maintains full backward compatibility. Existing imports will continue to work:

```typescript
import DragDropService from '../services/DragDropService';
// or
import { DragDropServiceInstance } from '../services/DragDropService';
```

You can also import from the new modular structure:

```typescript
import DragDropService from '../services/drag-drop';
import { EventManager, HandlerManager } from '../services/drag-drop';
```

## Implementation

```typescript
import DragDropService, { DragDropServiceInstance } from '@app/services/drag-drop/DragDropService';
import {RWSInject} from '@rws-framework/client';

    //in component constructor
    constructor(
        @RWSInject(DragDropService) private dragService: DragDropServiceInstance,
    ){
        super();
    }

    //in service constructor
    constructor(
        @DragDropService private dragService: DragDropServiceInstance,
    ){
        super();
    }
```

### Drop Outside Callback

The service now supports executing a callback when an element is dropped outside of any drop zone:

```typescript
// Example usage with onDropOut callback
this.dragService.drag(element, this, {
    dragElementType: 'tab',
    onDropOut: async (dragData) => {
        console.log('Element dropped outside drop zone:', dragData);
        // Handle the drop-out scenario (e.g., remove element, show animation, etc.)
    }
});
```

The `onDropOut` callback:
- Is called only when the element is dropped outside of any registered drop zone
- Receives the `DragData` object as a parameter
- Can be async and return a Promise
- Is optional - if not provided, no action is taken when dropping outside
- Includes error handling to prevent crashes if the callback throws an error

## Benefits of Refactoring

1. **Separation of Concerns**: Each file has a single responsibility
2. **Better Testability**: Individual components can be tested in isolation
3. **Improved Maintainability**: Easier to locate and modify specific functionality
4. **Type Safety**: Better TypeScript support with dedicated type definitions
5. **Reusability**: Components like `EventManager` can be reused elsewhere
6. **Backward Compatibility**: Existing code continues to work without changes

## Migration Notes

- The original `DragDropService.ts` now simply re-exports from this directory
- All functionality remains identical
- No breaking changes to the public API
- Memory management and cleanup logic has been improved
