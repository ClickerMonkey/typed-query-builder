import { ExprPredicateBinaryList, isArray } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { predicate } from '../util';


RunTransformers.setTransformer(
  ExprPredicateBinaryList, 
  (v, transform, compiler) => {
    const value = compiler.eval(v.value);
    const list = isArray(v.test)
      ? v.test.map( e => compiler.eval(e) )
      : compiler.eval(v.test);
    
    return (state) => {
      const test = value.get(state);

      return isArray(list)
        ? v.pass === 'ANY'
          ? list.some((item) => predicate(v.type, item.get(state), test))
          : !list.some((item) => !predicate(v.type, item.get(state), test))
        : v.pass === 'ANY'
          ? list.get(state).some((item) => predicate(v.type, item, test))
          : !list.get(state).some((item) => !predicate(v.type, item, test));
    };
  }
);