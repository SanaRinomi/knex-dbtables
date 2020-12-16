const knex = require("knex");
const {Table} = require("./tables");

/**
 * Class for DB management.
 */
class DataBase {
    /**
     * Create a DB mananger instance.
     * @param {object} knex_options - Standard Knex config values or an existing knex object.
     * @param {string} prefix - Prefix to add to the tables created by the manager.
     */
    constructor(knex_options, prefix = "") {
        this.db = knex_options.client && typeof knex_options.client === "string" ? knex(knex_options) : knex_options;
        this.prefix = prefix;

        this.tables = new Map();
        this.toCreate = [];
    }
    
    /**
     * Add the table and mark it for creation if needed.
    * @param {object} table - Options for the table.
     * @param {string} table.name - Name of the table.
     * @param {object} table.columns - JSON containing all the columns for the table.
     * @param {boolean} create - Whether or not to create the table.
     */
    addTable(table = {name, columns}, create = true) {
        const tableInst = new Table(this, table);
        if(create) this.toCreate.push(tableInst);

        return tableInst;
    }

    /**
     * Create all tables marked for creation.
     * @param {boolean} checkExist - Check whether or not the tables exist.
     */
    async create(checkExist = true) {
        for (let i = 0; i < this.toCreate.length; i++) {
            const table = this.toCreate[i];
            if(checkExist && await this.db.schema.hasTable(table.name))
                continue;
            await table.create();
        }

        this.toCreate = [];
    }
}

module.exports = DataBase;