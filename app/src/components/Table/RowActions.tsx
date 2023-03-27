import { Delete, Edit, MoreVert, RemoveRedEye } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { useNavigate } from "@remix-run/react";
import { useRef, useState } from "react";


/**
 * RowActions component that renders a row actions menu for a given row in a table.
 * @component
 * @param {Object} props - The props object.
 * @param {Object} props.row - The data for the row.
 * @param {Function} props.handleDelete - The callback function to handle deleting the row.
 * @param {Boolean} [props.editCol=true] - Whether or not to show the edit column.
 * @param {Boolean} [props.deleteCol=true] - Whether or not to show the delete column.
 * @param {Boolean} [props.viewDetail=true] - Whether or not to show the view detail button.
 * @param {Boolean} [props.moreDetails=false] - Whether or not to show the more details button.
 * @param {Function} [props.setLoading] - The callback function to set loading state.
 * @param {String} [props.page] - The current page name.
 * @param {Array} [props.routeMenus] - An array of route menus.
 * @returns {JSX.Element} A JSX Element that renders the row actions menu for a given row in a table.
*/
const RowActions=({
  row,
  handleDelete,
  editCol,
  deleteCol,
  viewDetail,
  moreDetails,
  setLoading,
  page,
  routeMenus,
}: any): JSX.Element =>{
  const navigate = useNavigate();
  const ref = useRef();
  const [open, setOpen] = useState(false);

  function RouteMenu({ children, route }: any) {
    return (
      <MenuItem onClick={() => navigate(`${row.original.id}/${route}`)}>
        {children}
      </MenuItem>
    );
  }

  return (
    <Box sx={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
      {viewDetail !== false && (
        <Tooltip arrow placement="left" title="View">
          <IconButton
            onClick={() => {
              setLoading && setLoading(true);
              page === "news"
                ? navigate(`${row.original.id}/detail`)
                : navigate(`${row.original.id}?view=true`);
            }}
          >
            <RemoveRedEye />
          </IconButton>
        </Tooltip>
      )}
      {editCol !== false && (row.original.canEdit || page === "role") && (
        <Tooltip arrow placement="right" title="Edit">
          <IconButton
            color="default"
            onClick={() => {
              setLoading && setLoading(true);
              navigate(row.original.id);
            }}
          >
            <Edit />
          </IconButton>
        </Tooltip>
      )}
      {deleteCol !== false && row.original.canDelete && (
        <Tooltip arrow placement="right" title="Delete">
          <IconButton
            color="error"
            onClick={() => handleDelete(row.original.id)}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      )}
      {moreDetails && (
        <Box ref={ref}>
          <Tooltip arrow placement="right" title="more">
            <IconButton color="default" onClick={() => setOpen(true)}>
              <MoreVert />
            </IconButton>
          </Tooltip>
          {routeMenus.map(
            (routeMenu: any) =>
              routeMenu.some((menu: any) => menu.abilities.ability) &&
              routeMenu.abilities.map((ability: any) => (
                <Menu
                  anchorEl={ref.current}
                  open={open}
                  onClose={() => setOpen(false)}
                >
                  {ability.ability && (
                    <RouteMenu route={ability.route}>
                      {ability.menuItem}
                    </RouteMenu>
                  )}
                </Menu>
              ))
          )}
        </Box>
      )}
    </Box>
  );
}

export default RowActions