import assert from 'assert';
import { multimethod } from './multimethod';

const creatureTag = 'creature' as const;
const animalTag = `${creatureTag};animal` as const;
const catTag = `${animalTag};cat` as const;

const creatureRecord = {
    type: creatureTag,
    weight: 4
}

const animalRecord = {
    type: animalTag,
    weight: 5,
    color: 'brown'
}

const catRecord = {
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
            (item: typeof creatureRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        const result = mm(creatureRecord, '777');

        assert.strictEqual(result, 'Description: creature, 4kg; Note: 777');
    });

    it(`throws when concrete method can't be resolved`, () => {

        const mm = multimethod(
            'type',
            catTag, 
            (item: typeof catRecord, note: string) =>
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
            (item: typeof creatureRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        mm.extend(animalTag, (item: typeof animalRecord, note: string) =>
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
            (item: typeof creatureRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        mm.extend(catTag, (item: typeof catRecord, note: string) =>
            `Description: ${item.type}, ${item.weight}kg, color ${item.color}, name ${item.name}; Note: ${note}`);

        const result1 = mm(creatureRecord, '777');

        assert.strictEqual(result1, 'Description: creature, 4kg; Note: 777');

        const result2 = mm(animalRecord, '888');

        assert.strictEqual(result2, 'Description: creature;animal, 5kg; Note: 888');

        const result3 = mm(catRecord, '999');

        assert.strictEqual(result3, 'Description: creature;animal;cat, 6kg, color black, name Jack; Note: 999');
    });

    it(`throws when override of existing method attempted without using 'override' method`, () => {

        const mm = multimethod(
            'type',
            catTag, 
            (item: typeof catRecord, note: string) =>
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
            (item: typeof catRecord, note: string) =>
                `Description: ${item.type}, ${item.weight}kg; Note: ${note}`);

        let result = mm(catRecord, '999');

        assert.strictEqual(result, 'Description: creature;animal;cat, 6kg; Note: 999');

        mm.override(catTag, () => 'overriden');

        result = mm(catRecord, '999');

        assert.strictEqual(result, 'overriden');

    });
});