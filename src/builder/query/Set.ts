import { isArray, isString, mapRecord } from '../../fns';
import { ObjectFromSelects, OrderDirection, Selects, SelectsKeys, SelectsNameless, SetOperation, Simplify } from '../../_Types';
import { Expr, ExprField, ExprProvider } from '../exprs';
import { OrderBy } from '../Order';
import { createFieldsFactory, SourcesCast } from '../sources';
import { QuerySelectBase } from './Base';


export type QuerySetType<S extends Selects> = SourcesCast<Simplify<Record<'set', ObjectFromSelects<S>>>>;

export type QuerySetQuery<S extends Selects> = QuerySelectBase<any, SelectsNameless<S>, any>;

export class QuerySet<S extends Selects> extends QuerySelectBase<QuerySetType<S>, S, ObjectFromSelects<S>[]>
{
  
  public static readonly id = 'sset';

  public _queries: QuerySetQuery<S>[];
  public _all: boolean[];

  public static create<S extends Selects>(
    op: SetOperation,
    first: QuerySelectBase<any, S, any>,
    second: QuerySetQuery<S>,
    all: boolean = false
  ) {
    return new QuerySet<S>(op, first, second, all);
  } 

  public constructor(
    public _op: SetOperation,
    first: QuerySelectBase<any, S, any>,
    second: QuerySetQuery<S>,
    all: boolean = false
  ) {
    super();

    const root: QuerySelectBase<{ set: any }, any, any> = this as any;
    const sourceFields = mapRecord( first._selectsExpr, (_, k) => new ExprField('set', k) ); 

    root._selects = Object.values(sourceFields);
    root._selectsExpr = sourceFields;
    root._sourcesFields = {
      set: createFieldsFactory(sourceFields as any),
    };
    root._sources = {
      set: {
        alias: 'set',
        getFields: () => sourceFields as any,
      },
    };
    
    this._queries = [first as any, second];
    this._all = [all];
  }

  public addSet(op: SetOperation, query: QuerySetQuery<S>, all: boolean = false): QuerySet<S>
  {
    if (op === this._op) {
      this._queries.push(query);
      this._all.push(all);

      return this;
    } else {
      return QuerySet.create<S>(op, this, query, all);
    }
  }

  public union(query: QuerySetQuery<S>, all: boolean = false) {
    return this.addSet('UNION', query, all);
  }

  public unionAll(query: QuerySetQuery<S>) {
    return this.addSet('UNION', query, true);
  }

  public intersect(query: QuerySetQuery<S>, all: boolean = false) {
    return this.addSet('INTERSECT', query, all);
  }

  public intersectAll(query: QuerySetQuery<S>) {
    return this.addSet('INTERSECT', query, true);
  }

  public except(query: QuerySetQuery<S>, all: boolean = false) {
    return this.addSet('EXCEPT', query, all);
  }

  public exceptAll(query: QuerySetQuery<S>) {
    return this.addSet('EXCEPT', query, true);
  }

  public orderBy<K extends SelectsKeys<S>>(select: K, order?: OrderDirection, nullsLast?: boolean): this
  public orderBy(values: ExprProvider<QuerySetType<S>, S, Expr<any> | Expr<any>[]>, order?: OrderDirection, nullsLast?: boolean): this
  public orderBy<K extends SelectsKeys<S>>(values: K | ExprProvider<QuerySetType<S>, S, Expr<any> | Expr<any>[]>, order?: OrderDirection, nullsLast?: boolean): this {
    const resolved = isString(values)
      ? this._selectsExpr[values as any]
      : this._exprs.provide(values);
    const resolvedArray = isArray(resolved)
      ? resolved
      : [ resolved ];

    this._orderBy.push(...resolvedArray.map((value) => new OrderBy(value, order, nullsLast)));

    return this;
  }

  public clearOrderBy(): this {
    this._orderBy = [];

    return this;
  }

  public limit(limit?: number): this {
    this._limit = limit;

    return this;
  }

  public offset(offset?: number): this {
    this._offset = offset;

    return this;    
  }

}