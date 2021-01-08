import { ExprRow } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprRow, 
  (v, transform) => {
    const elements = v.elements.map(transform);

    return (sources, params, state) => elements.map( e => e(sources, params, state) );
  }
);