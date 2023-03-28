export default function getParams(request: Request) {
    const url = new URL(request.url)

    const params = url.searchParams.getAll('params')
    let param: any
    if (params.length) {
        param = JSON.parse(params[0])
    }

    let sorttype
    let sortfield
    if (param && param.sorting && param.sorting.length) {
        sortfield = param.sorting[0].id
        if (param.sorting[0].desc) {
            sorttype = 'desc'
        } else {
            sorttype = 'asc'
        }
    }

    let page
    let pageSize
    if (param && param.pagination) {
        page = param.pagination.pageIndex
        pageSize = param.pagination.pageSize
    }

    let searchVal
    if (param && param.globalFilter) {
        searchVal = param.globalFilter
    }

    let colFilter: any
    if (param && param.columnFilters) {
        param.columnFilters.map((item: any, index: number) => {
            if (
                param.columnFilterFns &&
                Object.keys(param.columnFilterFns).includes(item.id)
            ) {
                param.columnFilters[index].operator =
                    param.columnFilterFns[item.id]
            }
            return param.columnFilters
        })

        param.columnFilters.map((item: any, index: number) => {
            if (!item.operator) {
                param.columnFilters.splice(index, 1)
            }
            return param.columnFilters
        })

        colFilter = param.columnFilters
    }

    let dataExport
    if (param && param.exportType) {
        dataExport = param.exportType
    }

    type sortOrder = 'asc' | 'desc'

    const sortType = (sorttype as sortOrder) || 'desc'
    const sortField = sortfield || 'createdAt'
    const take = parseInt(pageSize) || 15
    const skip = take * parseInt(page) || 0
    const pageNo = parseInt(page) || 1
    const search = searchVal || ''
    const filter = colFilter || []
    const exportType = dataExport || 'page'

    return {
        sortType,
        sortField,
        skip,
        take,
        pageNo,
        search,
        filter,
        exportType,
    }
}
