# Multimethods that play nice with typescript

This library provides multimethods (multiple dispatch) for type hierarchies built with string literal templates https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html 

Available via NPM:

`npm i multimethod-type-tag-hierarchy`

# The hierarchy, polymorphic type tags

With release of typescript 4.3 advances in string literal templates assignability checks allow us to produce type hierarchies which play nicely with typescript typing and achieve polymorphism that does not brake from JSON serialization/deserialization cycle.

```typescript

const creatureTag: `creature${string}` = `creature`;
const animalTag: `creature;animal${string}` = `creature;animal`;

let creature: creatureTag;
let animal: animalTag;

creature = animal; // this works fine
animal = creature; // this produces error

type CreatureRecord = {
    type: typeof creatureTag,
    weight: number
}

type AnimalRecord = CreatureRecord & {
    type: typeof animalTag,
    color: string
}

let creatureRecord: CreatureRecord;
let animalRecord: AnimalRecord;

// the following works, since animal is derived from creature 
// thus can be assigned back, 
// and `creature;animal${string}` can be assigned to `creature${string}`
creatureRecord = animalRecord;

// the following does NOT work, since creature is NOT derived fron animal, 
// thus can't be assigned to it, 
// and `creature${string}` can NOT be assigned to `creature;animal${string}`
animalRecord = creatureRecord; 
```

Multimethods (inspired by Clojure) build upon this and allow us to utilize functional polymorphism standalone from it's typical Object Oriented coupling with inheritance, thus in a leaner and more flexible form. This is useful with Redux and other functional libraries that don't use classes and instead separate state from methods.

## Sample usage

Here is a demonstration of a tag based hierarchy `cat` is `animal`, `animal` is `creature`.

```typescript
//creatureRecord.ts
import { multimethod } from 'multimethod-type-tag-hierarchy';

export const creatureTag: `creature${string}` = `creature`;

export type CreatureRecord = {
    type: tyepof creatureTag,
    weight: number
}

export const getDescription = multimethod('type', 
    creatureTag, (item: CreatureRecord, note: string) =>
        `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

// the resulting 'getDescription' method accepts any type tagged as 
// `creature${string}`, that is, types where 'type' property has a type of 
// `creature;animal${string}`, `creature;animal;cat${string}` etc.
// will be accepted by typing check no problem
```

```typescript
//animalRecord.ts
import { CreatureRecord } from './creatureRecord';
// not strictly needed, but makes it easier to use the type,
// since all members can be imported from the same file this way
export { getDescription } from './crattureRecord'; 

export const animalTag: `creature;animal${string}` = `creature;animal`;

export type AnimalRecord = CreatureRecord & {
    type: typeof animalTag,
    color: string
}
```

```typescript
//catRecord.ts
import { AnimalRecord, getDescription } from './animalRecord';
export { getDescription } from './animalRecord';

export const catTag: `creature;animal;cat${string}` = `creature;animal;cat`;

export type CatRecord = AnimalRecord & {
    type: typeof catTag,
    name: string
}

// override the description method for cats
getDescription.extend(catTag, (item: CatRecord, note: string) =>
            `Description: ${item.type}, ${item.weight}kg, color ${item.color}, name ${item.name}; Note: ${note}`);
```

```typescript
//showcase.ts
import { creatureTag, CreatureRecord, getDescription } from './creatureRecord';
import { animalTag, AnimalRecord } from './animalRecord';
import { catTag, CatRecord } from './catRecord';

const creatureRecord: CreatureRecord = {
    type: creatureTag,
    weight: 4
}

const animalRecord: AnimalRecord = {
    type: animalTag,
    weight: 5,
    color: 'brown'
}

const catRecord: CatRecord = {
    type: catTag,
    weight: 6,
    color: 'black',
    name: 'Jack'
}

// notice, that we use 'getDescription' from 
// base type 'creatureRecord' for all 3 calls 

const result1 = getDescription(creatureRecord, '777');
// base method
// 'Description: creature, 4kg; Note: 777'

const result2 = getDescription(animalRecord, '888'); 
// same base method, no override
// 'Description: creature;animal, 5kg; Note: 888'

const result3 = getDescription(catRecord, '999'); 
// override for cats
// 'Description: creature;animal;cat, 6kg, color black, name Jack; Note: 999'
```

You also have ability to call base method from inside override. Base method resoltion moves up the tag hierarchy (in direction of less derived type). In example below, when we call method defined for `a;b;c` the call to `this.base(...)` will look for a method defined for `a;b` and then for `a`. It will take the first method encountered (though you can call `this.base` again from inside that method).

```typescript

const aTag: `a${string}` = `a`;
const bTag: `a;b${string}` = `a;b`;
const cTag: `a;b;c${string}` = `a;b;c`;

type ARecord = { type: typeof aTag, a: number }
type BRecord = ARecord & { type: typeof bTag, b: number }
type CRecord = BRecord & { type: typeof cTag, c: number }

const cRecord = {
    type: cTag,
    a: 1,
    b: 2,
    c: 3
}

const mm = multimethod(
    'type',
    aTag, 
    (item: ARecord, note: string) =>
        `Method for ARecor; a=${item.a}; note=${note};`);

mm.override(cTag, function (a: CRecord, b) {
    const baseResult = this.base(a,b);  
    return `${baseResult} Method for CRecord; c=${a.c};`;
});

const result = mm(cRecord, "note");

assert.strictEqual(result1, 'Method for ARecor; a=1; note=note; Method for CRecord; c=3;');
```

# Word of warning

Remember, **multimethod overrides are set at runtime**. Make sure all files containing overrides have been loaded before invoking the method. It may by a good idea to import all relevant files at the root of your app just to ensure this. 
