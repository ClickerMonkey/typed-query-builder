import { Expr, Select, ExprValueObjects, ExprValueTuples, TupleFlatten, ExprValueToExpr, MergeObjects, UndefinedKeys, SelectWithKey, UnionToIntersection, UnionToTuple, ArrayToTuple, TupleAppend, ObjectKeys, SelectsKeys, SelectsValues, SelectsNameless, ObjectFromSelects, SelectsExprs, TuplesJoin, ExprField, SelectsFromObject, values, SelectsWithKey, Source, NamedSource, TextModify, ExprScalar } from '../src';
import { expectType, expectTypeMatch } from './helper';


describe('Types', () => {

    it('MergeObjects', () => {
        expectTypeMatch<{}, MergeObjects<{}, {}>>(true);
        expectTypeMatch<{ x: number }, MergeObjects<{}, { x: number }>>(true);
        expectTypeMatch<{ x: number }, MergeObjects<{ x: number }, {}>>(true);
        expectTypeMatch<{ x: number, y: number }, MergeObjects<{x: number }, { y: number }>>(true);
        expectTypeMatch<{ x: number, y?: number }, MergeObjects<{x: number }, { y?: number }>>(true);
        expectTypeMatch<{ x: number, y: string }, MergeObjects<{x: number, y: number }, { y: string }>>(true);
        expectTypeMatch<{ x: number, y: string, z: Date }, MergeObjects<{x: number, y: number }, { y: string, z: Date }>>(true);
        expectTypeMatch<{ x: number, y: string | number }, MergeObjects<{x: number, y: number }, { y?: string }>>(true);
    });

    it('UndefinedKeys', () => {
        expectTypeMatch<never, UndefinedKeys<{x: number }>>(true);
        expectTypeMatch<'x', UndefinedKeys<{x?: number }>>(true);
        expectTypeMatch<'x', UndefinedKeys<{x: number | undefined }>>(true);
    });

    it('ExprValueObjects', () => {
        expectTypeMatch<number, ExprValueObjects<number>>(true);
        expectTypeMatch<string[], ExprValueObjects<[Select<'name', string>]>>(true);
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

    it('AppendTuples', () => {
        expectTypeMatch<[], TupleAppend<[], []>>(true);
        expectTypeMatch<[number], TupleAppend<[], [number]>>(true);
        expectTypeMatch<[number], TupleAppend<[number], []>>(true);
        expectTypeMatch<[number, number], TupleAppend<[number], [number]>>(true);
        expectTypeMatch<[number, number, string], TupleAppend<[number], [number, string]>>(true);
        expectTypeMatch<[number, number, string, boolean], TupleAppend<[number], [number, string]>>(false);
    });

    it('FlattenTuples', () => {
        expectTypeMatch<[], TupleFlatten<[]>>(true);
        expectTypeMatch<[1], TupleFlatten<[1]>>(true);
        expectTypeMatch<[Date, 2], TupleFlatten<[Date, [2]]>>(true);
        expectTypeMatch<[1], TupleFlatten<[[1]]>>(true);
        expectTypeMatch<[1], TupleFlatten<[[[1]]]>>(true);
        expectTypeMatch<[1, 'x'], TupleFlatten<[[1], ['x']]>>(true);
        expectTypeMatch<[1, 'x', Date], TupleFlatten<[[1], ['x', Date]]>>(true);
        expectTypeMatch<[1, 'x', Date, string, 2], TupleFlatten<[[1], ['x', Date, string], [2]]>>(true);
        expectTypeMatch<[1, boolean], TupleFlatten<[[1], [boolean]]>>(true);
        expectTypeMatch<[Select<'y', string>, Select<'x', boolean>], TupleFlatten<[[Select<'y', string>], [Select<'x', boolean>]]>>(true);
    });

    it('ObjectKeys', () => {
        /* inconsistent union order
        expectTypeMatch<['name', 'id'], ObjectKeys<{ name: string, id: number }>>(true);
        expectTypeMatch<['name', 'id'], ObjectKeys<{ name: string, id?: number }>>(true);
        */
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
        expectTypeMatch<{ name: ExprScalar<string>, id: ExprScalar<number> }, SelectsExprs<[Select<'name', string>, Select<'id', number>]>>(true);
    });

    it('JoinTuples', () => {
        expectTypeMatch<[], TuplesJoin<[[]]>>(true);
        expectTypeMatch<[string], TuplesJoin<[[string]]>>(true);
        expectTypeMatch<[string, string, boolean], TuplesJoin<[[string], [string, boolean]]>>(true);
        expectTypeMatch<[string, string, boolean, Date], TuplesJoin<[[string], [string, boolean], Date, []]>>(true);
    });

    it('SelectAll', () => {
        type Test1a = [];
        type Test1b = { tasks: [Select<"id", number>] };
    
        expectTypeMatch<[Select<"id", number>], TupleAppend<Test1a, Test1b[keyof Test1b]>>(true);

        /* Order is hard
        type Test2a = [Select<"count", number>];
        type Test2b = { a: [Select<"name", string>], b: [Select<"id", number>, Select<"done", boolean>] };

        expectTypeMatch<
            [Select<"count", number>, Select<"name", string>, Select<"id", number>, Select<"done", boolean>], 
            SelectAllSelects<Test2b, Test2a>
        >(true);
        */
    })

    it('SourceFieldsFunctions simple', () => {
        const vals = values([{ id: 0, name: 'Task', age: 31 }], ['id', 'name', 'age']);

        expectType<Source<[Select<"id", number>, Select<"name", string>, Select<"age", number>]>>(vals);

        const source = vals.as('Person');

        expectType<NamedSource<"Person", [Select<"id", number>, Select<"name", string>, Select<"age", number>]>>(source);

        const fields = source.getFieldsFactory();

        expectType<ExprField<'id', number>>(fields.id);
        expectType<ExprField<'name', string>>(fields.name);
        expectType<ExprField<'age', number>>(fields.age);
        expectType<Select<'newId', number>>(fields.id.as('newId'));

        expectType<[Select<"id", number>, Select<"name", string>, Select<"age", number>]>(fields.all());
        expectType<[Select<"user.id", number>, Select<"user.name", string>, Select<"user.age", number>]>(fields.all('user.'));
        expectType<[Select<"userId", number>, Select<"userName", string>, Select<"userAge", number>]>(fields.all('user', 'CAPITAL'));

        expectType<[]>(fields.only());
        expectType<[]>(fields.only([]));
        expectType<[Select<"id", number>, Select<"age", number>]>(fields.only(['age', 'id']));
        expectType<[Select<"id", number>, Select<"age", number>]>(fields.only(['age', 'id']));
        expectType<[Select<"user.id", number>, Select<"user.age", number>]>(fields.only(['age', 'id'], 'user.'));
        expectType<[Select<"userId", number>, Select<"userAge", number>]>(fields.only(['age', 'id'], 'user', 'CAPITAL'));
        expectType<[Select<"userID", number>, Select<"userAGE", number>]>(fields.only(['age', 'id'], 'user', 'UPPER'));

        expectType<[Select<"id", number>, Select<"name", string>, Select<"age", number>]>(fields.exclude());
        expectType<[Select<"id", number>, Select<"name", string>, Select<"age", number>]>(fields.exclude([]));
        expectType<[Select<"id", number>]>(fields.exclude(['age', 'name']));
        expectType<[Select<"id", number>]>(fields.exclude(['age', 'name']));
        expectType<[Select<"id", number>, Select<"name", string>]>(fields.exclude(['age']));
        expectType<[Select<"id", number>, Select<"name", string>]>(fields.exclude(['age']));

        expectType<[]>(fields.mapped({}));
        expectType<[Select<"newId", number>, Select<"newAge", number>]>(fields.mapped({ newId: 'id', newAge: 'age' }));
    });

    it('SourceFieldsFunctions optionals', () => {
        const vals = values([
            { id: 0, name: 'Task', age: 31 },
            { id: 0, name: 'Task' },
        ], ['id', 'name', 'age']);

        expectType<Source<[Select<"id", number>, Select<"name", string>, Select<"age", number | undefined>]>>(vals);

        const source = vals.as('Person');

        expectType<NamedSource<"Person", [Select<"id", number>, Select<"name", string>, Select<"age", number | undefined>]>>(source);

        const fields = source.getFieldsFactory();

        expectType<ExprField<'id', number>>(fields.id);
        expectType<ExprField<'name', string>>(fields.name);
        expectType<ExprField<'age', number | undefined>>(fields.age);
        expectType<Select<'newId', number>>(fields.id.as('newId'));

        expectType<[Select<"id", number>, Select<"name", string>, Select<"age", number | undefined>]>(fields.all());

        expectType<[]>(fields.only());
        expectType<[]>(fields.only([]));
        expectType<[Select<"id", number>, Select<"age", number | undefined>]>(fields.only(['age', 'id']));
        expectType<[Select<"id", number>, Select<"age", number | undefined>]>(fields.only(['age', 'id']));

        expectType<[Select<"id", number>, Select<"name", string>, Select<"age", number | undefined>]>(fields.exclude());
        expectType<[Select<"id", number>, Select<"name", string>, Select<"age", number | undefined>]>(fields.exclude([]));
        expectType<[Select<"id", number>]>(fields.exclude(['age', 'name']));
        expectType<[Select<"id", number>]>(fields.exclude(['age', 'name']));
        expectType<[Select<"id", number>, Select<"name", string>]>(fields.exclude(['age']));
        expectType<[Select<"id", number>, Select<"name", string>]>(fields.exclude(['age']));

        expectType<[]>(fields.mapped({}));
        expectType<[Select<"newId", number>, Select<"newAge", number | undefined>]>(fields.mapped({ newId: 'id', newAge: 'age' }));
    });

    it('SelectsWithKey', () => {
        type TestSelects = [Select<'name', string>, Select<'id', number>, Select<'done', boolean>];

        expectTypeMatch<[Select<"name", string>], SelectsWithKey<TestSelects, 'name'>>(true);
    });
    
    it('SelectsFromObject', () => {
        type A = {};
        type B = { x: number };
        type C = { y: string, x: number };
        type E = { y: string, w?: number };

        expectTypeMatch<[], SelectsFromObject<A>>(true);
        expectTypeMatch<[Select<"x", number>], SelectsFromObject<B>>(true);
        expectTypeMatch<[Select<"x", number>, Select<"y", string>], SelectsFromObject<C>>(true);
        expectTypeMatch<[Select<"y", string>, Select<"w", number | undefined>], SelectsFromObject<E>>(true);
    });

    it('ExprValueToExpr', () => {
        expectTypeMatch<Expr<number>, ExprValueToExpr<number>>(true);
        expectTypeMatch<Expr<number[]> | Expr<Select<any, number>[]>, ExprValueToExpr<number[]>>(true);
        expectTypeMatch<Expr<(string | number)[]> | Expr<Select<any, string | number>[]>, ExprValueToExpr<(string | number)[]>>(true);
        expectTypeMatch<Expr<[Select<'x', number>]>, ExprValueToExpr<{ x: number }>>(true);
        expectTypeMatch<Expr<[Select<'x', number>, Select<'y', string>]>, ExprValueToExpr<{ x: number, y: string }>>(true);
        expectTypeMatch<Expr<[Select<'x', number>, Select<'y', string>][]>, ExprValueToExpr<{ x: number, y: string }[]>>(true);
        expectTypeMatch<Expr<[Select<any, number>, Select<any, string>]> | Expr<[number, string]>, ExprValueToExpr<[number, string]>>(true);
        expectTypeMatch<Expr<[Select<any, number>, Select<any, string>][]> | Expr<[number, string][]>, ExprValueToExpr<[number, string][]>>(true);
    });

    it('TextModify', () => {
        expectTypeMatch<'HELLO', TextModify<'HELLO', 'NONE'>>(true);
        expectTypeMatch<'Hello', TextModify<'hello', 'CAPITAL'>>(true);
        expectTypeMatch<'hELLO', TextModify<'HELLO', 'UNCAPITAL'>>(true);
        expectTypeMatch<'hello', TextModify<'HELLO', 'LOWER'>>(true);
        expectTypeMatch<'HELLO', TextModify<'Hello', 'UPPER'>>(true);
    });

});