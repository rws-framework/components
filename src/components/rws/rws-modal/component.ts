import { RWSViewComponent, RWSView, attr, observable } from '@rws-framework/client';

@RWSView('rws-modal')
class RWSModal extends RWSViewComponent {      
    @observable closeModal?: () => void
    @observable onShowModal?: ($: ShadowRoot) => void

    @attr centerTop: 'true' | 'false' = 'true';
    @attr centerLeft: 'true' | 'false' = 'true';
    @attr({attribute: 'showCloseBtn', mode: 'boolean'}) showCloseBtn: boolean = true;

    @attr name?: string;

    connectedCallback(): void {
        super.connectedCallback(); 
        this.shadowRoot.ownerDocument.querySelector('body').classList.add('has-backdrop');
        const ev = new CustomEvent(`rws_modal${this.name ? (':' + this.name) : ''}:open`, {
            detail: true,
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(ev);

        if(this.onShowModal){
            this.onShowModal(this.shadowRoot);
        }       

        this.on('rws_modal:force_close', () => {
            this.close();
        })
    }

    close(){        
        const ev = new CustomEvent(`rws_modal${this.name ? (':' + this.name) : ''}:close`, {
            detail: true,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(ev);

        if(this.closeModal){
            this.closeModal();
        }
    }

    disconnectedCallback(): void {
        this.shadowRoot.ownerDocument.querySelector('body').classList.remove('has-backdrop');
        super.disconnectedCallback();
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