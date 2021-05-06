import { TreeDictionary } from "./TreeDictionary";
export function multimethod(tagKey, baseTypeTag, baseMethod, typeHierarchySerparator = ";") {
    const methodsMap = new TreeDictionary();
    const result = function (item, ...args) {
        const type = item[tagKey];
        const typePath = type.split(typeHierarchySerparator);
        const methods = [];
        while (typePath.length !== 0) {
            const method = methodsMap.get(typePath);
            if (typeof method === 'function') {
                methods.unshift(method);
            }
            typePath.pop();
        }
        if (methods.length === 0) {
            throw new Error(`Could not resolve multimethod call for ${type}`);
        }
        for (let current = 0; current < methods.length - 1; current++) {
            const method = methods[current];
            const nextMehod = methods[current + 1];
            if (!!method && !!nextMehod) {
                methods[current + 1] = nextMehod.bind({ base: method });
            }
        }
        return methods[methods.length - 1](item, ...args);
    };
    result.concreteMethods = methodsMap;
    result.override = ((tag, method) => {
        const typePath = tag.split(typeHierarchySerparator);
        methodsMap.set(typePath, method);
    });
    result.extend = ((tag, method) => {
        const typePath = tag.split(typeHierarchySerparator);
        const existing = methodsMap.get(typePath);
        if (existing) {
            throw new Error(`Method already exists for ${tag}. Use 'override' if override interded.`);
        }
        result.override(tag, method);
    });
    result.extend(baseTypeTag, baseMethod);
    return result;
}
;
//# sourceMappingURL=multimethod.js.map