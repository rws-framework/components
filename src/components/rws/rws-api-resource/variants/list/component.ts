import { RWSViewComponent, RWSView } from '@rws-framework/client';
import { observable, attr } from '@microsoft/fast-element';
import { ActionType, IExtraColumnFormatter, IFlexTableColumn } from '../../../rws-table/component';
import { ITypeInfo, ITypesResponse } from '../../../../../types/IBackendCore';

@RWSView('rws-resource-list')
class RWSResourceListComponent extends RWSViewComponent {
    @attr resource: string;         
    @attr emptyLabel: string = 'No records';

    @observable dbModelData: ITypesResponse = null;
    @observable resourceList: any[] = [];
    @observable columns: IFlexTableColumn[] = [];

    @observable fields: string[] = [];
    @observable extraFormatters: {[header_key: string] : IExtraColumnFormatter} = {};  
    @observable headerTranslations: {[header_key: string] : string} = {};  

    @observable actions: ActionType[] = []; 

    async connectedCallback() 
    {
        super.connectedCallback();
        const makeColumns: IFlexTableColumn[] = [];

        for(const key in Object.keys(this.dbModelData.data.types)){
            const responseObject: ITypeInfo = this.dbModelData.data.types[key];

            makeColumns.push({
                key: responseObject.fieldName,
                header: responseObject.fieldName,                
            });
        }

        this.columns = makeColumns;

        this.resourceList = await this.apiService.back.get(`${this.resource}:list`);
    }
}

RWSResourceListComponent.defineComponent();

export { RWSResourceListComponent };