import { isArray, StatementUpdate } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { convertToTuples, rowsBuildSelects } from '../util';
import { buildsSetter } from '../util/set';



RunTransformers.setTransformer(
  StatementUpdate, 
  (v, transform, compiler, tuples) => {
    const returning = rowsBuildSelects(v._returning, compiler);
    const where = v._where.map( w => compiler.eval( w ) );
    const setter = buildsSetter(v._sets, compiler);

    return (state) => 
    {
      const targetName = v._target.table in state.sources
        ? v._target.table as string
        : v._target.name as string;
      const target = state.sources[targetName];
      
      if (!isArray(target))
      {
        throw new Error(`Cannot update from missing source ${targetName}`);
      }

      const updated: any[] = [];

      for (let i = 0; i < target.length; i++)
      {
        const row = target[i];

        state.row = { [targetName]: row };

        if (!where.some( w => !w.get(state) ))
        {
          updated.push(row);
          state.affected++;
          
          setter(state, row);
        }
      }

      if (v._returning.length > 0 && updated.length > 0)
      {
        const innerState = state.extend();

        innerState.sources[targetName] = updated;

        innerState.results = updated.map( (row, partitionIndex) => ({
          row: { [targetName]: row },
          group: [],
          cached: {},
          selects: {},
          partition: 0,
          partitionIndex,
          partitionSize: updated.length,
          partitionValues: [],
          peer: 0,
          peerIndex: 0,
          peerSize: 0,
          peerValues: [],
        }));

        for (const result of innerState.results)
        {
          result.group = innerState.results;
        }

        returning(innerState);

        const results = innerState.results.map( r => r.selects );

        state.affected += innerState.affected;

        return tuples
          ? convertToTuples(results, v._returning)
          : results;
      }

      return [];
    };
  }
);