/**
 * Create filters to allow a particular search word to be used to search across all available column names.
 * @param {string} search - The search term to lookfor.
 * @returns {obj} filter object.
 */
export const searchCombinedColumn = (filterItem: any, columnNames: string[], type?: string) => {
    let operator: string
    let searchArray: any
    
    if (!!type &&  type === 'search') {
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