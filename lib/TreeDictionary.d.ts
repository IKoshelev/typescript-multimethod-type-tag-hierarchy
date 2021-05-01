declare type RecursiveMap<TKey, TValue> = Map<TKey, TValue | RecursiveMap<TKey, TValue>>;
export declare class TreeDictionary<T> {
    readonly root: RecursiveMap<string, T>;
    private static throwIfPathHasEmptyStringAsSegment;
    set(path: string[], item: T): 'added new' | 'replaced existing';
    get(path: string[]): T | undefined;
}
export {};
