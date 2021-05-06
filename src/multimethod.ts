import { TreeDictionary } from "./TreeDictionary";

export function multimethod
    <TBaseType,
        TTagKey extends string & keyof TBaseType,
        TBaseTypeTag extends string & TBaseType[TTagKey],
        TArgs extends unknown[],
        TReturn>
    (tagKey: TTagKey,
        baseTypeTag: TBaseTypeTag,
        baseMethod: (item: TBaseType, ...args: TArgs) => TReturn,
        typeHierarchySerparator: string = ";") {

    type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

    type BaseTypeTagless = Expand<Omit<TBaseType, TTagKey>>;

    type DerivedTypeTag = {
        [key in TTagKey]: `${TBaseTypeTag}${string}`
    }

    type DerivedType = BaseTypeTagless & DerivedTypeTag;

    type MultimethodInovcationSignature = (item: DerivedType, ...args: TArgs) => TReturn;

    type BaseCall = {base: MultimethodInovcationSignature};
    
    type MultimethodExpandSignature =
        <TDerivedType extends DerivedType>
            (tag: TDerivedType[TTagKey], 
            method: (this: BaseCall, item: TDerivedType, ...args: TArgs) => TReturn) => void;

    const methodsMap = new TreeDictionary<MultimethodInovcationSignature>();

    const result = function(item: DerivedType, ...args: TArgs) {
            const type = item[tagKey];
            const typePath = type.split(typeHierarchySerparator);

            const methods: MultimethodInovcationSignature[] = [];
            while (typePath.length !== 0) {
                const method = methodsMap.get(typePath);
                if (typeof method === 'function') {
                    methods.unshift(method);
                }
                typePath.pop();
            }

            if(methods.length === 0){
                throw new Error(`Could not resolve multimethod call for ${type}`);
            }

            for(let current = 0; current < methods.length - 1; current++) {
                const method = methods[current];
                const nextMehod = methods[current + 1];
                if(!!method && !!nextMehod) {
                    methods[current + 1] = (nextMehod as any).bind({base: method});
                }
            }

            return methods[methods.length - 1](item, ...args);
        };

    result.concreteMethods = methodsMap;

    result.override = ((tag, method) => {
        const typePath = tag.split(typeHierarchySerparator);
        methodsMap.set(typePath, method as any);
    }) as MultimethodExpandSignature;

    result.extend = ((tag, method) => {
        const typePath = tag.split(typeHierarchySerparator);
        const existing = methodsMap.get(typePath);
        if (existing) {
            throw new Error(`Method already exists for ${tag}. Use 'override' if override interded.`);
        }
        result.override(tag, method);
    }) as MultimethodExpandSignature;

    result.extend(baseTypeTag as any, baseMethod as any);

    return result;
};