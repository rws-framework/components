import { RWSViewComponent, RWSView, observable, attr } from '@rws-framework/client';
import { IFlexTableColumn } from '../rws-table/component';
import { 
    TableControlsEvents, 
    TableRefreshEventDetail, 
    TableExportEventDetail, 
    ColumnVisibilityChangedEventDetail,
    createTableControlsEvent 
} from './events';

export interface TableControlAction {
    key: string;
    label: string;
    icon?: string;
    variant: string;
    action: () => void;
}

@RWSView('table-controls')
class TableControls extends RWSViewComponent {
    @observable tableTarget?: string;
    @observable actions: TableControlAction[] = [];
    @observable showColumnToggle: boolean = true;
    @observable availableColumns: IFlexTableColumn[] = [];
    @observable visibleColumns: string[] = [];
    @observable data: any[] = [];

    // State for dropdown visibility
    @observable showActionsDropdown: boolean = false;
    @observable showColumnsDropdown: boolean = false;

    connectedCallback(): void {
        super.connectedCallback();
        
        // Add default actions
        this.setupDefaultActions();
        
        // Enable column toggle by default
        this.showColumnToggle = true;
        
        // Try to connect with parent crud-table
        this.connectWithParentTable();
    }

    availableColumnsChanged(oldValue: IFlexTableColumn[], newValue: IFlexTableColumn[]): void {
        if (newValue && Array.isArray(newValue)) {
            // Initialize visible columns if not set
            if (this.visibleColumns && this.visibleColumns.length === 0 && newValue.length > 0) {
                this.visibleColumns = newValue.map(col => col.key);
            }
        }
    }

    visibleColumnsChanged(oldValue: string[], newValue: string[]): void {
        // Ensure we have an array
        if (!Array.isArray(newValue)) {
            this.visibleColumns = [];
        }
    }

    private connectWithParentTable(): void {
        // Look for parent crud-table component
        const parentTable = this.closest('crud-table') as any;
        if (parentTable) {
            // Sync with parent table's columns and visibility
            if (parentTable.columns) {
                this.setAvailableColumns(parentTable.columns);
            }
            if (parentTable.visibleColumns) {
                this.setVisibleColumns(parentTable.visibleColumns);
            }
            
            // Store reference to parent table
            this.tableTarget = 'crud-table';
        }
    }

    private setupDefaultActions(): void {
        this.actions = [
            {
                key: 'refresh',
                label: 'Refresh',
                icon: 'simple-icon-refresh',
                variant: 'secondary',
                action: () => this.handleRefresh()
            },
            {
                key: 'export',
                label: 'Export',
                icon: 'simple-icon-cloud-download',
                variant: 'primary',
                action: () => this.handleExport()
            },
            {
                key: 'settings',
                label: 'Table Settings',
                icon: 'simple-icon-settings',
                variant: 'secondary',
                action: () => this.toggleColumnsDropdown()
            }
        ];
    }

    private handleRefresh(): void {
        const eventDetail: TableRefreshEventDetail = { target: this.tableTarget };
        this.$emit(TableControlsEvents.TABLE_REFRESH, eventDetail);
    }

    private handleExport(): void {
        const eventDetail: TableExportEventDetail = { 
            target: this.tableTarget,
            columns: this.visibleColumns 
        };
        this.$emit(TableControlsEvents.TABLE_EXPORT, eventDetail);
    }

    private toggleActionsDropdown(): void {
        this.showActionsDropdown = !this.showActionsDropdown;
        this.showColumnsDropdown = false;
    }

    private toggleColumnsDropdown(): void {
        this.showColumnsDropdown = !this.showColumnsDropdown;
        this.showActionsDropdown = false;
    }

    private closeDropdowns(): void {
        this.showActionsDropdown = false;
        this.showColumnsDropdown = false;
    }

    toggleColumn(columnKey: string): void {
        const index = this.visibleColumns.indexOf(columnKey);
        if (index > -1) {
            this.visibleColumns = this.visibleColumns.filter(key => key !== columnKey);
        } else {
            this.visibleColumns = [...this.visibleColumns, columnKey];
        }

        // Emit the change event
        const eventDetail: ColumnVisibilityChangedEventDetail = {
            target: this.tableTarget,
            visibleColumns: [...this.visibleColumns]
        };
        this.$emit(TableControlsEvents.COLUMN_VISIBILITY_CHANGED, eventDetail);

        // Also update any connected table directly
        this.updateConnectedTable();
    }

    private updateConnectedTable(): void {
        // Find parent crud-table and update it directly
        const parentTable = this.closest('crud-table') as any;
        if (parentTable && parentTable.setVisibleColumns) {
            parentTable.setVisibleColumns(this.visibleColumns);
        }
    }

    // Enhanced sync method for parent table
    syncWithParentTable(): void {
        const parentTable = this.closest('crud-table') as any;
        if (parentTable) {
            if (parentTable.columns) {
                this.setAvailableColumns(parentTable.columns);
            }
            if (parentTable.visibleColumns) {
                this.setVisibleColumns(parentTable.visibleColumns);
            }
        }
    }

    isColumnVisible(columnKey: string): boolean {
        return this.visibleColumns.includes(columnKey);
    }

    addCustomAction(action: TableControlAction): void {
        this.actions.push(action);
    }

    removeAction(actionKey: string): void {
        this.actions = this.actions.filter(action => action.key !== actionKey);
    }

    setAvailableColumns(columns: IFlexTableColumn[]): void {
        this.availableColumns = Array.isArray(columns) ? columns : [];
        // By default, show all columns
        if (this.visibleColumns.length === 0) {
            this.visibleColumns = this.availableColumns.map(col => col.key);
        }
    }

    setVisibleColumns(columnKeys: string[]): void {
        this.visibleColumns = Array.isArray(columnKeys) ? columnKeys : [];
    }

    // Method to sync with crud-table component
    syncWithTable(crudTable: any): void {
        if (crudTable && crudTable.columns) {
            this.setAvailableColumns(crudTable.columns);
            if (crudTable.visibleColumns) {
                this.setVisibleColumns(crudTable.visibleColumns);
            }
        }
    }

    // Method to update connected crud-table when columns change
    updateTable(crudTable: any): void {
        if (crudTable && crudTable.setVisibleColumns) {
            crudTable.setVisibleColumns(this.visibleColumns);
        }
    }
}

TableControls.defineComponent();

export { TableControls };
