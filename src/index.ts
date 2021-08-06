import { Manager } from './lib';
export * from './lib';

declare global {
  namespace Express {
    export interface Request {
      /**
       * An object for session management created by the `session-crossover` npm package.
       * Contains methods for create, rewind or delete the current session.
       */
      session: Manager;
    }
  }
}
