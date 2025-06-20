import { RWSViewComponent, RWSView } from '@rws-framework/client';
import { attr, observable } from '@microsoft/fast-element';

@RWSView('reformer-boolean')
class ReFormerBoolean extends RWSViewComponent {
    @attr name: string;
    @observable defaultValue: boolean = null;
    @observable value: boolean = null;
    @observable setForm: (field: string, value: any) => Promise<void>; 

    connectedCallback(): void {
        super.connectedCallback();
        this.value = this.defaultValue;
    }
}

ReFormerBoolean.defineComponent();

export { ReFormerBoolean };
