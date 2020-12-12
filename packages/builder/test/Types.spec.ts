import { Expr, Select, ExprValueObjects, ExprValueTuples, MergeObjects, UndefinedKeys, SelectWithKey, UnionToIntersection, UnionToTuple, ArrayToTuple, ColumnsToTuple, AppendTuples, ObjectKeys, SelectsKeys, SelectsValues, SelectsNameless, ObjectFromSelects, SelectsExprs, JoinTuples, SourceFieldsFunctions, createFieldsFactory, ExprField, SelectsFromObject } from '../src/';
import { expectType, expectTypeMatch } from './helper';


describe('Types', () => {

    it('MergeObjects', () => {
        expectTypeMatch<{ x: number, y: number }, MergeObjects<{x: number }, { y: number }>>(true);
        expectTypeMatch<{ x: number, y: string }, MergeObjects<{x: number, y: number }, { y: string }>>(true);
        expectTypeMatch<{ x: number, y: string | undefined }, MergeObjects<{x: number, y: number }, { y?: string }>>(true);
        expectTypeMatch<{}, MergeObjects<{}, {}>>(true);
        expectTypeMatch<{ x: number }, MergeObjects<{}, { x: number }>>(true);
        expectTypeMatch<{ x: number }, MergeObjects<{ x: number }, {}>>(true);
    });

    it('UndefinedKeys', () => {
        expectTypeMatch<never, UndefinedKeys<{x: number }>>(true);
        expectTypeMatch<'x', UndefinedKeys<{x?: number }>>(true);
        expectTypeMatch<'x', UndefinedKeys<{x: number | undefined }>>(true);
    });

    it('ExprValueObjects', () => {
        expectTypeMatch<number, ExprValueObjects<number>>(true);
        expectTypeMatch<{ name: string }, ExprValueObjects<[Select<'name', string>]>>(true);
        expectTypeMatch<{ name: string, id: number }, ExprValueObjects<[Select<'name', string>, Select<'id', number>]>>(true);
        expectTypeMatch<{ name: string, id: number }[], ExprValueObjects<[Select<'name', string>, Select<'id', number>][]>>(true);
        expectTypeMatch<string[], ExprValueObjects<string[]>>(true);
        expectTypeMatch<[string, number, boolean, string], ExprValueObjects<[string, number, boolean, string]>>(true);
    });

    it('ExprValueTuples', () => {
        expectTypeMatch<number, ExprValueTuples<number>>(true);
        expectTypeMatch<[string], ExprValueTuples<[Select<'name', string>]>>(true);
        expectTypeMatch<[string, number], ExprValueTuples<[Select<'name', string>, Select<'id', number>]>>(true);
        expectTypeMatch<[string, number][], ExprValueTuples<[Select<'name', string>, Select<'id', number>][]>>(true);
        expectTypeMatch<string[], ExprValueTuples<string[]>>(true);
        expectTypeMatch<[string, number, boolean, string], ExprValueTuples<[string, number, boolean, string]>>(true);
    });

    it('UnionToIntersection', () => {
        expectTypeMatch<{ x: number } & { y: number }, UnionToIntersection<{x : number} | {y: number}>>(true);
    });

    it('UnionToTuple', () => {
        expectTypeMatch<[string, number], UnionToTuple<string | number>>(true);
    });

    it('ArrayToTuple', () => {
        expectTypeMatch<[string, number], ArrayToTuple<Array<string | number>>>(true);
        expectTypeMatch<[string], ArrayToTuple<string[]>>(true);
    });

    it('ColumnsToTuple', () => {
        expectTypeMatch<["name", "id"], ColumnsToTuple<{ id: number, name: string, done: boolean}, ['name', 'id']>>(true);
        expectTypeMatch<["name", "id"], ColumnsToTuple<{ id: number, name: string, done: boolean}, ('name' | 'id')[]>>(true);
    });

    it('AppendTuples', () => {
        expectTypeMatch<[], AppendTuples<[], []>>(true);
        expectTypeMatch<[number], AppendTuples<[], [number]>>(true);
        expectTypeMatch<[number], AppendTuples<[number], []>>(true);
        expectTypeMatch<[number, number], AppendTuples<[number], [number]>>(true);
        expectTypeMatch<[number, number, string], AppendTuples<[number], [number, string]>>(true);
        expectTypeMatch<[number, number, string, boolean], AppendTuples<[number], [number, string]>>(false);
    });

    it('ObjectKeys', () => {
        expectTypeMatch<['name', 'id'], ObjectKeys<{ name: string, id: number }>>(true);
        expectTypeMatch<['name', 'id'], ObjectKeys<{ name: string, id?: number }>>(true);
        expectTypeMatch<[], ObjectKeys<{}>>(true);
        expectTypeMatch<['name'], ObjectKeys<{}>>(false);
    });

    it('SelectsKeys', () => {
        expectTypeMatch<['name', 'id'], SelectsKeys<[Select<'name', string>, Select<'id', number>]>>(true);
        expectTypeMatch<[], SelectsKeys<[]>>(true);
        expectTypeMatch<['name'], SelectsKeys<[]>>(false);
        expectTypeMatch<['name', any], SelectsKeys<[Select<any, string>, Select<'id', number>]>>(true);
    });

    it('SelectWithKey', () => {
        expectTypeMatch<Select<'id', number>, SelectWithKey<[Select<'name', string>, Select<'id', number>], 'id'>>(true);
        expectTypeMatch<Select<'id', number>, SelectWithKey<[Select<'name', string>, Select<'id', number>], 'age'>>(false);
        expectTypeMatch<never, SelectWithKey<[Select<'name', string>, Select<'id', number>], 'age'>>(true);
        expectTypeMatch<never, SelectWithKey<[], 'age'>>(true);
        expectTypeMatch<never, SelectWithKey<[], any>>(true);
    });

    it('SelectsValues', () => {
        expectTypeMatch<[string, number], SelectsValues<[Select<'name', string>, Select<'id', number>]>>(true);
        expectTypeMatch<[], SelectsValues<[]>>(true);
        expectTypeMatch<[], SelectsValues<[Select<'name', string>]>>(false);
        expectTypeMatch<[string, any], SelectsValues<[Select<'name', string>, Select<'id', number>]>>(true);
        expectTypeMatch<[string, any, boolean], SelectsValues<[Select<'name', string>, Select<'id', number>]>>(false);
        expectTypeMatch<[any, any], SelectsValues<[Select<'name', string>, Select<'id', number>]>>(true);
        expectTypeMatch<[string, number], SelectsValues<[Select<'name', any>, Select<'id', any>]>>(true);
        expectTypeMatch<[string], SelectsValues<[Select<'name', any>, Select<'id', any>]>>(false);
    });

    it('SelectsNameless', () => {
        expectTypeMatch<[], SelectsNameless<[]>>(true);
        expectTypeMatch<[Select<any, number>], SelectsNameless<[Select<'id', number>]>>(true);
        expectTypeMatch<[Select<any, string>, Select<any, number>], SelectsNameless<[Select<'name', string>, Select<'id', number>]>>(true);
    });

    it('ObjectFromSelects', () => {
        expectTypeMatch<{ name: string, id: number }, ObjectFromSelects<[Select<'name', string>, Select<'id', number>]>>(true);
        expectTypeMatch<{ name: string, id: number, done: boolean }, ObjectFromSelects<[Select<'name', string>, Select<'id', number>]>>(false);
    });

    it('SelectsExprs', () => {
        expectTypeMatch<{ name: Expr<string>, id: Expr<number> }, SelectsExprs<[Select<'name', string>, Select<'id', number>]>>(true);
    });

    it('JoinTuples', () => {
        expectTypeMatch<[], JoinTuples<[[]]>>(true);
        expectTypeMatch<[string], JoinTuples<[[string]]>>(true);
        expectTypeMatch<[string, string, boolean], JoinTuples<[[string], [string, boolean]]>>(true);
        expectTypeMatch<[string, string, boolean, Date], JoinTuples<[[string], [string, boolean], Date, []]>>(true);
    });

    it('SourceFieldsFunctions', () => {
        interface Person {
            id: number;
            name: string;
            age: number;
        }

        const fn: SourceFieldsFunctions<Person> = createFieldsFactory({
            id: new ExprField('person', 'id'),
            name: new ExprField('person', 'name'),
            age: new ExprField('person', 'age'),
        });

        expectType<[Select<"id", number>, Select<"name", string>, Select<"age", number>]>(fn.all());
        expectType<[ExprField<"id", number>, ExprField<"age", number>]>(fn.only(['age', 'id']));
        expectType<[ExprField<"id", number>, ExprField<"name", string>]>(fn.except(['age']));
    });
    
    type AB = SourceFieldsFunctions<[Select<'name', string>, Select<'id', number>, Select<'done', boolean>]>;
const ab: AB = null as any;
const ac = ab.all();
const ah = ab.only();
const ad = ab.only('name', 'id');
const ae = ab.only(['name', 'done']);
const al = ab.except('id');
const am = ab.except(['name']);
const af = ab.except();
const ag = ab.except([]);
const ai = ab.mapped({ 'New Name': 'name' });
const aj = ab.mapped({ 'New Name': 'name', 'New Done': 'done' });
const ak = ab.mapped({});


    it('SelectsFromObject', () => {
      type A = {};
      type B = { x: number };
      type C = { y: string, x: number };
      type D = { x: number } | { x: number, y: string };
      type E = { y: string, w?: number };

      expectTypeMatch<[], SelectsFromObject<A>>(true);
      expectTypeMatch<[Select<"x", number>], SelectsFromObject<B>>(true);
      expectTypeMatch<[Select<"x", number>, Select<"y", string>], SelectsFromObject<C>>(true);
      expectTypeMatch<[Select<"x", number>, Select<"y", string>], SelectsFromObject<D>>(true);
      expectTypeMatch<[Select<"y", string>, Select<"w", number>], SelectsFromObject<E>>(true);
    });

});
