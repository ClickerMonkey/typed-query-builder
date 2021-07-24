import { table, exprs, from } from '@typed-query-builder/builder';
import { exec } from '../src';


describe('TableFunction', () =>
{

  const GetRoles = table({
    name: 'getRoles',
    fields: {
      id: 'INT',
      name: 'TEXT',
    },
  });

  it('select function', () =>
  {
    const getResult = exec({}, { 
      params: {
        count: 3,
      },
      funcs: {
        getRoles: (db, params: { count?: number }) => {
          const roles: any[] = [];
          for (let id = 1; id <= params.count!; id++) {
            roles.push({ id, name: `Role ${id}` });
          }
          return roles;
        },
      }
    });

    const roleNames = from(
      GetRoles.call({
        count: exprs().param('count')
      }))
      .select(({ getRoles }) => [
        getRoles.name
      ])
      .list('name')
      .run( getResult )
    ;

    expect(roleNames).toStrictEqual([
      'Role 1', 'Role 2', 'Role 3'
    ]);
  });

});