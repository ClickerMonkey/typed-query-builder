import { ExprPredicateBinaryList, isArray } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { predicate } from '../util';


RunTransformers.setTransformer(
  ExprPredicateBinaryList, 
  (v, transform) => {
    const value = transform(v.value);
    const list = isArray(v.test)
      ? v.test.map(transform)
      : transform(v.test);
    
    return (sources, params, state) => {
      const test = value(sources, params, state);

      return isArray(list)
        ? v.pass === 'ANY'
          ? list.some((item) => predicate(v.type, item(sources, params, state), test))
          : !list.some((item) => !predicate(v.type, item(sources, params, state), test))
        : v.pass === 'ANY'
          ? list(sources, params, state).some((item) => predicate(v.type, item, test))
          : !list(sources, params, state).some((item) => !predicate(v.type, item, test));
    };
  }
);