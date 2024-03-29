// import { exprs, table, from, DataTypePoint, insert, deletes, update } from '@typed-query-builder/builder';

import { generate } from '../src/generator';
import { expectText, getConnection } from './helper';


describe('generator', () =>
{

  // person_group => PersonGroup
  function pascalCase(y: string) {
    return y.replace(/(^.|_.)/g, (x) => x.substring(x.length - 1).toUpperCase());
  }
  // person_group => personGroup
  function camelCase(y: string) {
    return y.replace(/_./g, (x) => x.substring(1).toUpperCase());
  }

  it('works', async () =>
  {
    const conn = await getConnection();

    const gen = await generate(conn, {
      tab: '  ',
      types: 'tables',
      ignore: [
        'spatial_ref_sys',
        'geocode_settings',
        'geocode_settings_default',
        'direction_lookup',
        'secondary_unit_lookup',
        'state_lookup',
        'street_type_lookup',
        'place_lookup',
        'county_lookup',
        'countysub_lookup',
        'zip_lookup_all',
        'zip_lookup_base',
        'zip_lookup',
        'zip_state',
        'zip_state_loc',
        'loader_platform',
        'loader_variables',
        'loader_lookuptables',
        'pagc_gaz',
        'pagc_lex',
        'pagc_rules',
        'topology',
        'layer',
        'schema_name',
        'table_name',
        'county',
        'state',
        'place',
        'cousub',
        'edges',
        'addrfeat',
        'faces',
        'featnames',
        'addr',
        'zcta5',
        'tract',
        'tabblock',
        'tabblock20',
        'bg',
      ],
      tableNameAlias: camelCase,
      tableVariableAlias: (x) => `${pascalCase(x)}Table`,
      columnNameAlias: camelCase,
    });

    const genFile =  gen.map(t => t.tableDefinition).join('\n\n');

    expectText({ condenseSpace: true }, genFile, `
      export const GroupTable = table({ 
        name: 'group', 
        primary: ['id'], 
        fields: { 
          id: "INT", 
          name: ["VARCHAR", 128], 
        }, 
      }); 

      export const LocationsTable = table({ 
        name: 'locations', 
        primary: ['id'], 
        fields: { 
          id: "INT", 
          location: ["NULL", "GEOMETRY"], 
          name: ["NULL", "TEXT"], 
        }, 
      });
      
      export const PersonTable = table({ 
        name: 'person', 
        primary: ['id'], 
        fields: { 
          id: "INT", 
          name: ["VARCHAR", 128], 
          email: ["VARCHAR", 128], 
          location: ["NULL", "POINT"], 
        }, 
      }); 
      
      export const PersonGroupTable = table({ 
        name: 'personGroup',
        table: 'person_group', 
        primary: ['groupId', 'personId'], 
        fields: { 
          groupId: "INT", 
          personId: "INT", 
          status: "SMALLINT", 
        }, 
        fieldColumn: {
          groupId: 'group_id',
          personId: 'person_id',
        },
      }); 
      
      export const TaskTable = table({ 
        name: 'task', 
        primary: ['id'], 
        fields: { 
          id: "INT", 
          groupId: "INT", 
          name: ["VARCHAR", 128], 
          details: "TEXT", 
          done: "BOOLEAN", 
          doneAt: ["NULL", "TIMESTAMP"], 
          parentId: ["NULL", "INT"], 
          assignedTo: ["NULL", "INT"], 
          assignedAt: ["NULL", "TIMESTAMP"], 
          createdAt: "TIMESTAMP", 
          createdBy: ["NULL", "INT"], 
        }, 
        fieldColumn: {
          groupId: 'group_id',
          doneAt: 'done_at',
          parentId: 'parent_id',
          assignedTo: 'assigned_to',
          assignedAt: 'assigned_at',
          createdAt: 'created_at',
          createdBy: 'created_by',
        },
      });
    `);
  });

});