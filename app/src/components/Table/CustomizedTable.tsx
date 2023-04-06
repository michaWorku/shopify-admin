import { Box } from "@mui/material";
import MaterialReactTable from "material-react-table";
import useParams from "~/src/hooks/useParams";
import CustomToolbar from "./CustomToolbar";

/**
 * Customized table component that wraps MaterialReactTable and adds custom features
 * @param {Object} props - The component props
 * @param {Array<Object>} props.columns - The table columns
 * @param {Object} props.data - The table data
 * @param {number} props.page - The current page number
 * @param {boolean} [props.enableExport=true] - Whether to enable export functionality
 * @param {string} [props.exportFileName] - The export file name
 * @param {boolean} props.loading - Whether the table data is loading
 * @param {string} [props.height] - The table height
 * @param {Function} [props.customAction] - Custom action to render in the toolbar
 * @returns {JSX.Element} - The customized table component
 */
const CustomizedTable = ({
  columns,
  data,
  page,
  enableExport = true,
  exportFileName,
  loading,
  height,
  customAction,
}: any): JSX.Element => {
  const {
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
  } = useParams(columns);

  return (
    <Box sx={{ height: 200 }}>
      <MaterialReactTable
        columns={columns}
        data={data?.data?.data || data?.data || data || []}
        rowCount={data?.metaData?.total || 0}
        enableColumnFilterModes
        enableColumnResizing
        enableStickyHeader
        enableColumnOrdering
        enableRowSelection
        enablePinning
        manualFiltering
        manualPagination
        manualSorting
        onColumnFiltersChange={setColumnFilters}
        onColumnFilterFnsChange={setColumnFilterFns}
        onGlobalFilterChange={setGlobalFilter}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        muiLinearProgressProps={({ isTopToolbar }) => ({
          sx: {
            display: isTopToolbar ? "block" : "none",
          },
        })}
        state={{
          columnFilters: columnFilters || [],
          columnFilterFns,
          globalFilter: globalFilter || "",
          pagination,
          sorting: sorting || [],
          showAlertBanner: data?.error,
          showProgressBars: loading,
        }}
        initialState={{
          columnPinning: {
            right: ["status", "actions"],
          },
        }}
        muiToolbarAlertBannerProps={
          data?.error
            ? {
                color: "error",
                children: data?.error?.error.message || "Network Error!",
              }
            : undefined
        }
        renderTopToolbarCustomActions={({ table }) =>
          data?.data?.canCreate && customAction(table)
        }
        muiTableHeadCellFilterTextFieldProps={({ column }) => ({
          helperText: `Filter Mode: ${columnFilterFns[column?.id]}`,
        })}
        renderToolbarInternalActions={({ table }) => (
          <CustomToolbar
            table={table}
            data={data}
            enableExport={enableExport}
            exportType={exportType}
            setExportType={setExportType}
            exportFileName={exportFileName}
          />
        )}
        muiTableContainerProps={{
          sx: { maxHeight: height || "calc(100vh - 230px)" },
        }}
        muiTableHeadCellProps={({ table, column }) => {
          return {
            sx: {
              "& .MuiTableCell-root": {
                boxShadow:
                  table.getState().columnPinning?.right?.[0] === column?.id
                    ? "-7px 0px 10px -1.7px lightgray"
                    : table
                        .getState()
                        .columnPinning?.left?.some((el) => el === column.id)
                    ? "7px 0px 10px -1.7px lightgray"
                    : "none",
                
              },
              "& .MuiButtonBase-root": {
                "& .PrivateSwitchBase-input": {
                  backgroundColor: "red",
                },
              },
            },
          };
        }}
        muiTableBodyCellProps={({ table, column }) => {
          return {
            sx: {
              "& .MuiTableCell-root": {
                boxShadow:
                  table.getState().columnPinning?.right?.[0] === column?.id
                    ? "-7px 0px 10px -1.7px lightgray"
                    : table
                        .getState()
                        .columnPinning?.left?.some((el) => el === column.id)
                    ? "7px 0px 10px -1.7px lightgray"
                    : "none",
              },
            },
          };
        }}
        // muiTableBodyRowProps={({ row }) => ({
        //   onClick: row.getToggleSelectedHandler(),
        //   sx: { cursor: 'pointer', background: 'lightgray' },
        // })}
      />
    </Box>
  );
};

export default CustomizedTable;
