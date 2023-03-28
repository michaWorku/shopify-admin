import { Clear, FilterList, InsertInvitation } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { useRef, useState } from "react";

interface DatePickProps {
  table: any;
  column: any;
  columnFilterFns: Record<string, string>;
  openDate: boolean;
  setOpenDate: React.Dispatch<React.SetStateAction<boolean>>;
  setChildren: React.Dispatch<React.SetStateAction<null>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
/**
 * Date picker component.
 * @param {object} props Component props.
 * @param {import('mui-datatables').MUIDataTable} props.table Table instance.
 * @param {import('mui-datatables').MUIDataTableColumn} props.column Column instance.
 * @param {Record<string, string>} props.columnFilterFns Column filter functions.
 * @param {boolean} props.openDate Whether the date picker is open.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setOpenDate Function to set whether the date picker is open.
 * @param {React.Dispatch<React.SetStateAction<React.ReactNode>>} props.setChildren Function to set the children of the menu.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setOpen Function to set whether the menu is open.
 * @returns {JSX.Element} Date picker component.
 */
export const DatePick = ({
  table,
  column,
  columnFilterFns,
  openDate,
  setOpenDate,
  setChildren,
  setOpen,
}: DatePickProps): JSX.Element => (
  <DesktopDatePicker
    format="MM/DD/YYYY"
    value={column.getFilterValue()}
    onChange={(date) => column.setFilterValue(date)}
    open={openDate}
    onClose={() => setOpenDate(false)}
    slots={(params: any) => (
      <TextField
        {...params}
        size="small"
        variant="standard"
        helperText={`Filter Mode: ${columnFilterFns[column.id]}`}
        InputProps={{
          startAdornment: (
            <IconButton
              size="small"
              onClick={() => {
                setChildren(
                  column.columnDef.renderColumnFilterModeMenuItems({
                    column,
                    onSelectFilterMode: (filterMode: any) => {
                      table.setColumnFilterFns({
                        ...columnFilterFns,
                        [column.id]: filterMode,
                      });
                      setOpen(false);
                    },
                  })
                );
                setOpen(true);
              }}
              sx={{
                "&:hover": {
                  cursor: "pointer",
                },
              }}
            >
              <FilterList />
            </IconButton>
          ),

          endAdornment: (
            <Box sx={{ display: "flex" }}>
              <Tooltip arrow placement="bottom" title="Pick date">
                <IconButton
                  onClick={() => setOpenDate(!openDate)}
                  sx={{
                    m: 0,
                    p: 0,
                    "&:hover": {
                      cursor: "pointer",
                    },
                  }}
                >
                  <InsertInvitation />
                </IconButton>
              </Tooltip>
              <Tooltip arrow placement="right" title="Clear filter">
                <IconButton
                  onClick={() => column.setFilterValue(null)}
                  sx={{ m: 0, p: 0 }}
                >
                  <Clear />
                </IconButton>
              </Tooltip>
            </Box>
          ),
        }}
      />
    )}
  />
);

/**
 * Component DateFilter
 * A component that renders a date filter for a table column.
 *
 * @param {object} props - The props object.
 * @param {object} props.table - The table instance provided by react-table.
 * @param {object} props.column - The column instance provided by react-table.
 * @returns {JSX.Element} The DateFilter component.
 */
const  DateFilter =({ table, column }: any) : JSX.Element=>{
    const { columnFilterFns } = table.getState()
    const [openDate, setOpenDate] = useState(false)
    const [open, setOpen] = useState(false)
    const [children, setChildren] = useState(null)
    const ref = useRef()
    return (
        <Box ref={ref} sx={{ display: 'flex', alignItems: 'center' }}>
            <Menu
                anchorEl={ref.current}
                open={open}
                onClose={() => setOpen(false)}
            >
                {children}
            </Menu>
            <DatePick
                table={table}
                column={column}
                columnFilterFns={columnFilterFns}
                openDate={openDate}
                setOpenDate={setOpenDate}
                setChildren={setChildren}
                setOpen={setOpen}
            />
        </Box>
    )
}

export default DateFilter