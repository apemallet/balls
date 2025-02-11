export interface Event<T extends unknown[]> {
    do(listener: (...T) => void): () => void;
    fire(...args: T): void;
}

export function Event<T extends unknown[]>(): Event<T> {
    const listeners = new Set<() => void>();

    return {
        do: (listener: (...T) => void) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },

        fire: (...args: T) => {
            for (const listener of listeners) {
                listener(...args);
            }
        }
    }
}

export function sleep(ms: number) {
    // shit should be built in!!
    return new Promise(resolve => setTimeout(resolve, ms));
}