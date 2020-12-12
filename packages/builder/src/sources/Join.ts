import { Name, JoinType, Selects } from '../Types';
import { Expr } from '../exprs/Expr';
import { SourceBase } from './Base';
import { Source, SourceFieldsFromSelects } from './Source';


export class SourceJoin<A extends Name, T extends Selects> extends SourceBase<A, T> 
{

  public constructor(
    public source: Source<A, T>,
    public type: JoinType,
    public condition: Expr<boolean>
  ) {
    super( source.alias );
  }

  public getFields(): SourceFieldsFromSelects<T> {
    return this.source.getFields();
  }

}