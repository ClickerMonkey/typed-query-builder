import { Expr, ExprDeep, isArray, isPlainObject, mapRecord } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { RunState } from "../State";
import { RunCompiler } from "../Compiler";


function deepTransform(value: any, compiler: RunCompiler): any 
{
  if (isArray(value))
  {
    return value.map( x => deepTransform( x, compiler ) );
  }
  else if (value instanceof Expr)
  {
    return compiler.eval(value);
  }
  else if (isPlainObject(value))
  {
    return mapRecord(value, x => deepTransform( x, compiler ) );
  }

  return () => value;
}

function deepResolve(value: any, state: RunState): any 
{
  if (isArray(value))
  {
    return value.map( x => deepResolve(x, state) );
  }
  else if (isPlainObject(value))
  {
    return mapRecord(value, x => deepResolve(x, state) );
  }

  return value.get(state);
}

RunTransformers.setTransformer(
  ExprDeep, 
  (v, transform, compiler) => {
    const deep = deepTransform(v, compiler);

    return (state) => deepResolve(deep, state);
  },
);