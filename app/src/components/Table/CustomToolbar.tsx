import { FileDownload } from "@mui/icons-material";
import {
  MRT_FullScreenToggleButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton,
} from "material-react-table";
import type {
  Theme} from "@mui/material";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { ExportToCsv } from "export-to-csv";
import { handleExportData } from "~/utils/export";

interface CustomToolbarProps {
  table: any;
  data: any;
  exportType: string;
  setExportType: (type: string) => void;
  enableExport: boolean;
  exportFileName: string;
}
/**
 * CustomToolbar component for the Material React Table.
 * @param {Object} props - Component props.
 * @param {Object} props.table - The Material React Table instance.
 * @param {Object} props.data - The data to export.
 * @param {string} props.exportType - The type of export to perform.
 * @param {function} props.setExportType - The function to set the export type.
 * @param {boolean} props.enableExport - Whether to enable the export feature.
 * @param {string} props.exportFileName - The filename to use for the exported file.
 * @returns {JSX.Element} CustomToolbar component.
 */
const CustomToolbar: React.FC<CustomToolbarProps> = ({
  table,
  data,
  exportType,
  setExportType,
  enableExport,
  exportFileName,
}: any) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  /**
   * Handles the closing of the export menu.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handles the opening of the export menu.
   * @param {Object} event - The event object.
   */
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const csvOptions = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    title: `CNCM-${exportFileName}`,
    filename: `CNCM-${exportFileName}`,
  };

  const csvExporter = new ExportToCsv(csvOptions);

  useEffect(() => {
    if (exportType && exportType === data?.metaData?.exportType) {
      csvExporter.generateCsv(data?.metaData?.exportData);
      handleExportData(data?.metaData?.exportData, `Sewasew-Reward-${exportFileName}`, `Sewasew-Reward-${exportFileName}`)
      setExportType("");
    }
  }, [exportType, data]);

  return (
    <>
      <MRT_ToggleGlobalFilterButton table={table} />
      {enableExport && (
        <Tooltip arrow placement="bottom" title="Show/Hide Export">
          <IconButton onClick={handleClick}>
            <FileDownload />
          </IconButton>
        </Tooltip>
      )}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            color: "primary.main",
            "& .MuiMenuItem-root": {
              width: "100%",
              ":hover": {
                bgcolor: (theme: Theme) => theme.palette.grey[100],
              },
            },
          }}
        >
          <MenuItem>
            <Button variant="export" onClick={() => setExportType("all")}>
              Export ALL DATA
            </Button>
          </MenuItem>
          <MenuItem>
            <Button variant="export" onClick={() => setExportType("filtered")}>
              Export FILTERED Data
            </Button>
          </MenuItem>
          <MenuItem>
            <Button variant="export" onClick={() => setExportType("page")}>
              Export THIS PAGE
            </Button>
          </MenuItem>
          <MenuItem
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
          >
            <Button
              variant="export"
              onClick={() =>
                csvExporter.generateCsv(
                  table
                    .getSelectedRowModel()
                    .rows.map((row: any) => row.original)
                )
              }
            >
              Export SELECTED ROWS
            </Button>
          </MenuItem>
        </Box>
      </Menu>
      <MRT_ToggleFiltersButton table={table} />
      <MRT_ShowHideColumnsButton table={table} />
      <MRT_ToggleDensePaddingButton table={table} />
      <MRT_FullScreenToggleButton table={table} />
    </>
  );
};

export default CustomToolbar;
