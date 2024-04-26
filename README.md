# knex-migration-generator

### To run this project the following is required.
#### 'config' folder with the following files. 
 ```
 - .env
 - migration.js
 - seedings.js
 ```

.env 
----
```
DB_CLIENT=mysql
DB_HOST=xxxXXXxxx
DB_USERNAME=xxxXXXxxx
DB_PASSWORD=xxxXXXxxx
DB_NAME=xxxXXXxxx
DB_PREFIX =xxxXXXxxx
SCHEMA_NAME=xxxXXXxxx
```

migration.js
---
```
# Table names to ignore from migration
const IGNORED_TABLES = [
    'xxxXXXxxx', 'xxxXXXxxx'
];

module.exports = {
    IGNORED_TABLES
};

```

seedings.js
---
```
# Lookup tables to generate seeds
const SEED_TABLES_WITHOUT_PREFIX = [
    'xxxXXXxxx', 'xxxXXXxxx'
];

# Column names to ignore
const IGNORED_COLUMNS = [
    'xxxXXXxxx', 'xxxXXXxxx'
];

module.exports = {
    SEED_TABLES_WITHOUT_PREFIX,
    IGNORED_COLUMNS
}
```

## To run the project
```shell
npm install
npm run migration
npm run seed
```

A new folder will be created with migration and seed folders.
