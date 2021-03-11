const knex = require('knex');
const knexFile = require('../../knexfile');
const db = knex(knexFile);

const getTables = (schemaName) => {
    return db.raw(`select t.TABLE_NAME,
                                      t.TABLE_TYPE,
                                      t.ENGINE
                               from information_schema.TABLES t
                               where t.TABLE_SCHEMA = '${schemaName}'`);
};

const getColumns = (schemaName, tableName) => {
    return db.raw(`select c.COLUMN_NAME,
                                      c.ORDINAL_POSITION,
                                      c.COLUMN_DEFAULT,
                                      c.IS_NULLABLE,
                                      c.DATA_TYPE,
                                      c.COLUMN_TYPE,
                                      c.NUMERIC_PRECISION,
                                      c.NUMERIC_SCALE,
                                      c.CHARACTER_MAXIMUM_LENGTH,
                                      c.COLUMN_KEY,
                                      c.EXTRA,
                                      c.COLUMN_COMMENT
                               from information_schema.COLUMNS c
                               where c.TABLE_SCHEMA = '${schemaName}'
                                 and c.TABLE_NAME = '${tableName}'
                               order by c.ORDINAL_POSITION`);
};

const getPrimaryKeyIndex = (schemaName, tableName) => {
    return db.raw(`SELECT S.INDEX_NAME,
                          GROUP_CONCAT(DISTINCT CONCAT('"', S.COLUMN_NAME, '"') ORDER BY S.SEQ_IN_INDEX) COLUMN_NAME,
                          S.NON_UNIQUE,
                          S.NULLABLE
                   FROM INFORMATION_SCHEMA.STATISTICS S
                            INNER JOIN INFORMATION_SCHEMA.COLUMNS C ON
                       (C.TABLE_NAME = S.TABLE_NAME
                           AND C.TABLE_SCHEMA = S.TABLE_SCHEMA)
                   WHERE S.TABLE_SCHEMA = '${schemaName}'
                     and S.TABLE_NAME = '${tableName}'
                     and S.INDEX_NAME = 'PRIMARY'
                     and C.EXTRA != 'auto_increment'
                     and C.COLUMN_KEY = 'PRI'
                   GROUP BY
                      S.INDEX_NAME`);
};

const getIndexes = (schemaName, tableName) => {
    return db.raw(`SELECT S.INDEX_NAME,
                                      GROUP_CONCAT(CONCAT('"', S.COLUMN_NAME, '"') ORDER BY S.SEQ_IN_INDEX) COLUMN_NAME,
                                      S.NON_UNIQUE, S.NULLABLE
                               FROM INFORMATION_SCHEMA.STATISTICS S
                               WHERE S.TABLE_SCHEMA = '${schemaName}'
                                 and S.TABLE_NAME = '${tableName}'
                                 and S.INDEX_NAME != 'PRIMARY'
                               GROUP BY
                                   S.INDEX_NAME`);
};

const getTableData = (tableName) => {
    return db.from(tableName);
};

module.exports = {
    getTables,
    getColumns,
    getPrimaryKeyIndex,
    getIndexes,
    getTableData
};