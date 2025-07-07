import { RWSViewComponent, RWSView, attr, observable } from '@rws-framework/client';

@RWSView('rws-modal')
class RWSModal extends RWSViewComponent {      
    @observable closeModal: () => void
    @observable onShowModal: ($: ShadowRoot) => void

    @attr centerTop: 'true' | 'false' = 'true';
    @attr centerLeft: 'true' | 'false' = 'true';

    connectedCallback(): void {
        super.connectedCallback(); 
        if(this.onShowModal){
            this.onShowModal(this.shadowRoot);
        }       
    }

    centerTopChanged(oldValue: 'true' | 'false', newValue: 'true' | 'false'): void {
        this.centerTop = newValue;   
        console.log('centerTop changed:', newValue);  
    }

    centerLeftChanged(oldValue: 'true' | 'false', newValue: 'true' | 'false'): void {
        this.centerLeft = newValue; 
        console.log('centerLeft changed:', newValue);  
    
    }
}

RWSModal.defineComponent();

export { RWSModal };