import { keys } from '../fns';
import { Selects, SelectsFromObject, SelectsKeys, ObjectFromSelects, Cast } from '../Types';
import { Source } from './Source';
import { ExprKind } from '../Kind';


export function defineValues<T extends Record<string, any>>(constants: T[], columns?: Array<keyof T>): Source<Cast<SelectsFromObject<T>, Selects>>
{
  return new SourceValues<Cast<SelectsFromObject<T>, Selects>>(constants as any, columns || SourceValues.calculateColumns(constants) as any);
}

export class SourceValues<S extends Selects> extends Source<S> 
{

  public static calculateColumns<T>(constants: T[]): Array<keyof T> {
    const columnMap: Record<keyof T, true> = Object.create(null);

    for (const c of constants) {
      for (const prop in c) {
        columnMap[prop] = true;
      }
    }

    return keys(columnMap);
  }

  public selects: S;

  public constructor(
    public constants: ObjectFromSelects<S>[],
    public columns: SelectsKeys<S>,
  ) {
    super();

    this.selects = columns.map((alias) => ({
      alias,
      getInferredType(): any {},
      getExpr: () => this,
    })) as any as S;
  }

  public getKind(): ExprKind {
    return ExprKind.VALUES;
  }

  public getSelects(): S {
    return this.selects;
  }

}