import { TreeDictionary } from "./TreeDictionary";
export declare function multimethod<TBaseType, TTagKey extends string & keyof TBaseType, TBaseTypeTag extends string & TBaseType[TTagKey], TArgs extends unknown[], TReturn>(tagKey: TTagKey, baseTypeTag: TBaseTypeTag, baseMethod: (item: TBaseType, ...args: TArgs) => TReturn, typeHierarchySerparator?: string): {
    (item: (Omit<TBaseType, TTagKey> extends infer O ? { [K in keyof O]: O[K]; } : never) & { [key in TTagKey]: `${TBaseTypeTag}${string}`; }, ...args: TArgs): TReturn;
    concreteMethods: TreeDictionary<(item: (Omit<TBaseType, TTagKey> extends infer O ? { [K in keyof O]: O[K]; } : never) & { [key in TTagKey]: `${TBaseTypeTag}${string}`; }, ...args: TArgs) => TReturn>;
    override: <TDerivedType extends (Omit<TBaseType, TTagKey> extends infer O ? { [K in keyof O]: O[K]; } : never) & { [key in TTagKey]: `${TBaseTypeTag}${string}`; }>(tag: TDerivedType[TTagKey], method: (this: {
        base: (item: (Omit<TBaseType, TTagKey> extends infer O ? { [K in keyof O]: O[K]; } : never) & { [key in TTagKey]: `${TBaseTypeTag}${string}`; }, ...args: TArgs) => TReturn;
    }, item: TDerivedType, ...args: TArgs) => TReturn) => void;
    extend: <TDerivedType extends (Omit<TBaseType, TTagKey> extends infer O ? { [K in keyof O]: O[K]; } : never) & { [key in TTagKey]: `${TBaseTypeTag}${string}`; }>(tag: TDerivedType[TTagKey], method: (this: {
        base: (item: (Omit<TBaseType, TTagKey> extends infer O ? { [K in keyof O]: O[K]; } : never) & { [key in TTagKey]: `${TBaseTypeTag}${string}`; }, ...args: TArgs) => TReturn;
    }, item: TDerivedType, ...args: TArgs) => TReturn) => void;
};
