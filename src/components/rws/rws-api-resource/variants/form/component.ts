import { attr, observable } from '@microsoft/fast-element';
import { ITypesResponse } from '../../../../../types/IBackendCore';
import { RWSViewComponent, RWSView } from '@rws-framework/client';
import { IReFormerMassOrdering } from '../../../reformer/types/IReFormerTypes';


@RWSView('rws-resource-form')
class RWSResourceFormComponent extends RWSViewComponent {
    @attr resource: string;             
    
    @observable dbModelData: ITypesResponse = null;
    @observable formOrdering: IReFormerMassOrdering = [];
    @observable back: (resource: any) => Promise<void>;

    connectedCallback(): void 
    {
        super.connectedCallback();
        this.createOrdering();
    }

    setForm()
    {

    }

    createOrdering()
    {
        for(const type of this.dbModelData.data.types){
            this.formOrdering.push(type as unknown as IReFormerMassOrdering);
        }
    }
}

RWSResourceFormComponent.defineComponent();

export { RWSResourceFormComponent };