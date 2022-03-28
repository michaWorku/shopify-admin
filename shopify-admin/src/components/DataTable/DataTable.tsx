import { FC, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./dataTable.scss";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import { userColumns, userRows } from "../../data/dataTableSource";
import { privateRequest } from "../../requestMethod";
import {useAppDispatch, useAppSelector} from '../../app/hooks'
import { getProducts } from "../../features/product/productSlice";
import { getUsers } from "../../features/user/userSlice";
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
  const [data, setData] = useState([]);
  const [listType, setlistType] = useState("");
  const dispatch = useAppDispatch();

  const users = useAppSelector((state) => state.auth.user.users.data);
  const products = useAppSelector((state) => state.auth.product.products.data);

  const { pathname } = useLocation();

  useEffect(() => {
    setlistType(pathname);
  }, [pathname]);

  useEffect(() => {

    if(listType === '/users'){
      dispatch(getUsers())
      setData(users.doc)
    }
    if(listType === '/products'){
      dispatch(getProducts())
      setData(products.doc)
    }
      
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
            <Link to={`/users/${params.row._id}`} style={{ textDecoration: "none" }}>
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
