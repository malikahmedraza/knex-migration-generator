const {getTableData} = require('./util/sql');
const {initializePath, createFile, getTemplate} = require('./util/file');
const {processConcurrently} = require('./util/concurrency');
const {SEED_TABLES_WITHOUT_PREFIX, IGNORED_COLUMNS} = require('../config/seeding');
const path = require('path');

const DB_PREFIX = process.env.DB_PREFIX;
const SEED_PATH = path.join(__dirname, '../db/seeds');
const DATA_PATH = path.join(SEED_PATH, './data');
const SEED_TEMPLATE_PATH = path.join(__dirname, '../templates/seed.hbs');

const createSeedFile = async (tableNameWithoutPrefix) => {
    const tableName = DB_PREFIX + tableNameWithoutPrefix;
    let tableData = await getTableData(tableName);
    tableData = tableData.map(item => {
        IGNORED_COLUMNS.forEach(columnName => delete item[columnName]);
        return item;
    });
    const strData = JSON.stringify(tableData, null, '\t');
    await createFile(DATA_PATH, '', tableNameWithoutPrefix, 'json', strData);

    let template = await getTemplate(SEED_TEMPLATE_PATH);
    let templateOutput = template({
        tableNameWithoutPrefix
    });
    await createFile(SEED_PATH, '01-', tableNameWithoutPrefix, 'js', templateOutput);
    return tableName;
};

initializePath(DATA_PATH).then(async () => {
    const results = await processConcurrently(SEED_TABLES_WITHOUT_PREFIX, createSeedFile);
    console.log(results.length + ' Seed files generated!');
    process.exit(0);
});