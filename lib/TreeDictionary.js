export class TreeDictionary {
    constructor() {
        this.root = new Map();
    }
    static throwIfPathHasEmptyStringAsSegment(path) {
        if (path.some(segment => segment === "")) {
            throw new Error(`Path can't contain empty strings as segments. ${path}`);
        }
    }
    set(path, item) {
        TreeDictionary.throwIfPathHasEmptyStringAsSegment(path);
        let current = this.root;
        for (const segment of path) {
            if (current.has(segment) === false) {
                current.set(segment, new Map());
            }
            current = current.get(segment);
        }
        const itemExisted = current.has('');
        current.set('', item);
        return itemExisted ? 'replaced existing' : 'added new';
    }
    get(path) {
        TreeDictionary.throwIfPathHasEmptyStringAsSegment(path);
        let current = this.root;
        for (const segment of path) {
            if (current.has(segment) === false) {
                return undefined;
            }
            current = current.get(segment);
        }
        return current.get('');
    }
}
//# sourceMappingURL=TreeDictionary.js.map