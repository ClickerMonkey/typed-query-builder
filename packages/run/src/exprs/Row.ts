import { ExprRow } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprRow, 
  (v, transform, compiler) => {
    const elements = v.elements.map( e => compiler.eval(e) );

    return (state) => elements.map( e => e.get(state) );
  }
);