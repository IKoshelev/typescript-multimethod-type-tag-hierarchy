import assert from 'assert';
import { multimethod } from './multimethod';

const creatureTag: `creature${string}` = `creature`;
const animalTag: `creature;animal${string}` = `creature;animal`;
const catTag: `creature;animal;cat${string}` = `creature;animal;cat`;

type CreatureRecord = {
    type: typeof creatureTag,
    weight: number
}

type AnimalRecord = Omit<CreatureRecord, 'type'> & {
    type: typeof animalTag,
    color: string
}

type CatRecord = Omit<AnimalRecord, 'type'> & {
    type: typeof catTag,
    name: string
}

let creatureRecord: CreatureRecord = {
    type: creatureTag,
    weight: 4
}

let animalRecord: AnimalRecord = {
    type: animalTag,
    weight: 5,
    color: 'brown'
}

let catRecord: CatRecord = {
    type: catTag,
    weight: 6,
    color: 'black',
    name: 'Jack'
}

describe('multimethod', () => {

    it('can be defined and called', () => {

        const mm = multimethod(
            'type',
            creatureTag, 
            (item: CreatureRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        const result = mm(creatureRecord, '777');

        assert.strictEqual(result, 'Description: creature, 4kg; Note: 777');
    });

    it(`throws when concrete method can't be resolved`, () => {

        const mm = multimethod(
            'type',
            catTag, 
            (item: CatRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        try {
            const result = mm(animalRecord as any, '777');
        } catch (ex) {
            assert.strictEqual(ex.message, 'Could not resolve multimethod call for creature;animal');
            return;
        }
        assert.fail();
    });

    it('can be extended after creation', () => {

        const mm = multimethod(
            'type',
            creatureTag, 
            (item: CreatureRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        mm.extend(animalTag, (item: AnimalRecord, note: string) =>
            `Description: ${item.type}, ${item.weight}kg, color ${item.color}; Note: ${note}`);

        const result1 = mm(creatureRecord, '777');

        assert.strictEqual(result1, 'Description: creature, 4kg; Note: 777');

        const result2 = mm(animalRecord, '888');

        assert.strictEqual(result2, 'Description: creature;animal, 5kg, color brown; Note: 888');
    });

    it('can be used with hierarchy', () => {

        const mm = multimethod(
            'type',
            creatureTag, 
            (item: CreatureRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        mm.extend(catTag, (item: CatRecord, note: string) =>
            `Description: ${item.type}, ${item.weight}kg, color ${item.color}, name ${item.name}; Note: ${note}`);

        const result1 = mm(creatureRecord, '777');

        assert.strictEqual(result1, 'Description: creature, 4kg; Note: 777');

        const result2 = mm(animalRecord, '888');

        assert.strictEqual(result2, 'Description: creature;animal, 5kg; Note: 888');

        const result3 = mm(catRecord, '999');

        assert.strictEqual(result3, 'Description: creature;animal;cat, 6kg, color black, name Jack; Note: 999');
    });

    it(`can handle multiple arguments`, () => {

        const mm = multimethod(
            'type',
            creatureTag, 
            (item: CreatureRecord, a: string, b: string, c: string) =>
                `Description: ${item.type}, ${item.weight}kg; ${a} ${b} ${c}`);

        let result = mm(catRecord, 'a', 'b', 'c');

        assert.strictEqual(result, 'Description: creature;animal;cat, 6kg; a b c');

        mm.extend(catTag, (item: CatRecord, a: string, b: string) => `overriden ${a} ${b}`);

        result = mm(catRecord, 'a', 'b', 'c');

        assert.strictEqual(result, 'overriden a b');
    });

    it(`throws when override of existing method attempted without using 'override' method`, () => {

        const mm = multimethod(
            'type',
            catTag, 
            (item: CatRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        try {
            mm.extend(catTag, () => '');
        } catch (ex) {
            assert.strictEqual(ex.message, `Method already exists for creature;animal;cat. Use 'override' if override interded.`);
            return;
        }
        assert.fail();
    });

    it(`allows override of existing method with 'override' method`, () => {

        const mm = multimethod(
            'type',
            catTag, 
            (item: CatRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        let result = mm(catRecord, '999');

        assert.strictEqual(result, 'Description: creature;animal;cat, 6kg; Note: 999');

        mm.override(catTag, () => 'overriden');

        result = mm(catRecord, '999');

        assert.strictEqual(result, 'overriden');
    });

    const aTag: `a${string}` = `a`;
    const bTag: `a;b${string}` = `a;b`;
    const cTag: `a;b;c${string}` = `a;b;c`;
    const dTag: `a;b;c;d${string}` = `a;b;c;d`;
    const eTag: `a;b;c;d;e${string}` = `a;b;c;d;e`;

    type ARecord = { type: typeof aTag, a: number }
    type BRecord = Omit<ARecord, 'type'> & { type: typeof bTag, b: number }
    type CRecord = Omit<BRecord, 'type'> & { type: typeof cTag, c: number }
    type DRecord = Omit<CRecord, 'type'> & { type: typeof dTag, d: number }
    type ERecord = Omit<DRecord, 'type'> & { type: typeof eTag, e: number }

    it(`when overriding, allows to call base method via 'this.base(...)'`, () => {

        const cRecord = {
            type: cTag,
            a: 1,
            b: 2,
            c: 3,
        }

        const dRecord = {
            type: dTag,
            a: 1,
            b: 2,
            c: 3,
            d: 4,
        }

        const eRecord = {
            type: eTag,
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            e: 5
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

        mm.override(eTag, function (a: ERecord, b: string) {
            const baseResult = this.base(a,b);
            return `${baseResult} Method for ERecord; e=${a.e};`;
        });

        const result1 = mm(cRecord, "note");

        assert.strictEqual(result1, 'Method for ARecor; a=1; note=note; Method for CRecord; c=3;');

        const result2 = mm(dRecord, "note");

        assert.strictEqual(result2, 'Method for ARecor; a=1; note=note; Method for CRecord; c=3;');

        const result3 = mm(eRecord, "note");

        assert.strictEqual(result3, 'Method for ARecor; a=1; note=note; Method for CRecord; c=3; Method for ERecord; e=5;');
    });
});