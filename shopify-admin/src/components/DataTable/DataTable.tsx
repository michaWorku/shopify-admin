import { FC, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./dataTable.scss";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import { userColumns, userRows } from "../../data/dataTableSource";
import { privateRequest } from "../../requestMethod";

interface dataRow {
  id: number;
  username: string;
  img: string;
  status: string;
  email: string;
  age: number;
}

interface dataState {
  data: dataRow[];
}



const DataTable: FC = () => {
  const [data, setData] = useState(userRows);
  const [listType, setlistType] = useState("");

  const { pathname } = useLocation();

  useEffect(() => {
    setlistType(pathname);
  }, [pathname]);

  //const dispatch = useAppDispatch()

  useEffect(() => {
      const getData = async () =>{
        try {
          const res= await privateRequest.get(listType)

          console.log({res : res.data})

          setData(res.data)
        } catch (err) {
          console.log(err)
        }
      }
    
      getData()
  }, [listType])
  
  const handleDelete = (id: number) => {
    setData(data?.filter((item: dataRow) => item?.id !== id));
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <div className="cellAction">
            <Link to="/users/test" style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="dataTable">
      <div className="dataTableTitle">
        Add New { listType === '/users'? 'User' : 'Product'}
        <Link to={listType +"/new"} className="link">
          Add New
        </Link>
      </div>

      <DataGrid
        className="dataGrid"
        rows={data}
        columns={userColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
    </div>
  );
};

export default DataTable;
