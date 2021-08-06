import { assert } from 'chai';
import { EventSubscription } from './event-subscription';
import { DisposeFuncNotSetted } from './errors';

describe('Testing "./tool/event-emitter/event-subscription"', () => {
    describe('Testing events', ()=> {
        it('Test event 01: Simple delay (2s)', done => {
            const sub = new EventSubscription<void>(0, () => done());
            setTimeout(() => sub.dispatch(), 2000);
        }).timeout(2100);
    
        it('Test event 02: Count from 0 to 3 (2s)', done => {
            const sub = new EventSubscription<number>(0, i => {
                if (i >= 3) {
                    clearInterval(clock);
                    done();
                }
            });
    
            let i = 0;
            const clock = setInterval(() => sub.dispatch(i++), 500);
        }).timeout(2100);
    
        it('Test event 03: Count from 0 to 3 async (2s)', done => {
            const sub = new EventSubscription<number>(0, async i => {
                await new Promise(res => setTimeout(res, 500));
    
                if (i >= 3) {
                    done();
                } else {
                    sub.dispatch(++i);
                }
            });
    
            sub.dispatch(0);
        }).timeout(2100);
    });

    describe('Testing errors', () => {
        it('Catch a event', done => {
            const sub = new EventSubscription<void>(0,
                () => { throw new Error('jajaja'); },
                err => {
                    assert.strictEqual(err.message, 'jajaja');
                    done();
                },
            );

            sub.dispatch();
        });

        it('Catch a async event', done => {
            const sub = new EventSubscription<void>(0,
                async () => { throw new Error('jajaja'); },
                err => {
                    assert.strictEqual(err.message, 'jajaja');
                    done();
                },
            );

            sub.dispatch();
        });

        it('Async catch a event', done => {
            const sub = new EventSubscription<void>(0,
                () => { throw new Error('jajaja'); },
                async err => {
                    assert.strictEqual(err.message, 'jajaja');
                    done();
                },
            );

            sub.dispatch();
        });

        it('Async catch a async event', done => {
            const sub = new EventSubscription<void>(0,
                async () => { throw new Error('jajaja'); },
                async err => {
                    assert.strictEqual(err.message, 'jajaja');
                    done();
                },
            );

            sub.dispatch();
        });
    });

    describe('Destroy Subscription', () => {
        it('Throw a non implemented dispose function', () => {
            const sub = new EventSubscription(0, () => console.log('test'));
            try {
                sub.destroy();
            } catch (err) {
                assert.instanceOf(err, DisposeFuncNotSetted);
            }
        });

        it('Execute an implemented dispose function', () => {
            const sub = new EventSubscription(666, () => console.log('test'));
            sub.setDisposeFunc(id => assert.strictEqual(id, 666));
            sub.destroy();
        });
    });
});
