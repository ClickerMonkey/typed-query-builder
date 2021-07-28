import {
  Name, SourceFieldsFunctions, Selects, SourceFieldsFromSelects, SourceFieldsFactory, Select, SelectAliased, ExprScalar,
  ExprKind, NamedSource, query, Expr, TextModifyType, modifyText, _Boolean, _Int, _Floats, _Dates, _Numbers, _BigInt
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
    const mapSelects = (selects: Selects, prefix: string = '', modify: TextModifyType = 'NONE'): any =>
    {
      if (!prefix && modify === 'NONE') 
      {
        return selects;
      } 
      else 
      {
        return selects.map( (s) => new SelectAliased(prefix + modifyText(String(s.alias), modify), s) );
      }
    }

    const fns: SourceFieldsFunctions<S> = 
    {
      all: (prefix: string = '', modify: TextModifyType = 'NONE') => 
      {
        return mapSelects(selects, prefix, modify)
      },
      only: (onlyInput?: string[], prefix: string = '', modify: TextModifyType = 'NONE') => 
      {
        const only = onlyInput
          ? onlyInput.map( (field) => fields[field as any] )
          : [];

        return mapSelects(only, prefix, modify);
      },
      exclude: (excludeInput?: string[], prefix: string = '', modify: TextModifyType = 'NONE') => 
      {
        const exclude = excludeInput
          ? selects.filter( s => excludeInput.indexOf(s.alias as any) === -1 )
          : selects;

        return mapSelects(exclude, prefix, modify);
      },
      mapped: (map) => 
      {
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

  public isSimple(): boolean 
  {
    return true;
  }

  public getExpr(): ExprScalar<T> 
  {
    return this;
  }

  public required(): ExprField<F, Exclude<T, null | undefined>>
  {
    return this as any;
  }

  public optional(): ExprField<F, T | null | undefined>
  {
    return this as any;
  }

  public nullable(): ExprField<F, T | null>
  {
    return this as any;
  }

  public undefinable(): ExprField<F, T | undefined>
  {
    return this as any;
  }

  public count(conditions?: ExprScalar<_Boolean>[] | ExprScalar<_Boolean>, distinct: boolean = false): ExprScalar<_BigInt> 
  {
    return query().from(this.source).where(conditions || []).count(distinct, this);
  }

  public sum(conditions?: ExprScalar<_Boolean>[] | ExprScalar<_Boolean>): T extends _Numbers ? ExprScalar<_Floats> : never 
  {
    return query().from(this.source).where(conditions || []).sum(this as any) as any;
  }

  public avg(conditions?: ExprScalar<_Boolean>[] | ExprScalar<_Boolean>): T extends _Numbers ? ExprScalar<_Floats> : never 
  {
    return query().from(this.source).where(conditions || []).avg(this as any) as any;
  }

  public min(conditions?: ExprScalar<_Boolean>[] | ExprScalar<_Boolean>): ExprScalar<T> 
  {
    return query().from(this.source).where(conditions || []).min(this as any) as any;
  }

  public max(conditions?: ExprScalar<_Boolean>[] | ExprScalar<_Boolean>): ExprScalar<T>
  {
    return query().from(this.source).where(conditions || []).max(this as any) as any;
  }

  public list(conditions?: ExprScalar<_Boolean>[] | ExprScalar<_Boolean>): Expr<T[]> 
  {
    return query().from(this.source).where(conditions || []).list(this) as any;
  }

  public first(conditions?: ExprScalar<_Boolean>[] | ExprScalar<_Boolean>): Expr<T> 
  {
    return query().from(this.source).where(conditions || []).value(this as any) as any;
  }
 
}