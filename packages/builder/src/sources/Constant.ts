import { keys } from '../fns';
import { Name, SourceInstance } from '../Types';
import { ExprField } from '../exprs/Field';
import { SourceBase } from './Base';
import { Source, SourceFields } from './Source';


export function defineConstant<A extends Name, T extends SourceInstance>(alias: A, constants: T[], columns?: Array<keyof T>): Source<A, T>
{
  return new SourceConstant(alias, constants, columns || SourceConstant.calculateColumns(constants));
}

export class SourceConstant<A extends Name, T extends SourceInstance> extends SourceBase<A, T> 
{

  public static calculateColumns<T>(constants: T[]): Array<keyof T>
  {
    const columnMap: Record<keyof T, true> = Object.create(null);

    for (const c of constants) 
    {
      for (const prop in c) 
      {
        columnMap[prop] = true;
      }
    }

    return keys(columnMap);
  }

  public select: SourceFields<T>;

  public constructor(
    public alias: A,
    public constants: T[],
    public columns: Array<keyof T>,
  ) {
    super( alias );

    this.select = Object.create(null);
    for (const column of columns) 
    {
      this.select[column] = new ExprField(alias, column);
    }
  }

  public getFields(): SourceFields<T> {
    return this.select;
  }

}