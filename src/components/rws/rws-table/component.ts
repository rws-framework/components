import { RWSViewComponent, RWSView, observable, attr } from '@rws-framework/client';
import { DisplayManager } from './display/displayManager';
import { TableControlsEvents } from '../table-controls/events';

export interface IFlexTableColumn {
    key: string;
    header: string;
    formatter?: (value: any, item: any) => string;
}

export type IExtraColumnFormatter<T = unknown> = (inputType: T) => string;

export type ActionType = {
    key: string,
    label: string,
    variant: string,
    icon?: string,
    tooltip?: string,
    tooltipDirection?: 'top' | 'bottom' | 'left' | 'right',
    filter?: (row: any) => boolean,
    handler: (id: string) => Promise<void>
}

@RWSView('rws-table', { debugPackaging: false })
export class RWSTable extends RWSViewComponent {
    @attr emptyLabel: string = 'No records';
    @attr exportName: string = 'data_export';
    @observable columns: IFlexTableColumn[] = [];

    @observable dataColumns: IFlexTableColumn[] = [];
    @observable data: any[] = [];
    @observable fields: string[] = [];

    @observable actions: ActionType[] = [];

    @observable actionFilter: (action: ActionType, row: any) => boolean = (action: ActionType, row: any) => true;

    @observable extraFormatters: { [header_key: string]: IExtraColumnFormatter } = {};
    @observable headerTranslations: { [sourceKey: string]: string } = {};

    @attr exportLabel: string = 'Export';
    @attr exportIcon: string = 'simple-icon-cloud-download';
    @attr columnsLabel: string = 'Columns';
    @attr columnsIcon: string = 'simple-icon-settings';

    private static readonly displayManager: DisplayManager = new DisplayManager(RWSTable);

    static display(): DisplayManager {
        return this.displayManager;
    }

    connectedCallback(): void {
        super.connectedCallback();


        if (!this.fields || !this.fields.length) {
            this.fields = this.columns.map(col => col.key);
        }


        this.on(TableControlsEvents.TABLE_EXPORT, () => {
            this.exportToCSV();
        });

        this.orderFields();        
    }

    dataChanged(){
        if(this.data.length){
            this.$emit('rwstable.data.loaded', this.data);
        }
    }

    displayClass(key: string): string {
        return (this.constructor as typeof RWSTable).display().getClass(key);
    }

    headerTranslationsChanged(oldValue: { [sourceKey: string]: string }, newValue: { [sourceKey: string]: string }) {
        this.orderFields();
    }

    fieldsChanged(oldValue: string[], newValue: string[]) {
        this.orderFields();
    }

    columnsChanged(oldValue: IFlexTableColumn[], newValue: IFlexTableColumn[]) {
        this.orderFields();
    }

    exportToCSV(): void {
        const headers = this.columns.map(col => col.header);
        let csvContent = headers.join(',') + '\n';

        this.data.forEach(item => {
            const row = this.columns.map(col => {
                const value = item[col.key];
                if (col.formatter && typeof col.formatter === 'function') {
                    // Strip HTML tags from formatted content for CSV
                    const formatted = col.formatter(value, item);
                    return `"${formatted.replace(/<[^>]*>/g, '').replace(/"/g, '""')}"`;
                }
                return `"${(value || '').toString().replace(/"/g, '""')}"`;
            });
            csvContent += row.join(',') + '\n';
        });

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${this.exportName}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    orderFields(): void {
        if (this.columns && this.columns.length) {
            const orderedColumns: IFlexTableColumn[] = [];

            for (const fieldKey of this.fields) {
                const found = this.columns.find(item => item.key === fieldKey);

                if (found) {
                    if (Object.keys(this.extraFormatters).includes(fieldKey)) {
                        found.formatter = this.extraFormatters[fieldKey];
                    }

                    if (this.headerTranslations && Object.keys(this.headerTranslations).includes(fieldKey)) {
                        found.header = this.headerTranslations[fieldKey];
                    }

                    orderedColumns.push(found);
                }
            }

            this.dataColumns = orderedColumns;
        }
    }

    handleColumnVisibilityChanged(event: CustomEvent): void {
        const { visibleColumns } = event.detail;
        if (visibleColumns && Array.isArray(visibleColumns)) {
            // Preserve original column order by filtering columns array instead of using visibleColumns directly
            const orderedVisibleFields = this.columns
                .map(col => col.key)
                .filter(key => visibleColumns.includes(key));

            this.fields = orderedVisibleFields;
            this.$emit('column-visibility-changed', event.detail);
        }
    }
}

RWSTable.defineComponent();