export interface Current<T = any> {
    /**
     * Load asynchronously the content of the current session value.
     */
    load(): Promise<T>;

    /**
     * Saves asynchronously the object provided to this method inside
     * a encrypted file assigned to this current session.
     * @param value The object do you to save.
     */
    save(value: T): Promise<void>;
}
