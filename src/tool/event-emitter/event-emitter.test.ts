import { assert } from 'chai';
import { EventEmitter } from './event-emitter';

describe('Testing "./tool/event-emitter"', () => {
    it('Create a simple event', done => {
        const event = new EventEmitter<string>();
        const subsc = event.observable().subscribe(v => {
            assert.strictEqual(v, 'Pero si es un hombre sano');
            subsc.destroy();
            done();
        });

        event.emit('Pero si es un hombre sano');
    });
});
