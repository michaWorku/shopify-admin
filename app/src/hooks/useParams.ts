import { useEffect, useRef, useState } from 'react'
import type {
    ColumnFiltersState,
    PaginationState,
    SortingState,
} from '@tanstack/react-table'
import { useSearchParams, useSubmit } from '@remix-run/react'

/**
 * @typedef {Object.<string, string>} InitialFilterFunction
 */

/**
 * Custom hook to manage table parameters from search query params.
 * @param {Array} columns - Array of table columns configuration.
 * @returns {Object} Object containing all necessary parameters to use in the table.
 */
const useParams = (columns: any) => {
    /**
   * @type {InitialFilterFunction}
   */
    let initialFilterFunction = {}

    columns.map((item: any) => {
        const key = item?.accessorKey || item?.id
        let operator = ''
        switch (item?.filterVariant) {
            case 'text':
                operator = 'contains'
                break
            case 'number':
                operator = 'equals'
                break
            case 'date':
                operator = 'gte'
                break
            case 'select':
                operator = 'equals'
                break
            case 'multi-select':
                operator = 'in'
                break
            default:
                operator = 'contains'
                break
        }
        Object.assign(initialFilterFunction, { [key]: operator })
    })

    const submit = useSubmit()
    const [columnFilters, setColumnFilters] =
        useState<ColumnFiltersState>() as any
    const [columnFilterFns, setColumnFilterFns] = useState(
        initialFilterFunction
    ) as any
    const [globalFilter, setGlobalFilter] = useState()
    const [sorting, setSorting] = useState<SortingState>() as any
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 15,
    })
    const [exportType, setExportType] = useState() as any

    const currentState = useRef({
        pagination,
        globalFilter
    })

    const [searchParams] = useSearchParams()

    let currentParams: any
    for (const [key, value] of searchParams) {
        currentParams = { ...currentParams, [key]: value }
    }
    let paramObject: any = {}
    currentParams?.params
        ? (paramObject = JSON.parse(currentParams?.params))
        : undefined
    /**
      * Function to get the filter function to use in the table.
      * @returns {Object.<string, string>} Object containing filter functions for each column.
      */
    const getFilterFunction = () => {
        if (columnFilters && columnFilters.length) {
            const filterFnArray = columnFilters.map((item: any) => {
                if (
                    item?.value &&
                    (typeof item.value !== 'object' ||
                        (typeof item.value === 'object' &&
                            JSON.stringify(item?.value) !== '[]'))
                ) {
                    return Object.fromEntries(
                        Object.entries(columnFilterFns).filter(([key]) =>
                            key.includes(item.id)
                        )
                    )
                }
            })

            let filterFn = {}
            for (let i = 0; i < filterFnArray.length; i++) {
                Object.assign(filterFn, filterFnArray[i])
            }
            return filterFn
        } else {
            return {}
        }
    }

    const filterFunctions = getFilterFunction()

    if (paramObject?.columnFilters && columnFilters && !columnFilters.length) {
        delete paramObject.columnFilters
    }
    if ((paramObject?.globalFilter && globalFilter === '') || !globalFilter ) {
        delete paramObject.globalFilter
    }
    if (paramObject?.sorting && sorting && !sorting.length) {
        delete paramObject.sorting
    }
    if (paramObject?.columnFilterFns && !Object.keys(filterFunctions).length) {
        delete paramObject.columnFilterFns
    }

    useEffect(() => {
        if (currentState?.current?.pagination?.pageIndex !== pagination.pageIndex || currentState?.current?.pagination?.pageSize !== pagination.pageSize) {
            currentState.current.pagination = pagination
            const params = {
                ...paramObject,
                ...(Object.entries(pagination).length ? { pagination } : null),
            }
            submit(
                Object.keys(params).length
                    ? {
                        params: JSON.stringify(params),
                    }
                    : null
            )
        }

    }, [pagination.pageIndex, pagination.pageSize, pagination])

    useEffect(() => {
        if ((!!columnFilters && columnFilters.length) || (!!sorting && sorting.length) || currentState?.current?.globalFilter !== globalFilter || !!exportType) {
            currentState.current.globalFilter = globalFilter
            const params = {
                ...paramObject,
                ...(columnFilters && columnFilters.length ? { columnFilters } : []),
                ...(Object.entries(getFilterFunction()).length
                    ? { columnFilterFns: getFilterFunction() }
                    : {}),
                ...(globalFilter ? { globalFilter } : {}),
                ...(sorting && sorting.length ? { sorting } : null),
                ...(exportType ? { exportType } : null),
            }
            submit(
                Object.keys(params).length
                    ? {
                        params: JSON.stringify(params),
                    }
                    : null
            )
        } 
    }, [columnFilters, globalFilter, sorting, exportType, columnFilterFns])

    return {
        pagination,
        setPagination,
        columnFilters,
        setColumnFilters,
        sorting,
        setSorting,
        globalFilter,
        setGlobalFilter,
        columnFilterFns,
        setColumnFilterFns,
        exportType,
        setExportType,
    }
}

export default useParams