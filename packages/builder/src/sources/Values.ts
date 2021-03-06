import { keys, Selects, SelectsKeys, ObjectFromSelects, Tuple, SelectsFromTypeAndColumns, Source, ExprKind } from '../internal';


export class SourceValues<S extends Selects> extends Source<S> 
{

  public static readonly id = ExprKind.VALUES;

  public static create<T extends Record<string, any>, C extends Tuple<keyof T>>(constants: T[], columns?: C): Source<SelectsFromTypeAndColumns<T, C>>
  {
    return new SourceValues<SelectsFromTypeAndColumns<T, C>>(constants as any, columns || SourceValues.calculateColumns(constants) as any);
  }

  public static calculateColumns<T>(constants: T[]): Array<keyof T> 
  {
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

  public getKind(): ExprKind 
  {
    return ExprKind.VALUES;
  }

  public hasAnonymousSelects(): boolean
  {
    return true;
  }

  public getSelects(): S 
  {
    return this.selects;
  }

}