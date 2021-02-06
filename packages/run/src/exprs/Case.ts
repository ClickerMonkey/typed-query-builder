import { ExprCase } from '@typed-query-builder/builder';
import { RunExprNoop } from '../Compiler';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprCase, 
  (v, transform, compiler) => {
    const value = compiler.eval(v.value);
    const cases = v.cases.map(([caseValue, caseResult]) => [compiler.eval(caseValue), compiler.eval(caseResult)]);
    const otherwise = v.otherwise ? compiler.eval(v.otherwise) : RunExprNoop;

    return (state) => {
      const x = value.get(state);

      for (const [caseValue, caseResult] of cases) {
        if (x === caseValue.get(state)) {
          return caseResult.get(state);
        }
      }

      return otherwise.get(state);
    };
  }
);