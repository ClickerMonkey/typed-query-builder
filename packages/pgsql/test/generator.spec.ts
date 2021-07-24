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
        'spatial_ref_sys'
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

      export const LocationsTable = table({ 
        name: 'locations', 
        primary: ['id'], 
        fields: { 
          id: "INT", 
          location: ["NULL", "GEOMETRY"], 
          name: ["NULL", "TEXT"], 
        }, 
      });
    `);
  });

});