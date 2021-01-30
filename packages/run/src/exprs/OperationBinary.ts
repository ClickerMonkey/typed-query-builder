import { ExprOperationBinary } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprOperationBinary, 
  (v, transform, compiler) => {
    const first = compiler.eval(v.first);
    const second = compiler.eval(v.second);

    return (state) => {
      const a = first.get(state);
      const b = second.get(state);
      
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