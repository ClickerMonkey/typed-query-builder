import { ExprIn, isArray } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { compare } from '../util';


RunTransformers.setTransformer(
  ExprIn, 
  (v, transform, compiler) => {
    const value = compiler.eval(v.value);
    const list = isArray(v.list)
      ? v.list.map( v => compiler.eval(v) )
      : compiler.eval(v.list);
    
    return (state) => {
      const test = value.get(state);

      return isArray(list)
        ? v.not !== list.some((item) => compare(item.get(state), test) === 0)
        : v.not !== list.get(state).some((item) => compare(item, test) === 0);
    };
  }
);