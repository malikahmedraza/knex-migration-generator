class Column {
    constructor(column) {
        const {
            TABLE_NAME: tableName,
            COLUMN_NAME: columnName,
            ORDINAL_POSITION: ordinalPosition,
            COLUMN_DEFAULT: defaultValue,
            IS_NULLABLE: isNullable,
            DATA_TYPE: dataType,
            COLUMN_TYPE: columnType,
            NUMERIC_PRECISION: precision,
            NUMERIC_SCALE: scale,
            CHARACTER_MAXIMUM_LENGTH: maximumLength,
            COLUMN_KEY: columnKey,
            EXTRA: extra,
            COLUMN_COMMENT: comment
        } = column;

        this.tableName = tableName;
        this.columnName = columnName;
        this.ordinalPosition = ordinalPosition;
        this.defaultValue = defaultValue;
        this.isNullable = isNullable;
        this.dataType = dataType;
        this.columnType = columnType;
        this.precision = precision;
        this.scale = scale;
        this.maximumLength = maximumLength;
        this.columnKey = columnKey;
        this.extra = extra;
        this.comment = comment;
    }

    getKnexCreateColumn() {
        const dataTypes = {
            'auto_increment': `increments("${this.columnName}", ${this.precision + 1})${this.columnType.indexOf('unsigned') > -1 ? '.unsigned()' : ''}${this.columnKey === 'PRI' ? '.primary()' : ''}`,
            'int': `integer("${this.columnName}", ${this.precision + 1})${this.columnType.indexOf('unsigned') > -1 ? '.unsigned()' : ''}`,
            'varchar': `string("${this.columnName}", ${this.maximumLength})`,
            'datetime': `datetime("${this.columnName}")`,
            'enum': `enum("${this.columnName}", [${this.columnType.substring(5, this.columnType.length - 1).replace(/'/g, '"')}])`,
            'float': `float("${this.columnName}", ${this.precision}, ${this.scale})`,
            'text': `text("${this.columnName}")`,
            'timestamp': `timestamp("${this.columnName}")`,
            'date': `date("${this.columnName}")`,
            'time':  `time("${this.columnName}")`,
            'tinyint': `specificType("${this.columnName}", "tinyint(${this.precision})")`,
            'smallint': `specificType("${this.columnName}", "smallint(${this.precision})")`,
            'char':  `specificType("${this.columnName}", "char(${this.maximumLength || 1})")`,
            'double':  `specificType("${this.columnName}", "double precision")`,
            'longtext': `text("${this.columnName}", "longtext")`,
        }

        const dataType = this.extra === 'auto_increment' ? this.extra : this.dataType;
        return dataTypes[dataType];
    }

    toString() {
        let knexColumn = `table.${this.getKnexCreateColumn()}`;
        if (this.columnKey !== 'PRI') {
            knexColumn += this.isNullable === 'NO' ? '.notNullable()' : '.nullable()';
        }
        if (this.defaultValue) {
            if (this.dataType === 'timestamp') {
                if (this.defaultValue === 'CURRENT_TIMESTAMP') {
                    if (this.extra === 'on update CURRENT_TIMESTAMP') {
                        knexColumn += '.defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))';
                    } else {
                        knexColumn += '.defaultTo(knex.fn.now())';
                    }
                } else {
                    knexColumn += '.defaultTo(knex.fn.now())';
                }
            } else {
                if (isNaN(this.defaultValue)) {
                    knexColumn += `.defaultTo("${this.defaultValue}")`
                } else {
                    knexColumn += `.defaultTo(${this.defaultValue})`
                }
            }
        }
        if (this.comment) {
            knexColumn += `.comment("${this.comment}")`;
        }
        knexColumn += ";";
        /*
            const indentation = '\r\n\t\t\t\t';
            if (this.columnKey === 'MUL') {
                knexColumn += `${indentation}table.index("${this.columnName}", "${this.columnName}");`
            } else if (this.columnKey === 'UNI') {
                knexColumn += `${indentation}table.unique("${this.columnName}", "${this.columnName}");`
            }
        */
        return knexColumn;
    }
}

module.exports = Column;