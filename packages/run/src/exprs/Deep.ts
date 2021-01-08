import { Expr, ExprDeep, isArray, isPlainObject, mapRecord } from '@typed-query-builder/builder';
import { RunTransformerInput, RunTransformers, RunTransformerState, RunTransformerTransformer } from '../Transformers';


function deepTransform(value: any, transform: RunTransformerTransformer): any 
{
  if (isArray(value))
  {
    return value.map( x => deepTransform( x, transform ) );
  }
  else if (value instanceof Expr)
  {
    return transform(value);
  }
  else if (isPlainObject(value))
  {
    return mapRecord(value, x => deepTransform( x, transform ) );
  }

  return () => value;
}

function deepResolve(value: any, sources: RunTransformerInput, params?: Record<string, any>, state?: RunTransformerState): any 
{
  if (isArray(value))
  {
    return value.map( x => deepResolve(x, sources, params, state) );
  }
  else if (isPlainObject(value))
  {
    return mapRecord(value, x => deepResolve(x, sources, params, state) );
  }

  return value(sources, params, state);
}

RunTransformers.setTransformer(
  ExprDeep, 
  (v, transform) => {
    const deep = deepTransform(v, transform);

    return (sources, params, state) => deepResolve(deep, sources, params, state);
  },
);