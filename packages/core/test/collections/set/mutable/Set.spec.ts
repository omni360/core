import {EqualityComparator, ItemRemovedSetChange, Sequence, Set, SetChangedEventArgs, SetChangeKind} from '../../../..';
import {testReadOnlySet} from '../readonly/ReadOnlySet.spec';
import {assertLengthAndIsEmpty} from '../../base/Queryable.spec';


export function testSet(create: <T>(items?: Sequence<T>, comparator?: EqualityComparator<T>) => Set<T>) {
    describe('Set', function () {
        testReadOnlySet(create);

        describe('add()', function () {
            it('should add unique item into set', function () {
                const set: Set<string> = create();

                expect(set.add('one')).toBe(true);
                expect(set.length).toBe(1);
                expect(set.toArray()).toEqual(['one']);

                expect(set.add('one')).toBe(false);
                expect(set.length).toBe(1);
                expect(set.toArray()).toEqual(['one']);

                expect(set.add('two')).toBe(true);
                expect(set.length).toBe(2);
                expect(set.toArray()).toEqual(['one', 'two']);
            });
        });

        describe('addAll()', function () {
            it('should add all unique items into set', function () {
                const set: Set<string> = create();

                expect(set.addAll([])).toBe(false);
                expect(set.length).toBe(0);
                expect(set.toArray()).toEqual([]);

                expect(set.addAll(['one'])).toBe(true);
                expect(set.length).toBe(1);
                expect(set.toArray()).toEqual(['one']);

                expect(set.addAll(['one'])).toBe(false);
                expect(set.length).toBe(1);
                expect(set.toArray()).toEqual(['one']);

                expect(set.addAll(['two'])).toBe(true);
                expect(set.length).toBe(2);
                expect(set.toArray()).toEqual(['one', 'two']);
            });
        });

        describe('clear()', function () {
            it('should remove all items from set', function () {
                const set: Set<string> = create();

                expect(set.addAll([])).toBe(false);
                expect(set.length).toBe(0);
                expect(set.toArray()).toEqual([]);

                expect(set.addAll(['one'])).toBe(true);
                expect(set.length).toBe(1);
                expect(set.toArray()).toEqual(['one']);

                expect(set.addAll(['one'])).toBe(false);
                expect(set.length).toBe(1);
                expect(set.toArray()).toEqual(['one']);

                expect(set.addAll(['two'])).toBe(true);
                expect(set.length).toBe(2);
                expect(set.toArray()).toEqual(['one', 'two']);
            });
        });

        describe('remove()', function () {
            it('should return `false` if set does not contains the item', function () {
                const set: Set<string> = create();

                expect(set.remove('itemThatIsNotInCollection')).toBe(false);
            });

            it('should return `true` if item was removed from set', function () {
                const set: Set<string> = create(['one', 'two', 'three', 'four']);

                expect(set.remove('two')).toBe(true);

                assertLengthAndIsEmpty(set, 3);

                expect(set.remove('one')).toBe(true);

                assertLengthAndIsEmpty(set, 2);

                expect(set.remove('four')).toBe(true);

                assertLengthAndIsEmpty(set, 1);
            });

            it('should trigger "change" event when item was removed', function () {
                const set: Set<string> = create(['one', 'two', 'three']);
                const callback = jest.fn();

                set.changed.subscribe(callback);

                set.remove('two');

                expect(callback).toHaveBeenCalledTimes(1);

                {
                    const args: SetChangedEventArgs<string> = callback.mock.calls[0][0];

                    expect(args.changes.length).toBe(1);

                    const change: ItemRemovedSetChange<string> = args.changes[0] as ItemRemovedSetChange<string>;

                    expect(change.item).toBe('two');
                    expect(change.type).toBe(SetChangeKind.ITEM_REMOVED);
                }

                set.remove('one');

                expect(callback).toHaveBeenCalledTimes(2);

                {
                    const args: SetChangedEventArgs<string> = callback.mock.calls[1][0];

                    expect(args.changes.length).toBe(1);

                    {
                        const change: ItemRemovedSetChange<string> = args.changes[0] as ItemRemovedSetChange<string>;

                        expect(change.item).toBe('one');
                        expect(change.type).toBe(SetChangeKind.ITEM_REMOVED);
                    }
                }
            });
        });

        describe('removeAll()', function () {
            it('should remove items containing in both lists', function () {
                const set: Set<string> = create(['a', 'b', 'c', 'd', 'e', 'f']);

                assertLengthAndIsEmpty(set, 6);

                set.removeAll(['a', 'b']);

                assertLengthAndIsEmpty(set, 4);

                expect(set.toArray()).toEqual(['c', 'd', 'e', 'f']);
            });

            it('should trigger "changed" event for all removed items', function () {
                const set: Set<string> = create(['a', 'b', 'c', 'd', 'e', 'f']);
                const callback = jest.fn();

                set.changed.subscribe(callback);

                set.removeAll(['a', 'b']);

                expect(callback).toHaveBeenCalledTimes(1);

                {
                    const args: SetChangedEventArgs<string> = callback.mock.calls[0][0];

                    expect(args.changes.length).toBe(2);

                    {
                        const change: ItemRemovedSetChange<string> = args.changes[0] as ItemRemovedSetChange<string>;

                        expect(change.item).toBe('a');
                        expect(change.type).toBe(SetChangeKind.ITEM_REMOVED);
                    }

                    {
                        const change: ItemRemovedSetChange<string> = args.changes[1] as ItemRemovedSetChange<string>;

                        expect(change.item).toBe('b');
                        expect(change.type).toBe(SetChangeKind.ITEM_REMOVED);
                    }
                }
            });
        });

        describe('removeBy()', function () {
            it('should remove items for whose predicate function returns `true`', function () {
                const set: Set<string> = create(['a', 'b', 'a', 'c', 'd', 'a']);

                set.removeBy((character: string): boolean => {
                    return character === 'a';
                });

                assertLengthAndIsEmpty(set, 3);

                expect(set.toArray()).toEqual(['b', 'c', 'd']);
            });
            it('should trigger "changed" event for all removed items', function () {
                const set: Set<string> = create(['a', 'b', 'c', 'd', 'e', 'f']);
                const callback = jest.fn();

                set.changed.subscribe(callback);

                set.removeBy((actualItem) => {
                    return actualItem === 'a' || actualItem === 'b';
                });

                expect(callback).toHaveBeenCalledTimes(1);

                {
                    const args: SetChangedEventArgs<string> = callback.mock.calls[0][0];

                    expect(args.changes.length).toBe(2);

                    {
                        const change: ItemRemovedSetChange<string> = args.changes[0] as ItemRemovedSetChange<string>;

                        expect(change.item).toBe('a');
                        expect(change.type).toBe(SetChangeKind.ITEM_REMOVED);
                    }

                    {
                        const change: ItemRemovedSetChange<string> = args.changes[1] as ItemRemovedSetChange<string>;

                        expect(change.item).toBe('b');
                        expect(change.type).toBe(SetChangeKind.ITEM_REMOVED);
                    }
                }
            });
        });

        describe('retainAll()', function () {
            it('should accept empty lists', function () {
                const set: Set<string> = create(['one', 'two', 'three', 'four', 'five']);

                expect(set.retainAll([])).toBe(true);

                assertLengthAndIsEmpty(set, 0);

                expect(set.toArray()).toEqual([]);
            });

            it('should remove all items except those in specified set', function () {
                const set: Set<string> = create(['one', 'two', 'three', 'One', 'Two', 'Three']);

                expect(set.retainAll(['one', 'Three'])).toBe(true);

                assertLengthAndIsEmpty(set, 2);

                expect(set.toArray()).toEqual(['one', 'Three']);
            });

            it('should trigger "change" event for all removed items', function () {
                const set: Set<string> = create(['one', 'two', 'three', 'four', 'five', 'six']);
                const callback = jest.fn();

                set.changed.subscribe(callback);

                set.retainAll(['one', 'two', 'three']);

                expect(callback).toHaveBeenCalledTimes(1);

                {
                    const args: SetChangedEventArgs<string> = callback.mock.calls[0][0];

                    expect(args.changes.length).toBe(3);

                    {
                        const change: ItemRemovedSetChange<string> = args.changes[0] as ItemRemovedSetChange<string>;

                        expect(change.item).toBe('four');
                        expect(change.type).toBe(SetChangeKind.ITEM_REMOVED);
                    }

                    {
                        const change: ItemRemovedSetChange<string> = args.changes[1] as ItemRemovedSetChange<string>;

                        expect(change.item).toBe('five');
                        expect(change.type).toBe(SetChangeKind.ITEM_REMOVED);
                    }

                    {
                        const change: ItemRemovedSetChange<string> = args.changes[2] as ItemRemovedSetChange<string>;

                        expect(change.item).toBe('six');
                        expect(change.type).toBe(SetChangeKind.ITEM_REMOVED);
                    }
                }
            });
        });

        describe('intersectWith()', function () {
            it(
                'should modify the current set so that it contains only elements that are also in a specified collection',
                function () {
                    {
                        const current: Set<string> = create(['one', 'two', 'three']);
                        const empty: Set<string> = create([]);

                        expect(current.intersectWith(empty)).toBe(true);
                        assertLengthAndIsEmpty(current, 0);
                        assertLengthAndIsEmpty(empty, 0);
                    }
                    {
                        const current: Set<string> = create(['one', 'two', 'three']);
                        const other: Set<string> = create(['two', 'four', 'six']);

                        expect(current.intersectWith(other)).toBe(true);
                        expect(current.toArray()).toEqual(['two']);
                        expect(other.toArray()).toEqual(['two', 'four', 'six']);
                        assertLengthAndIsEmpty(current, 1);
                        assertLengthAndIsEmpty(other, 3);
                    }
                    {
                        const current: Set<string> = create(['one', 'two', 'three']);
                        const same: Set<string> = create(['one', 'two', 'three']);

                        expect(current.intersectWith(same)).toBe(false);
                        expect(current.toArray()).toEqual(['one', 'two', 'three']);
                        expect(same.toArray()).toEqual(['one', 'two', 'three']);
                        assertLengthAndIsEmpty(current, 3);
                        assertLengthAndIsEmpty(same, 3);
                    }
                }
            );
        });

        describe('symmetricExceptWith()', function () {
            it(
                'should modify the current set so that it contains only elements that are present either in the current set or ' +
                'in the specified collection, but not both',
                function () {
                    {
                        const current: Set<string> = create(['one', 'two', 'three']);
                        const empty: Set<string> = create([]);

                        expect(current.symmetricExceptWith(empty)).toBe(false);
                        expect(current.toArray()).toEqual(['one', 'two', 'three']);
                        assertLengthAndIsEmpty(current, 3);
                        assertLengthAndIsEmpty(empty, 0);
                    }
                    {
                        const current: Set<string> = create(['one', 'two', 'three']);
                        const other: Set<string> = create(['two', 'four', 'six']);

                        expect(current.symmetricExceptWith(other)).toBe(true);
                        expect(current.toArray()).toEqual(['one', 'three', 'four', 'six']);
                        expect(other.toArray()).toEqual(['two', 'four', 'six']);
                        assertLengthAndIsEmpty(current, 4);
                        assertLengthAndIsEmpty(other, 3);
                    }
                    {
                        const current: Set<string> = create(['one', 'two', 'three']);
                        const same: Set<string> = create(['one', 'two', 'three']);

                        expect(current.symmetricExceptWith(same)).toBe(true);
                        expect(current.toArray()).toEqual([]);
                        expect(same.toArray()).toEqual(['one', 'two', 'three']);
                        assertLengthAndIsEmpty(current, 0);
                        assertLengthAndIsEmpty(same, 3);
                    }
                }
            );
        });
    });
}