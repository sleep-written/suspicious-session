import { assert } from 'chai';
import { EventObservable } from './event-observable';
import { EventSubscription } from './event-subscription';

class Fake<T> extends EventObservable<T> {
    public get tail(): number[] {
        return this._tail;
    }

    public get memory(): EventSubscription<T>[] {
        return this._memory;
    }

    constructor() {
        super();
    }
}

describe('Testing "./tool/event-emitter/event-observable"', () => {
    describe('Sync events', () => {
        it('Create 3 events, and destroy every subscription individually', done => {
            const obs = new Fake<void>();
            const mem: any = {};
    
            let count = 0;
            const callback = () => {
                if (++count >= 3) {
                    assert.hasAllKeys(mem, [
                        'key-a',
                        'key-b',
                        'key-c',
                    ])
    
                    assert.strictEqual(obs.tail.length, 0);
                    assert.strictEqual(obs.memory[0].id, sub0.id);
                    assert.strictEqual(obs.memory[1].id, sub1.id);
                    assert.strictEqual(obs.memory[2].id, sub2.id);
    
                    sub0.destroy();
                    assert.strictEqual(obs.tail.length, 1);
                    assert.isUndefined(obs.memory[0]);
                    assert.strictEqual(obs.memory[1].id, sub1.id);
                    assert.strictEqual(obs.memory[2].id, sub2.id);
    
                    sub1.destroy();
                    assert.strictEqual(obs.tail.length, 2);
                    assert.isUndefined(obs.memory[0]);
                    assert.isUndefined(obs.memory[1]);
                    assert.strictEqual(obs.memory[2].id, sub2.id);
    
                    sub2.destroy();
                    assert.strictEqual(obs.tail.length, 3);
                    assert.isUndefined(obs.memory[0]);
                    assert.isUndefined(obs.memory[1]);
                    assert.isUndefined(obs.memory[2]);
    
                    done();
                }
            };
    
            const sub0 = obs.subscribe(() => {
                mem['key-a'] = 0;
                callback();
            }) as EventSubscription<void>;
    
            const sub1 = obs.subscribe(() => {
                mem['key-b'] = 1;
                callback();
            }) as EventSubscription<void>;
    
            const sub2 = obs.subscribe(() => {
                mem['key-c'] = 2;
                callback();
            }) as EventSubscription<void>;
    
            obs.dispatch();
        });
    
        it('Create 3 events, and destroy all subscriptions using "obs.destroyAll();"', done => {
            const obs = new Fake<void>();
            const mem: any = {};
    
            let count = 0;
            const callback = () => {
                if (++count >= 3) {
                    assert.hasAllKeys(mem, [
                        'key-a',
                        'key-b',
                        'key-c',
                    ])
    
                    assert.strictEqual(obs.tail.length, 0);
                    assert.strictEqual(obs.memory[0].id, sub0.id);
                    assert.strictEqual(obs.memory[1].id, sub1.id);
                    assert.strictEqual(obs.memory[2].id, sub2.id);
    
                    obs.destroyAll();
                    assert.strictEqual(obs.tail.length, 0);
                    assert.strictEqual(obs.memory.length, 0);
                    assert.isUndefined(obs.memory[0]);
                    assert.isUndefined(obs.memory[1]);
                    assert.isUndefined(obs.memory[2]);
    
                    done();
                }
            };
    
            const sub0 = obs.subscribe(() => {
                mem['key-a'] = 0;
                callback();
            }) as EventSubscription<void>;
    
            const sub1 = obs.subscribe(() => {
                mem['key-b'] = 1;
                callback();
            }) as EventSubscription<void>;
    
            const sub2 = obs.subscribe(() => {
                mem['key-c'] = 2;
                callback();
            }) as EventSubscription<void>;
    
            obs.dispatch();
        });
    });

    describe('Async events', () => {
        it('Create 3 events, and destroy every subscription individually', done => {
            const obs = new Fake<void>();
            const mem: any = {};
    
            let count = 0;
            const callback = () => {
                if (++count >= 3) {
                    assert.hasAllKeys(mem, [
                        'key-a',
                        'key-b',
                        'key-c',
                    ])
    
                    assert.strictEqual(obs.tail.length, 0);
                    assert.strictEqual(obs.memory[0].id, sub0.id);
                    assert.strictEqual(obs.memory[1].id, sub1.id);
                    assert.strictEqual(obs.memory[2].id, sub2.id);
    
                    sub0.destroy();
                    assert.strictEqual(obs.tail.length, 1);
                    assert.isUndefined(obs.memory[0]);
                    assert.strictEqual(obs.memory[1].id, sub1.id);
                    assert.strictEqual(obs.memory[2].id, sub2.id);
    
                    sub1.destroy();
                    assert.strictEqual(obs.tail.length, 2);
                    assert.isUndefined(obs.memory[0]);
                    assert.isUndefined(obs.memory[1]);
                    assert.strictEqual(obs.memory[2].id, sub2.id);
    
                    sub2.destroy();
                    assert.strictEqual(obs.tail.length, 3);
                    assert.isUndefined(obs.memory[0]);
                    assert.isUndefined(obs.memory[1]);
                    assert.isUndefined(obs.memory[2]);
    
                    done();
                }
            };
    
            const sub0 = obs.subscribe(async () => {
                mem['key-a'] = 0;
                callback();
            }) as EventSubscription<void>;
    
            const sub1 = obs.subscribe(async () => {
                mem['key-b'] = 1;
                callback();
            }) as EventSubscription<void>;
    
            const sub2 = obs.subscribe(async () => {
                mem['key-c'] = 2;
                callback();
            }) as EventSubscription<void>;
    
            obs.dispatch();
        });
    
        it('Create 3 events, and destroy all subscriptions using "obs.destroyAll();"', done => {
            const obs = new Fake<void>();
            const mem: any = {};
    
            let count = 0;
            const callback = () => {
                if (++count >= 3) {
                    assert.hasAllKeys(mem, [
                        'key-a',
                        'key-b',
                        'key-c',
                    ])
    
                    assert.strictEqual(obs.tail.length, 0);
                    assert.strictEqual(obs.memory[0].id, sub0.id);
                    assert.strictEqual(obs.memory[1].id, sub1.id);
                    assert.strictEqual(obs.memory[2].id, sub2.id);
    
                    obs.destroyAll();
                    assert.strictEqual(obs.tail.length, 0);
                    assert.strictEqual(obs.memory.length, 0);
                    assert.isUndefined(obs.memory[0]);
                    assert.isUndefined(obs.memory[1]);
                    assert.isUndefined(obs.memory[2]);
    
                    done();
                }
            };
    
            const sub0 = obs.subscribe(async () => {
                mem['key-a'] = 0;
                callback();
            }) as EventSubscription<void>;
    
            const sub1 = obs.subscribe(async () => {
                mem['key-b'] = 1;
                callback();
            }) as EventSubscription<void>;
    
            const sub2 = obs.subscribe(async () => {
                mem['key-c'] = 2;
                callback();
            }) as EventSubscription<void>;
    
            obs.dispatch();
        });
    });
});
