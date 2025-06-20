import { RWSViewComponent, RWSView } from '@rws-framework/client';
import { attr } from '@microsoft/fast-element';

@RWSView('rws-loader')
class RWSLoader extends RWSViewComponent {    
    connectedCallback(): void {
        super.connectedCallback();
    }
}

RWSLoader.defineComponent();

export { RWSLoader };