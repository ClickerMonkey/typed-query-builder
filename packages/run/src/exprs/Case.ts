import { ExprCase } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprCase, 
  (v, transform) => {
    const value = transform(v.value);
    const cases = v.cases.map(([caseValue, caseResult]) => [transform(caseValue), transform(caseResult)]);
    const otherwise = v.otherwise ? transform(v.otherwise) : () => undefined;

    return (sources, params, state) => {
      const x = value(sources, params, state);

      for (const [caseValue, caseResult] of cases) {
        if (x === caseValue(sources, params, state)) {
          return caseResult(sources, params, state);
        }
      }

      return otherwise(sources, params, state);
    };
  }
);