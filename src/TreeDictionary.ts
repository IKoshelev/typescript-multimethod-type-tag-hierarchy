type RecursiveMap<TKey, TValue> = Map<TKey, TValue | RecursiveMap<TKey,TValue>>;

export class TreeDictionary<T> {

    public readonly root: RecursiveMap<string, T> = new Map();

    private static throwIfPathHasEmptyStringAsSegment(path: string[]){
        if(path.some(segment => segment === "")) {
            throw new Error(`Path can't contain empty strings as segments. ${path}`);
        }
    }

    public set(path: string[], item: T): 'added new' | 'replaced existing' {

        TreeDictionary.throwIfPathHasEmptyStringAsSegment(path);

        let current = this.root;

        for(const segment of path) {
            if(current.has(segment) === false) {
                current.set(segment, new Map());
            }
            current = current.get(segment) as any;
        }

        const itemExisted = current.has('');
        current.set('', item);
        return itemExisted ? 'replaced existing' : 'added new';
    }

    public get(path: string[]): T | undefined {

        TreeDictionary.throwIfPathHasEmptyStringAsSegment(path);

        let current = this.root;

        for(const segment of path) {
            if(current.has(segment) === false) {
                return undefined;
            }
            current = current.get(segment) as any;
        }

        return current.get('') as any;
    }
}  
