/**
 * Table Controls Events
 * 
 * This module defines all the events that can be emitted by the table-controls component.
 * These events are used for communication between table-controls and parent table components.
 */

export interface TableRefreshEventDetail {
    target?: string;
}

export interface TableExportEventDetail {
    target?: string;
    columns?: string[];
    data?: any[];
}

export interface ColumnVisibilityChangedEventDetail {
    target?: string;
    visibleColumns: string[];
}

/**
 * Table Controls Events Object
 * Contains all event names and their corresponding event details interfaces
 */
export const TableControlsEvents = {
    /**
     * Emitted when the refresh button is clicked
     * Event detail: TableRefreshEventDetail
     */
    TABLE_REFRESH: 'table-refresh',
    
    /**
     * Emitted when the export button is clicked
     * Event detail: TableExportEventDetail
     */
    TABLE_EXPORT: 'table-export',
    
    /**
     * Emitted when column visibility is changed
     * Event detail: ColumnVisibilityChangedEventDetail
     */
    COLUMN_VISIBILITY_CHANGED: 'column-visibility-changed'
} as const;

/**
 * Type for all table controls event names
 */
export type TableControlsEventNames = typeof TableControlsEvents[keyof typeof TableControlsEvents];

/**
 * Event detail type mapping
 */
export type TableControlsEventDetailMap = {
    [TableControlsEvents.TABLE_REFRESH]: TableRefreshEventDetail;
    [TableControlsEvents.TABLE_EXPORT]: TableExportEventDetail;
    [TableControlsEvents.COLUMN_VISIBILITY_CHANGED]: ColumnVisibilityChangedEventDetail;
};

/**
 * Helper function to create strongly typed event emitters
 */
export function createTableControlsEvent<T extends TableControlsEventNames>(
    eventName: T,
    detail: TableControlsEventDetailMap[T]
): CustomEvent<TableControlsEventDetailMap[T]> {
    return new CustomEvent(eventName, { detail, bubbles: true, composed: true });
}

/**
 * Event handler type definitions for use in template bindings
 */
export interface TableControlsEventHandlers {
    handleTableRefresh: (event: CustomEvent<TableRefreshEventDetail>) => void;
    handleTableExport: (event: CustomEvent<TableExportEventDetail>) => void;
    handleColumnVisibilityChanged: (event: CustomEvent<ColumnVisibilityChangedEventDetail>) => void;
}
