import { ExprOperationBinary } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprOperationBinary, 
  (v, transform) => {
    const first = transform(v.first);
    const second = transform(v.second);

    return (sources, params, state) => {
      const a = first(sources, params, state);
      const b = second(sources, params, state);
      
      if (a === undefined || b === undefined) {
        return undefined;
      }

      switch (v.type) {
        case '%': return a % b;
        case '*': return a * b;
        case '+': return a + b;
        case '-': return a - b;
        case '/': return a / b;
        case 'BITAND': return a & b;
        case 'BITLEFT': return a << b;
        case 'BITRIGHT': return a >> b;
        case 'BITXOR': return a ^ b;
        case 'BITOR': return a | b;
      }
    }
  }
);