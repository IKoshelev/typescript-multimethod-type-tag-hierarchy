



export function multimethod
    <TBaseType, 
    TTagKey extends string & keyof TBaseType, 
    TBaseTypeTag extends string & TBaseType[TTagKey], 
    TArgs extends unknown[], 
    TReturn>
(tagKey: TTagKey,
    ...methods: [`${TBaseTypeTag}${string}`, (item: TBaseType, ...args: TArgs) => TReturn][]) {


type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type BaseItemTagless = Expand<
    Omit<TBaseType, TTagKey>
    & { [key in TTagKey]: string }
>;

type DerivedItem<TDerivedTag extends `${TBaseTypeTag}${string}`> = BaseItemTagless & {
    [key in TTagKey]: TDerivedTag
}

type TMethodForInvocation = (item: DerivedItem<`${TBaseTypeTag}${string}`>, ...args: TArgs) => TReturn;

type TOverrideForInvocation =  <
    TDerivedType extends DerivedItem<`${TBaseTypeTag}${string}`>>
(tag: TDerivedType[TTagKey], method:  (item: TDerivedType, ...args: TArgs) => TReturn) => void;

return {} as 
    TMethodForInvocation & {
        concreteMethods: Map<string, TMethodForInvocation>,
        extend: TOverrideForInvocation,
        //override: <TDerivedType extends TBaseType, TDerivedTag extends `${TBaseTypeTag}${string}`>(tag: TDerivedTag, method:  (item: TDerivedType, ...args: TArgs) => TReturn) => void,
    }
};