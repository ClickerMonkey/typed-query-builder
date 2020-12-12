import { Name, Selects, SourceInstanceFromSelects } from '../Types';
import { Expr } from '../exprs';
import { SourceBase } from './Base';
import { SourceFields } from './Source';


export class SourceRecursive<A extends Name, S extends Selects> extends SourceBase<A, S> 
{

  public constructor(
    alias: A,
    public initial: Expr<S[] | S>, // insert returning, delete returning, select, update returning
    public recursive: Expr<S[]>
  ) {
    super( alias );
  }

  public getFields(): SourceFields<SourceInstanceFromSelects<S>> {
    this.initial.getFields();
  }

  public getExpr(): Expr<S[]> {
    return this.initial.getExpr();
  }

}