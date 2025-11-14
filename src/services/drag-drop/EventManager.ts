import { RWSViewComponent } from '@rws-framework/client';

export class EventManager {
    /**
     * Emit custom event on component
     */
    static emitEvent<T>(component: RWSViewComponent, eventName: string, detail: T): void {
        if (!component || typeof component.$emit !== 'function') {
            throw new Error('No RWS view component detected');
        }
        component.$emit(eventName, detail);
    }

    /**
     * Validate component for event emission
     */
    static validateComponent(component?: RWSViewComponent): void {
        if (!component || typeof component.$emit !== 'function') {
            throw new Error('No RWS view component detected');
        }
    }
}
