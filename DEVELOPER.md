## Developer Notes

## Requirements
- **Docker**: Used for testing against real databases.

### Commands
```bash
# Run these before you try to publish
yarn run compile
yarn run †est

# Specific package commands
yarn builder compile
# packages: builder, mssql, pgsql, runtime, sql, sql-mssql, sql-pgsql

# Publishing all changed packages
lerna publish
```