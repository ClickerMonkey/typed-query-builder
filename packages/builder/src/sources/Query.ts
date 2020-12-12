import { Name, Selects } from '../Types';
import { Expr } from '../exprs';
import { ExprField } from '../exprs/Field';
import { QuerySelectBase } from '../query/Base';
import { SourceBase } from './Base';
import { SourceFieldsFromSelects } from './Source';


export class SourceQuery<A extends Name, S extends Selects> extends SourceBase<A, S> 
{

  public select: SourceFieldsFromSelects<S>;

  public constructor(
    alias: A,
    public query: QuerySelectBase<any, S, any>
  ) {
    super( alias );

    this.select = Object.create(null);
    for (const select of query._selects) {
      (this.select as any)[select.alias] = new ExprField(alias, select.alias);
    }
  }

  public getFields(): SourceFieldsFromSelects<S> {
    return this.select;
  }

  public getExpr(): Expr<S[]> {
    return this.query;
  }

}