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
    type MultimethodInvocationSignatureExpanded = (item: Expand<DerivedType>, ...args: TArgs) => TReturn;
    type MultimethodExpandSignature =
        <TDerivedType extends DerivedType>
            (tag: TDerivedType[TTagKey], method: (item: TDerivedType, ...args: TArgs) => TReturn) => void;

    const methodsMap = new TreeDictionary<MultimethodInovcationSignature>();

    const result:
        MultimethodInvocationSignatureExpanded
        & {
            concreteMethods: TreeDictionary<MultimethodInovcationSignature>,
            extend: MultimethodExpandSignature,
            override: MultimethodExpandSignature,
        } = ((item: DerivedType, ...args: TArgs) => {
            const type = item[tagKey];
            const typePath = type.split(typeHierarchySerparator);

            let method: MultimethodInovcationSignature | undefined;

            while (typePath.length !== 0) {
                method = methodsMap.get(typePath);

                if (typeof method === 'function') {
                    return method(item, ...args);
                }

                typePath.pop();
            }

            throw new Error(`Could not resolve multimethod call for ${type}`);
        }) as any;

    result.concreteMethods = methodsMap;

    result.override = (tag, method) => {
        const typePath = tag.split(typeHierarchySerparator);
        methodsMap.set(typePath, method as any);
    }

    result.extend = (tag, method) => {
        const typePath = tag.split(typeHierarchySerparator);
        const existing = methodsMap.get(typePath);
        if (existing) {
            throw new Error(`Method already exists for ${tag}. Use 'override' if override interded.`);
        }
        result.override(tag, method);
    }

    result.extend(baseTypeTag as any, baseMethod as any);

    return result;
};