import { ExprPredicates } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprPredicates, 
  (v, transform) => {
    const conditions = v.predicates.map(transform);

    if (v.type === 'AND') {
      return (sources, params, state) => !conditions.some((c) => !c(sources, params, state));
    } else {
      return (sources, params, state) => conditions.some((c) => c(sources, params, state));
    }
  }
);