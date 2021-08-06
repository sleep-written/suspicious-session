export class QueueNotInitializedError extends Error {
    constructor() {
        super(
                'The Queue has not been initialized. Execute '
            +   'the "QueueManager.initialize()" method before any '
            +   'insertions in the queue.'
        );
    }
}
