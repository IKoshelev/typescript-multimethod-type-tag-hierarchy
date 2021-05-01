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

    // it('can be defined and called', () => {

    //     const mm = multimethod(
    //         'type',
    //         [creatureTag, (item: typeof creatureRecord, note: string) =>
    //             `Description: ${item.type}, ${item.weight}kg; Note: ${note}`]);

    //     const result = mm(creatureRecord, '777');

    //     assert.equal(result, 'Description: creature, 4kg; Note: 777');
    // });

    // it('throws when concrete method can\'t be resolved', () => {

    //     const mm = multimethod(undefined,
    //         'type',
    //         [creatureTag, (item: typeof creatureRecord, note: string) =>
    //             `Description: ${item.type}, ${item.weight}kg; Note: ${note}`]);

    //     try {
    //         const result = mm(animalRecord, '777');
    //     } catch (ex) {
    //         assert.equal(true, /tag is: animal/.test(ex.message));
    //         return;
    //     }
    //     assert.fail();
    // });

    // it('can be extended after creation', () => {

    //     const mm = multimethod(undefined,
    //         'type',
    //         [creatureTag, (item: typeof creatureRecord, note: string) =>
    //             `Description: ${item.type}, ${item.weight}kg; Note: ${note}`]);

    //     mm.extend(animalTag, (item: typeof animalRecord, note: string) =>
    //         `Description: ${item.type}, ${item.weight}kg, color ${item.color}; Note: ${note}`);

    //     const result1 = mm(creatureRecord, '777');

    //     assert.equal(result1, 'Description: creature, 4kg; Note: 777');

    //     const result2 = mm(animalRecord, '888');

    //     assert.equal(result2, 'Description: animal, 5kg, color brown; Note: 888');
    // });

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

        assert.strictEqual(result2, 'Description: animal, 5kg; Note: 888');

        const result3 = mm(catRecord, '999');

        assert.strictEqual(result3, 'Description: cat, 6kg, color black, name Jack; Note: 999');
    });
});

// describe('multimethodFnBased', () => {

//     it('can be used with simple values', () => {

//         const mm = multimethodFnBased(undefined,
//             (x: boolean) => x,
//             [true, (_, note: string) => `I'm true ${note}`],
//             [false, (_, note: string) => `I'm false ${note}`]);

//         const result1 = mm(true, '777');
//         assert.equal(result1, 'I\'m true 777');

//         const result2 = mm(false, '888');
//         assert.equal(result2, 'I\'m false 888');
//     });

// });