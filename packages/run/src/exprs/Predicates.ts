import { ExprPredicates } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprPredicates, 
  (v, transform, compiler) => {
    const conditions = v.predicates.map( e => compiler.eval(e) );

    if (v.type === 'AND') {
      return (state) => !conditions.some((c) => !c.get(state));
    } else {
      return (state) => conditions.some((c) => c.get(state));
    }
  }
);