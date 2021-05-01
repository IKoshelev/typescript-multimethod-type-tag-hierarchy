import assert from 'assert';
import { TreeDictionary } from './TreeDictionary';



describe(`${TreeDictionary.name}`, () => {

    it('can set and get items by path', () => {

        const td = new TreeDictionary<number>();

        assert.strictEqual(td.get(['a']), undefined);
        assert.strictEqual(td.get(['a','b']), undefined);
        assert.strictEqual(td.get(['a', 'b', 'c']), undefined);

        let res = td.set(['a','b','c'], 5);

        assert.strictEqual(res, 'added new'); 
        assert.strictEqual(td.get(['a']), undefined);
        assert.strictEqual(td.get(['a','b']), undefined);
        assert.strictEqual(td.get(['a', 'b', 'c']), 5);
  
        res = td.set(['a','b','c'], 7);

        assert.strictEqual(res, 'replaced existing');
        assert.strictEqual(td.get(['a']), undefined);
        assert.strictEqual(td.get(['a','b']), undefined);
        assert.strictEqual(td.get(['a', 'b', 'c']), 7);

        res = td.set(['a','b','d'], 9);

        assert.strictEqual(res, 'added new');
        assert.strictEqual(td.get(['a']), undefined);
        assert.strictEqual(td.get(['a','b']), undefined);
        assert.strictEqual(td.get(['a', 'b', 'c']), 7);
        assert.strictEqual(td.get(['a', 'b', 'd']), 9);
    });
});