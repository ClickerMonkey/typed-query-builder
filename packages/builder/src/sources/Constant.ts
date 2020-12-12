import { keys } from '../fns';
import { Name, Selects, SelectsFromObject, SelectsKeys, ObjectFromSelects, Cast } from '../Types';
import { ExprField } from '../exprs/Field';
import { SourceBase } from './Base';
import { Source, SourceFieldsFromSelects } from './Source';


export function defineConstant<A extends Name, T extends Record<string, any>>(alias: A, constants: T[], columns?: Array<keyof T>): Source<A, Cast<SelectsFromObject<T>, Selects>>
{
  return new SourceConstant<A, Cast<SelectsFromObject<T>, Selects>>(alias, constants as any, columns || SourceConstant.calculateColumns(constants) as any);
}

export class SourceConstant<A extends Name, T extends Selects> extends SourceBase<A, T> 
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

  public select: SourceFieldsFromSelects<T>;

  public constructor(
    public alias: A,
    public constants: ObjectFromSelects<T>[],
    public columns: SelectsKeys<T>,
  ) {
    super( alias );

    this.select = Object.create(null);
    for (const column of columns) 
    {
      this.select[column ] = new ExprField(alias, column);
    }
  }

  public getFields(): SourceFieldsFromSelects<T> {
    return this.select;
  }

}