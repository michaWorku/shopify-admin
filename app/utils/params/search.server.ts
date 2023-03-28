/**
 * Create filters to allow a particular search word to be used to search across all available column names.
 * @param {string} search - The search term to lookfor.
 * @returns {obj} filter object.
 */
export const searchCombinedColumn = (filterItem: any, columnNames: string[], type?: string) => {
    let operator: string
    let searchArray: any

    if (!!type && type === 'search') {
        operator = 'contains'
        searchArray = filterItem?.trim().toLowerCase().split(' ')
    } else {
        operator = filterItem.operator
        searchArray = filterItem.value.trim().toLowerCase().split(' ')
    }

    const filter = {
        OR: [
            {
                ...(searchArray.length === 1
                    ? {
                        OR: columnNames.map(columnName => ({
                            [columnName]: {
                                [operator]: searchArray[0],
                                mode: 'insensitive',
                            },
                        })),
                    }
                    : {}),
                ...(searchArray.length === 2
                    ? {
                        AND: [
                            {
                                OR: columnNames.slice(0, 2).map(columnName => ({
                                    [columnName]: {
                                        [operator]: searchArray[0],
                                        mode: 'insensitive',
                                    },
                                })),
                            },
                            {
                                OR: columnNames.slice(1).map(columnName => ({
                                    [columnName]: {
                                        [operator]: searchArray[1],
                                        mode: 'insensitive',
                                    },
                                })),
                            },
                        ],
                    }
                    : {}),
                ...(searchArray.length === 3
                    ? {
                        AND: columnNames.map((columnName, index) => ({
                            [columnName]: {
                                [operator]: searchArray[index],
                                mode: 'insensitive',
                            },
                        })),
                    }
                    : {}),
            },
        ],
    }
    console.dir(filter, { depth: null })
    return filter
}

/**
 * Creates a search filter object based on the given search term and schema.
 * @param {string} search - The search term to use.
 * @param {string} schema - The schema to search on.
 * @param {string[]} searchColumns - The list of columns to search on.
 * @returns {object} The search filter object.
 */
export const searchFunction = (search: string, schema: string, searchColumns?: string[]): object => {
    /**
     * The JSON schema object.
     * @type {object}
     */
    const jsonSchema = require('../../../prisma/json-schema/json-schema.json');

    /**
     * The model schema object.
     * @type {object}
     */
    const modelSchema = jsonSchema?.definitions?.[schema]?.properties;

    if (search) {
        const searchParams = {
            OR: Object.keys(modelSchema)?.map((item) => {
                if (modelSchema[item]?.originalType === 'String') {
                    if (schema === 'User' && !!searchColumns) {
                        /**
                         * The search filter object for combined columns.
                         * @type {object}
                         */
                        const searchFilter = searchCombinedColumn(search, searchColumns, 'search');

                        return searchFilter;
                    } else {
                        if (search.split(' ').length && !!searchColumns) return searchCombinedColumn(search, searchColumns, 'search')
                        return {
                            [item]: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        };
                    }
                } else {
                    return {};
                }
            }),
        };

        return searchParams;
    } else {
        return {};
    }
};
