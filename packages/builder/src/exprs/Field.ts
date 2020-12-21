import {
  Name, SourceFieldsFunctions, Selects, SourceFieldsFromSelects, SourceFieldsFactory, Select, SelectAliased, ExprScalar,
  ExprKind, NamedSource, query, Expr, isArray
} from '../internal';


export class ExprField<F extends Name, T> extends ExprScalar<T> implements Select<F, T>
{

  
  public static createFields<N extends Name, S extends Selects>(source: NamedSource<N, S>, selects: S): SourceFieldsFromSelects<S>
  {
    return selects.reduce((fields, select) => 
    {
      fields[select.alias] = new ExprField(source as any, select.alias);

      return fields;
    }, {} as SourceFieldsFromSelects<S>);
  }

  public static createFieldsFactory<S extends Selects>(selects: S, fields: SourceFieldsFromSelects<S>): SourceFieldsFactory<S> 
  {
    const fns: SourceFieldsFunctions<S> = {
      all: () => selects,
      only: (...onlyInput: any[]) => {
        const only = isArray(onlyInput[0]) ? onlyInput[0] : onlyInput;

        return only.map( (field) => fields[field] ) as any;
      },
      exclude: (...excludeInput: any[]) => {
        const exclude = isArray(excludeInput[0]) ? excludeInput[0] : excludeInput;

        return selects.filter( s => exclude.indexOf(s.alias) === -1 ) as any;
      },
      mapped: (map) => {
        const out = [];

        for (const prop in map)
        {
          out.push(new SelectAliased(prop, fields[map[prop] as any]));
        }
    
        return out as any;
      },
    };

    return Object.assign(fns, fields) as any;
  }
  
  public static readonly id = ExprKind.FIELD;

  public constructor(
    public source: NamedSource<any, any>,
    public alias: F
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.FIELD;
  }

  public isSimple(): boolean {
    return true;
  }

  public getExpr(): ExprScalar<T> {
    return this;
  }

  public count(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>, distinct: boolean = false): ExprScalar<number> {
    return query().from(this.source).where(conditions || []).count(distinct, this);
  }

  public sum(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): T extends number ? ExprScalar<number> : never {
    return query().from(this.source).where(conditions || []).sum(this as any) as any;
  }

  public avg(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): T extends number ? ExprScalar<number> : never {
    return query().from(this.source).where(conditions || []).avg(this as any) as any;
  }

  public min(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): T extends number ? ExprScalar<number> : never {
    return query().from(this.source).where(conditions || []).min(this as any) as any;
  }

  public max(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): T extends number ? ExprScalar<number> : never {
    return query().from(this.source).where(conditions || []).max(this as any) as any;
  }

  public list(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): Expr<T[]> {
    return query().from(this.source).where(conditions || []).list(this) as any;
  }

  public first(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): Expr<T> {
    return query().from(this.source).where(conditions || []).value(this as any) as any;
  }
 
}