import { Name, SourceInstance } from '../../_Types';
import { ExprField } from '../exprs/Field';
import { SourceBase } from './Base';
import { SourceFields } from './Source';


export class SourceConstant<A extends Name, T extends SourceInstance> extends SourceBase<A, T> 
{

  public select: SourceFields<T>;

  public constructor(
    public alias: A,
    public constants: T[],
    public columns: Array<keyof T>,
  ) {
    super( alias );

    this.select = Object.create(null);
    for (const column of columns) {
      this.select[column] = new ExprField(alias, column);
    }
  }

  public getFields(): SourceFields<T> {
    return this.select;
  }

}