import { TreeDictionary } from "./TreeDictionary";
export function multimethod(tagKey, baseTypeTag, baseMethod, typeHierarchySerparator = ";") {
    const methodsMap = new TreeDictionary();
    const result = ((item, ...args) => {
        const type = item[tagKey];
        const typePath = type.split(typeHierarchySerparator);
        let method;
        while (typePath.length !== 0) {
            method = methodsMap.get(typePath);
            if (typeof method === 'function') {
                return method(item, ...args);
            }
            typePath.pop();
        }
        throw new Error(`Could not resolve multimethod call for ${type}`);
    });
    result.concreteMethods = methodsMap;
    result.override = (tag, method) => {
        const typePath = tag.split(typeHierarchySerparator);
        methodsMap.set(typePath, method);
    };
    result.extend = (tag, method) => {
        const typePath = tag.split(typeHierarchySerparator);
        const existing = methodsMap.get(typePath);
        if (existing) {
            throw new Error(`Method already exists for ${tag}. Use 'override' if override interded.`);
        }
        result.override(tag, method);
    };
    result.extend(baseTypeTag, baseMethod);
    return result;
}
;
//# sourceMappingURL=multimethod.js.map