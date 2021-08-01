import { 
  DataTypeInputMap, Name, Selects, SourceFieldsFromSelects, SourceFieldsFactory, 
  Source, NamedSource, ExprKind, ExprScalar, SourceTable, Traverser, Expr
} from '../internal';


export class SourceFunction<N extends Name, S extends Selects, F extends DataTypeInputMap> extends Source<S> implements NamedSource<N, S>
{

  public static readonly id = ExprKind.TABLE_FUNCTION;

  public table: SourceTable<N, S, F>;
  public parameters: Record<string, ExprScalar<any>>;

  public constructor(table: SourceTable<N, S, F>, parameters: Record<string, ExprScalar<any>>) {
    super();

    this.table = table;
    this.parameters = parameters;
  }

  public traverse<R>(traverse: Traverser<Expr<unknown>, R>): R
  {
    return traverse.enter(this, () => {
      traverse.step('params', () => {
        for (const paramName in this.parameters) {
          const paramValue = this.parameters[paramName];

          traverse.step(paramName, paramValue, (replace) => this.parameters[paramName] = replace as any);
        }
      });
    });
  }

  public getKind(): ExprKind 
  {
    return ExprKind.TABLE_FUNCTION;
  }

  public isSimple(): boolean
  {
    return this.table.isSimple();
  }

  public isVirtual(): boolean
  {
    return false;
  }

  public isSource(other: NamedSource<any, any> | Source<any>): boolean
  {
    return (this as any) === other;
  }

  public getSelects(): S 
  {
    return this.table.getSelects();
  }

  public getName(): N 
  {
    return this.table.getName();
  }

  public getSystemName(): Name | false
  {
    return this.table.table;
  }

  public getSource(): Source<S> 
  {
    return this;
  }

  public getSelectName(alias: string): string
  {
    return this.table.getSelectName(alias);
  }

  public getFields(): SourceFieldsFromSelects<S> 
  {
    return this.table.getFields();
  }

  public getFieldsFactory(): SourceFieldsFactory<S> 
  {
    return this.table.getFieldsFactory();
  }

  public getFieldTarget(field: string): string
  {
    return this.table.getFieldTarget(field);
  }

  public hasColumn(column: string): boolean
  {
    return this.table.hasColumn(column);
  }

}