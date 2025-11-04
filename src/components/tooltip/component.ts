import { attr } from '@microsoft/fast-element';
import { RWSViewComponent, RWSView } from '@rws-framework/client';

@RWSView('rws-tooltip')
class RWSTooltip extends RWSViewComponent {
    @attr side: string = 'top';
    @attr({ mode: 'boolean' }) disabled: boolean = false;
    @attr text: string = '';

    static DATA_TAGS = {
        tooltip: 'rws-ttip',
        side: 'rws-ttip-side',
    }

    connectedCallback(): void {
        super.connectedCallback();
    }

    static addTooltips(this: RWSViewComponent){
        const tooltipHolders = this.$(`[data-${RWSTooltip.DATA_TAGS.tooltip}]`) as NodeListOf<HTMLElement>;

        for(const holder of Array.from(tooltipHolders)) {
            const side = holder.getAttribute(`data-${RWSTooltip.DATA_TAGS.side}`) || 'top';

            const tooltip = document.createElement('rws-tooltip');
            tooltip.setAttribute('side', side);
            tooltip.setAttribute('text', holder.getAttribute(`data-${RWSTooltip.DATA_TAGS.tooltip}`) || '');
            tooltip.append(holder.cloneNode(true));

            holder.replaceWith(tooltip);
        }
    }
}

RWSTooltip.defineComponent();

export { RWSTooltip };