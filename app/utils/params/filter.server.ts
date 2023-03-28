import { db } from "../../services/db.server";
import { searchCombinedColumn } from "./search.server"

/**
 * Create filters for a given shecma based on filter parameters.
 * @param {Array<object>} filter - Filter parameters.
 * @param {string} schema - Schema model name
 * @returns {obj} filter object.
 */
export const filterFunction = (
    filter: [{ id: string; operator: string; value: any }],
    schema: string
) => {
    const jsonSchema = require('../../../prisma/json-schema/json-schema.json')
    const modelSchema = jsonSchema?.definitions?.[schema]?.properties
    let relationFilters: any
    if (filter?.length) {
        const filterParams = {
            AND: filter.map((filterItem: any) => {
                const relationFilterItem = {
                    id: filterItem?.id.split('.')[1],
                    operator: filterItem.operator,
                    value: filterItem.value,
                }
                if (schema === 'User' && filterItem?.id === 'name') {
                    const nameFilterFunction =
                        searchCombinedColumn(filterItem,['firstName', 'middleName', 'lastName'])
                    return {
                        ...nameFilterFunction,
                    }
                } else if (
                    modelSchema?.[filterItem?.id]?.originalType === 'String'
                ) {
                    return {
                        [filterItem.id]: {
                            [filterItem.operator]: filterItem.value,
                            mode: 'insensitive',
                        },
                    }
                } else if (
                    modelSchema?.[filterItem?.id] &&
                    !(
                        modelSchema?.[filterItem?.id]?.$ref ||
                        modelSchema?.[filterItem?.id]?.items?.$ref
                    )
                ) {
                    return {
                        [filterItem.id]: {
                            [filterItem.operator]: filterItem.value,
                        },
                    }
                } else if (
                    Object.keys(modelSchema)?.some(
                        (item) =>
                            modelSchema?.[item]?.$ref?.split('/')[2] ===
                            filterItem?.id?.split('.')[0]
                    )
                ) {
                    relationFilters = filterFunction(
                        [relationFilterItem],
                        filterItem?.id?.split('.')?.[0]
                    )
                    return {
                        [Object.keys(modelSchema)?.filter(
                            (item) =>
                                modelSchema?.[item]?.$ref?.split('/')[2] ===
                                filterItem?.id?.split('.')[0]
                        )[0]]: {
                            ...relationFilters,
                        },
                    }
                } else if (
                    Object.keys(modelSchema)?.some(
                        (item) =>
                            modelSchema[item]?.items?.$ref?.split('/')[2] ===
                            filter?.[0]?.id?.split('.')[0]
                    )
                ) {
                    relationFilters = filterFunction(
                        [relationFilterItem],
                        filterItem?.id?.split('.')?.[0]
                    )
                    return {
                        [Object.keys(modelSchema)?.filter(
                            (item) =>
                                modelSchema?.[item]?.items?.$ref?.split(
                                    '/'
                                )[2] === filterItem?.id?.split('.')[0]
                        )[0]]: {
                            some: {
                                ...relationFilters,
                            },
                        },
                    }
                } else if (
                    Object.keys(modelSchema)?.some(
                        (item) =>
                            modelSchema?.[item]?.items?.$ref &&
                            Object.keys(
                                jsonSchema?.definitions?.[
                                    modelSchema?.[item]?.items?.$ref?.split(
                                        '/'
                                    )[2]
                                ]?.properties
                            )?.some(
                                (elt) =>
                                    jsonSchema?.definitions?.[
                                        modelSchema?.[item]?.items?.$ref?.split(
                                            '/'
                                        )[2]
                                    ]?.properties?.[elt]?.$ref?.split(
                                        '/'
                                    )[2] === filter[0]?.id?.split('.')[0]
                            )
                    )
                ) {
                    const key = Object.keys(modelSchema)?.filter(
                        (item) =>
                            modelSchema?.[item]?.items?.$ref &&
                            Object.keys(
                                jsonSchema?.definitions?.[
                                    modelSchema?.[item]?.items?.$ref?.split(
                                        '/'
                                    )[2]
                                ]?.properties
                            )?.some(
                                (elt) =>
                                    jsonSchema?.definitions?.[
                                        modelSchema?.[item]?.items?.$ref?.split(
                                            '/'
                                        )[2]
                                    ]?.properties?.[elt]?.$ref?.split(
                                        '/'
                                    )[2] === filter[0]?.id?.split('.')[0]
                            )
                    )[0]
                    const relationKey = Object.keys(
                        jsonSchema?.definitions?.[
                            modelSchema?.[key]?.items?.$ref?.split('/')[2]
                        ]?.properties
                    )?.filter(
                        (elt) =>
                            jsonSchema?.definitions?.[
                                modelSchema?.[key]?.items?.$ref?.split('/')[2]
                            ]?.properties?.[elt]?.$ref?.split('/')[2] ===
                            filter[0]?.id?.split('.')[0]
                    )[0]
                    relationFilters = filterFunction(
                        [relationFilterItem],
                        filterItem?.id?.split('.')?.[0]
                    )
                    return {
                        [key]: {
                            some: {
                                [relationKey]: {
                                    ...relationFilters,
                                },
                            },
                        },
                    }
                } else {
                    return {}
                }
            }),
        }
        return filterParams
    } else {
        return {}
    }
}

/**
 * Create filters for a given shecma based on filter parameters.
 * @param {Array<object>} filters - Filter parameters.
 * @param {string} model - Schema model name
 * @returns {obj} filter object.
 */
export const multipleFilter = (filters: any, model: string) => {
    // @ts-ignore
    const enums =db._dmmf.modelMap[model].fields.find((field: any)=>field.kind === 'enum')
    return {
        OR: (filters.map((item: any) => {
            if (item.id === 'name') {
                return searchCombinedColumn(item.value, ['firstName', 'middleName', 'lastName'])
            }
            if (item.id === enums.name) {
                return { role: item.value.toUpperCase() }
            }
            return {
                [item.id]: {
                    contains: item.value.trim(),
                    mode: 'insensitive'
                }
            }
        }))
    }
}