import { Expr } from '../builder/exprs/Expr';


export type QueryValueClass<T extends Expr<any>> = { new(...args: any[]): T, id: string };

export type QueryTransformFactory<O> = (value: Expr<any>) => O;

export type QueryTransformFunction<T extends Expr<any>, F extends QueryTransformFactory<any>> = (instance: T, factory: F) => (F extends QueryTransformFactory<infer O> ? O : never);

export type QueryValueValidator<T extends Expr<T>> = (value: T) => boolean;


export class QueryTransformer<T extends QueryTransformFactory<any>> 
{

  public transform: T;

  public constructor(
    public transformers: Map<QueryValueClass<any>, QueryTransformFunction<any, T>> = new Map(),
    public validators: Map<QueryValueClass<any>, QueryValueValidator<any>> = new Map(),
  ) {
    this.transform = ((value) => 
    {
      const transformer = this.transformers.get((value as any).constructor);
      if (!transformer) {
        throw new Error(`Missing transformer for ${value}`);
      }
      
      return transformer(value, this.transform);
    }) as T;
  } 

  public setTransformer<V extends Expr<any>>(construct: QueryValueClass<V>, transform: QueryTransformFunction<V, T>): this 
  {
    this.transformers.set(construct, transform);

    return this;
  }

  public setValidator<V extends Expr<any>>(construct: QueryValueClass<V>, validator: QueryValueValidator<V>): this
  {
    this.validators.set(construct, validator);

    return this;
  }

  public extend(): QueryTransformer<T> 
  {
    return new QueryTransformer<T>(new Map(this.transformers), new Map(this.validators));
  }
  
}

