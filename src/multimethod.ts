import { TreeDictionary } from "./TreeDictionary";

export function multimethod
    <TBaseType, 
    TTagKey extends string & keyof TBaseType, 
    TBaseTypeTag extends string & TBaseType[TTagKey], 
    TArgs extends unknown[], 
    TReturn>
(tagKey: TTagKey,
    baseTag: TBaseTypeTag, 
    baseMethod: (item: TBaseType, ...args: TArgs) => TReturn,
    typeSerparator: string = ";") {

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type BaseItemTagless = Expand<Omit<TBaseType, TTagKey>>;

type PropertyDerivedTag = {
    [key in TTagKey]: `${TBaseTypeTag}${string}`
}

type DerivedItem = BaseItemTagless & PropertyDerivedTag;

type TMethodForInvocation = (item: DerivedItem, ...args: TArgs) => TReturn;
type TMethodForInvocationWithExapand = (item: Expand<DerivedItem>, ...args: TArgs) => TReturn;

type TMethodForExtend =  <
    TDerivedType extends DerivedItem>
(tag: TDerivedType[TTagKey], method:  (item: TDerivedType, ...args: TArgs) => TReturn) => void;

const methodsMap = new TreeDictionary<TMethodForInvocation>();

const result:
    TMethodForInvocationWithExapand & {
        concreteMethods: TreeDictionary<TMethodForInvocation>,
        extend: TMethodForExtend,
        //override: <TDerivedType extends TBaseType, TDerivedTag extends `${TBaseTypeTag}${string}`>(tag: TDerivedTag, method:  (item: TDerivedType, ...args: TArgs) => TReturn) => void,
    } = ((item: DerivedItem, ...args: TArgs) => {
        const type = item[tagKey];
        const typePath = type.split(typeSerparator);

        let method: TMethodForInvocation | undefined;

        while(typePath.length !== 0) {
            method = methodsMap.get(typePath);

            if(typeof method === 'function') {
                return method(item, ...args);
            }

            typePath.pop();
        }

        throw new Error(`Could not resolve multimethod call for ${type}`);
    }) as any;

    result.concreteMethods = methodsMap;

    result.extend = (tag, method) => {
        const typePath = tag.split(typeSerparator);
        const existing = methodsMap.get(typePath);
        if(existing) {
            throw new Error(`Method already exists for ${tag}.`);
        }
        methodsMap.set(typePath, method as any);
    }

    result.extend(baseTag as any, baseMethod);

    return result;
};