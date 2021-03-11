const {processConcurrently} = require('./util/concurrency');
const Column = require('./generator/column');
const path = require('path');
const moment = require('moment');

const {IGNORED_TABLES} = require('../config/migration');
const {initializePath, createFile, getTemplate} = require('./util/file');
const {getTables, getColumns, getPrimaryKeyIndex, getIndexes} = require('./util/sql');

const MIGRATION_PATH = path.join(__dirname, '../db/migrations');
const MIGRATION_TEMPLATE_PATH = path.join(__dirname, '../templates/migration.hbs');
const TableType = {
    BASE_TABLE: 'BASE TABLE',
    VIEW: 'VIEW'
};
Object.freeze(TableType);

const getSanitizedTables = async (schemaName) => {
    const lstTables = await getTables(schemaName);
    return lstTables[0].filter(table => !IGNORED_TABLES.includes(table.TABLE_NAME));
};

const removePrefix = (tableName, prefix) => {
    return tableName.startsWith(prefix) ? tableName.substr(3) : tableName;
};

const createMigrationFile = async (table,
                                   schemaName = process.env.SCHEMA_NAME,
                                   dbPrefix = process.env.DB_PREFIX) => {

    const tableName = table.TABLE_NAME;
    const pkIndex = await getPrimaryKeyIndex(schemaName, tableName);
    const primaryKey = pkIndex[0].map(sqlIndex => `table.primary([${sqlIndex.COLUMN_NAME}]);`);

    const lstColumns = await getColumns(schemaName, tableName);
    const columns = lstColumns[0].map(sqlColumn => new Column(sqlColumn));

    const lstIndexes = await getIndexes(schemaName, tableName);
    const indexes = lstIndexes[0].map(sqlIndex => {
        if (sqlIndex.NON_UNIQUE === 0) {
            return `table.unique([${sqlIndex.COLUMN_NAME}], "${sqlIndex.INDEX_NAME}");`;
        }
        return `table.index([${sqlIndex.COLUMN_NAME}], "${sqlIndex.INDEX_NAME}");`;
    });

    let template = await getTemplate(MIGRATION_TEMPLATE_PATH);
    const tableNameWithoutPrefix = removePrefix(tableName, dbPrefix);
    let templateOutput = template({
        tableNameWithoutPrefix,
        primaryKey,
        columns,
        indexes,
        engine: table.ENGINE
    });

    try {
        await createFile(
            MIGRATION_PATH,
            moment().format('YYYYMMDDHmmss') + '_',
            tableNameWithoutPrefix,
            'js',
            templateOutput.replace(/&quot;/g, '"')
        );
        return tableName;
    } catch (error) {
        console.log(error);
    }
};

initializePath(MIGRATION_PATH).then(async () => {
    const tables = await getSanitizedTables(process.env.SCHEMA_NAME);
    const lstTables = tables.filter(table => table.TABLE_TYPE === TableType.BASE_TABLE);
    // const lstViews = tables.filter(table => table.TABLE_TYPE === TableType.VIEW);
    const results = await processConcurrently(lstTables, createMigrationFile);
    console.log(results.length + ' Migration files generated!');
    process.exit(0);
});