import { SourceFieldsFromSelects, Name, Selects } from '../Types';
import { Expr } from '../exprs';
import { QuerySelectBase } from '../query/Base';
import { NamedSourceBase } from './NamedBase';
import {  } from '../Types';
import { createFields } from '..';


export class SourceQuery<A extends Name, S extends Selects> implements NamedSourceBase<A, S>
{

  public constructor(
    public alias: A,
    public query: QuerySelectBase<any, S, any>
  ) {
  }

  public getFields(): SourceFieldsFromSelects<S> {
    return createFields(this.query._selects);
  }

  public getExpr(): Expr<S[]> {
    return this.query;
  }

}