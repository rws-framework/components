import { observable } from '@microsoft/fast-element';
import { RWSViewComponent, RWSView } from '@rws-framework/client';

@RWSView('rws-modal')
class RWSModal extends RWSViewComponent {      
    @observable closeModal: () => void
    @observable onShowModal: ($: ShadowRoot) => void

    connectedCallback(): void {
        super.connectedCallback(); 
        if(this.onShowModal){
            this.onShowModal(this.shadowRoot);
        }       
    }
}

RWSModal.defineComponent();

export { RWSModal };