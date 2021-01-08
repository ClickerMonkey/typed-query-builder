import { ExprIn, isArray } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { compare } from '../util';


RunTransformers.setTransformer(
  ExprIn, 
  (v, transform) => {
    const value = transform(v.value);
    const list = isArray(v.list)
      ? v.list.map(transform)
      : transform(v.list);
    
    return (sources, params, state) => {
      const test = value(sources, params, state);

      return isArray(list)
        ? v.not !== list.some((item) => compare(item(sources, params, state), test))
        : v.not !== list(sources, params, state).some((item) => compare(item, test));
    };
  }
);