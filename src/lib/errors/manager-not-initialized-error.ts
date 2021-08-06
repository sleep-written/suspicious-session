export class ManagerNotInitializedError extends Error {
    constructor() {
        super(
                'The Manager has not been initialized. Execute '
            +   'the "QueueManager.initialize()" method before any '
            +   'insertions in the queue.'
        );
    }
}
