



export function multimethod
    <TBaseType, 
    TTagKey extends string & keyof TBaseType, 
    TBaseTypeTag extends string & TBaseType[TTagKey], 
    TArgs extends unknown[], 
    TReturn>
(tagKey: TTagKey,
    ...methods: [`${TBaseTypeTag}${string}`, (item: TBaseType, ...args: TArgs) => TReturn][]) {


type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type BaseItemTagless = Expand<Omit<TBaseType, TTagKey>>;

type PropertyDerivedTag = {
    [key in TTagKey]: `${TBaseTypeTag}${string}`
}

type DerivedItem = BaseItemTagless & PropertyDerivedTag;

type TMethodForInvocation = (item: Expand<DerivedItem>, ...args: TArgs) => TReturn;

type TMethodForExtend =  <
    TDerivedType extends DerivedItem>
(tag: TDerivedType[TTagKey], method:  (item: TDerivedType, ...args: TArgs) => TReturn) => void;

return {} as 
    TMethodForInvocation & {
        concreteMethods: Map<string, TMethodForInvocation>,
        extend: TMethodForExtend,
        //override: <TDerivedType extends TBaseType, TDerivedTag extends `${TBaseTypeTag}${string}`>(tag: TDerivedTag, method:  (item: TDerivedType, ...args: TArgs) => TReturn) => void,
    }
};