# Typescript multimethods inspired by Clojure (Lisp)

This library provides multimethods (multiple dispatch) with support for derivation hierarchies  a-la Clojure to achieve functional polymorphism. When you have several data types related  via 'isa' relationship and distinguished by tag fields you can create a hierarchy of tag values and later use it for multimethods.  

```typescript
const basicPrice = {
    type: 'prices/basic',
    //...
}

const foreignCurrencyPrice = {
    type: 'prices/foreign-currency',
    //...
}

priceTypesHierarchy.addDerivation('prices/foreign-currency', 'prices/basic');

console.log(
    priceTypesHierarchy.isa('prices/foreign-currency', 'prices/basic')
); // true
```

Available via NPM:

`npm i multimethod-isa-hierarchy`

## Sample usage

```typescript
//basic-price.ts
import { IsaHierarchy, multimethod } from 'multimethod-isa-hierarchy';

export const priceTypesHierarchy = new IsaHierarchy();

export const basePriceTypeTag = 'prices/basic' as const;

export type BasicPrice = {
    type: typeof basePriceTypeTag,
    expirationDate: Date,
    amount: number;
}

// methods that we expect to override are defined as multimethods
export const getPriceDescription = multimethod( priceTypesHierarchy, 'type',

    [basePriceTypeTag, (price: BasicPrice, useCurrencySymnol: boolean = false) => {
        return `${price.amount} ${useCurrencySymnol ? '$' : 'USD'}`
    }]);

export const isExpired = multimethod(priceTypesHierarchy, 'type',

    [basePriceTypeTag, (price: BasicPrice) => {
        return new Date() >= price.expirationDate;
    }]);
```

```typescript
//foreign-currency-price.ts
import {
    BasicPrice,
    basePriceTypeTag,
    priceTypesHierarchy,
    getPriceDescription
} from './basic-price.js';

export const foreignCurrencyPriceTypeTag = 'prices/foreign-currency' as const;

// 'prices/foreign-currency' is derived from 'prices/basic'
priceTypesHierarchy.addDerivation(foreignCurrencyPriceTypeTag, basePriceTypeTag);

console.log(
    priceTypesHierarchy.isa('prices/foreign-currency', 'prices/basic')
); // true

export type ForeignCurrencyPrice = Omit<BasicPrice, 'type'> & {
    type: typeof foreignCurrencyPriceTypeTag,
    currency: {
        name: string,
        symbol: string,
        conversionRate: number
    }
}

//add getPriceDescription override that will handle ForeignCurrencyPrice
getPriceDescription.extend(foreignCurrencyPriceTypeTag,
    (price: ForeignCurrencyPrice, useCurrencySymnol: boolean = false) => {
        const cur = price.currency;
        return `${price.amount * cur.conversionRate}` +
            ` ${useCurrencySymnol ? cur.symbol : cur.name}`
    });

//hint, you can also reexport multimehods for easier imports
export { getPriceDescription, isExpired } from './basic-price';
```

```typescript
//test.ts

import {
    basePriceTypeTag,
    BasicPrice,
    getPriceDescription,
    isExpired
} from './basic-price';

import {
    foreignCurrencyPriceTypeTag,
    ForeignCurrencyPrice
} from './foreign-currency-price';

const basicPrice: BasicPrice = {
    type: basePriceTypeTag,
    amount: 100,
    expirationDate: new Date(2021, 1, 1)
}

console.log(
    getPriceDescription(basicPrice, true)
); // 100 $

console.log(
    isExpired(basicPrice)
); // false

const foreingCurPrice: ForeignCurrencyPrice = {
    type: foreignCurrencyPriceTypeTag,
    amount: 100,
    expirationDate: new Date(2021, 1, 1),
    currency: {
        name: 'GBP',
        symbol: '£',
        conversionRate: 0.81
    }
}

// ForeignCurrencyPrice-specific method is used
console.log(
    getPriceDescription(foreingCurPrice, true)
); //81 £

// Since there is no override, hierarchy is used to lookup 
// concrete method implementation for nearest ancestor.
// Because priceTypesHierarchy.isa('prices/foreign-currency', 'prices/basic') is true,
// method for 'prices/basic' will be used
console.log(
    isExpired(foreingCurPrice)
); //false
```

# Inspiration 

This lib is inspired by Clojure multimethods and `derive` functionality.

https://clojure.org/about/runtime_polymorphism 

https://clojuredocs.org/clojure.core/derive

This approach allows us to utilize functional polymorphism standalone from it's typical Object Oriented  coupling with inheritance, thus in a leaner and more flexible form. This can be useful with Redux and other functional libraries that don't use classes and instead separate state from methods.

# Word of warning

Functional polymorphism is an advanced technique, make sure you will really benefit from it before using.

# Word of advice

If your project is going the functional route, probably using immutable state tree, it is quite likely you would benefit from other concepts heavily utilized by languages like Clojure, specifically, 'spec' https://clojure.org/guides/spec, a library which lets you define runtime-checkable schemas for your data in a very declarative manner. 

Typescript provides an even better environment for this approach with its incredibly  powerful design-time types system, and if you use a library like https://github.com/vriad/zod , you will be able to write type definitions usable both for IDE intellisense and runtime validation of data shape (as opposed to types existing just during compilation). Best part is, this approach doesn't even add much effort to defining types! Just check-out https://github.com/vriad/zod#objects .

# Other multimethod implementations

I wrote this library because I couldn't find one that would support derivation for tag relationships. Still, if you are looking for a different implementation, you might want to check
https://github.com/caderek/arrows/blob/master/packages/multimethod/README.md

https://github.com/yortus/multimethods

https://github.com/Seikho/multiple-dispatch