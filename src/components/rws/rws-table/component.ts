import { RWSViewComponent, RWSView, observable, attr } from '@rws-framework/client';
import { DisplayManager } from './display/displayManager';

export interface IFlexTableColumn {
    key: string;
    header: string;
    formatter?: (value: any) => string;
}

export type IExtraColumnFormatter<T = unknown> = (inputType: T) => string;

export type ActionType = {
    key: string,
    label: string,
    variant: string,
    handler: (id: string) => Promise<void>
}
 
@RWSView('rws-table', { debugPackaging: false })
class RWSTable extends RWSViewComponent {     
    @attr emptyLabel: string = 'No records'; 
    @observable columns: IFlexTableColumn[] = [];

    @observable dataColumns: IFlexTableColumn[] = [];
    @observable data: any[] = [];
    @observable fields: string[] = [];

    @observable actions: ActionType[] = [];

    @observable actionFilter: (action: ActionType, row: any) => boolean = (action: ActionType, row: any) => true;

    @observable extraFormatters: {[header_key: string] : IExtraColumnFormatter} = {};    
    @observable headerTranslations: { [sourceKey: string]: string } = {};

    private static readonly displayManager: DisplayManager = new DisplayManager(RWSTable);

    static display(): DisplayManager
    {
        return this.displayManager;
    }

    connectedCallback(): void {
        super.connectedCallback();
        if(!this.fields || !this.fields.length){
            this.fields = this.columns.map(col => col.key);
        }

        console.debug('RWSTable connectedCallback', this.fields, this.columns);

        this.orderFields();
    }

    displayClass(key: string): string{
        return (this.constructor as typeof RWSTable).display().getClass(key);
    }

    headerTranslationsChanged(oldValue: { [sourceKey: string]: string }, newValue: { [sourceKey: string]: string })
    {
        this.orderFields();
    }

    fieldsChanged(oldValue: string[], newValue: string[])
    {
        this.orderFields();
    }
    
    columnsChanged(oldValue: IFlexTableColumn[], newValue: IFlexTableColumn[])
    {        
        this.orderFields();
    }

    orderFields(): void
    {
        if(this.columns && this.columns.length){            
            const orderedColumns: IFlexTableColumn[] = [];            

            for(const fieldKey of this.fields){
                const found = this.columns.find(item => item.key === fieldKey);

                if(found){
                    if(Object.keys(this.extraFormatters).includes(fieldKey)){
                        found.formatter = this.extraFormatters[fieldKey];
                    }

                    if(this.headerTranslations && Object.keys(this.headerTranslations).includes(fieldKey)){
                        found.header = this.headerTranslations[fieldKey];
                    }

                    orderedColumns.push(found);
                }                
            }                        

            this.dataColumns = orderedColumns;            
        }
    }

    handleTableRefresh(event: CustomEvent): void {
        this.$emit('table-refresh', event.detail);
    }

    handleTableExport(event: CustomEvent): void {
        this.$emit('table-export', { 
            ...event.detail,
            data: this.data,
            columns: this.dataColumns 
        });
    }

    handleColumnVisibilityChanged(event: CustomEvent): void {
        const { visibleColumns } = event.detail;
        if (visibleColumns && Array.isArray(visibleColumns)) {
            this.fields = visibleColumns;
            this.$emit('column-visibility-changed', event.detail);
        }
    }
}

RWSTable.defineComponent();

export { RWSTable };