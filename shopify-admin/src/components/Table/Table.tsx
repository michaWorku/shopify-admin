import { FC, useEffect, useState } from 'react'
import './table.scss'
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { privateRequest } from '../../requestMethod';

const rows = [
  {
    id: 1143155,
    product: "Acer Nitro 5",
    img: "https://m.media-amazon.com/images/I/81bc8mA3nKL._AC_UY327_FMwebp_QL65_.jpg",
    customer: "John Smith",
    date: "1 March",
    amount: 785,
    method: "Cash on Delivery",
    status: "Approved",
  },
  {
    id: 2235235,
    product: "Playstation 5",
    img: "https://m.media-amazon.com/images/I/31JaiPXYI8L._AC_UY327_FMwebp_QL65_.jpg",
    customer: "Michael Doe",
    date: "1 March",
    amount: 900,
    method: "Online Payment",
    status: "Pending",
  },
  {
    id: 2342353,
    product: "Redragon S101",
    img: "https://m.media-amazon.com/images/I/71kr3WAj1FL._AC_UY327_FMwebp_QL65_.jpg",
    customer: "John Smith",
    date: "1 March",
    amount: 35,
    method: "Cash on Delivery",
    status: "Pending",
  },
  {
    id: 2357741,
    product: "Razer Blade 15",
    img: "https://m.media-amazon.com/images/I/71wF7YDIQkL._AC_UY327_FMwebp_QL65_.jpg",
    customer: "Jane Smith",
    date: "1 March",
    amount: 920,
    method: "Online",
    status: "Approved",
  },
  {
    id: 2342355,
    product: "ASUS ROG Strix",
    img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg",
    customer: "Harold Carol",
    date: "1 March",
    amount: 2000,
    method: "Online",
    status: "Pending",
  },
];

const ListTable : FC = () => {
  const [orders, setOrders] = useState([] as any);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await privateRequest.get("orders");
        setOrders(res.data);
      } catch {}
    };
    getOrders();
  }, []);

  return (
    <TableContainer component={Paper} className="table">
    <Table sx={{ minWidth: 650 }} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell className="tableCell">Tracking ID</TableCell>
          <TableCell className="tableCell">Product</TableCell>
          <TableCell className="tableCell">Customer</TableCell>
          <TableCell className="tableCell">Date</TableCell>
          <TableCell className="tableCell">Amount</TableCell>
          <TableCell className="tableCell">Payment Method</TableCell>
          <TableCell className="tableCell">Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order : any) => (
          <TableRow key={order._id}>
            <TableCell className="tableCell">{order._id}</TableCell>
            <TableCell className="tableCell">
              <div className="cellWrapper">
                <img src={order.photo} alt="" className="image" />
                {order.product}
              </div>
            </TableCell>
            <TableCell className="tableCell">{order.customer}</TableCell>
            <TableCell className="tableCell">{order.date}</TableCell>
            <TableCell className="tableCell">{order.amount}</TableCell>
            <TableCell className="tableCell">{order.method}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${order.status}`}>{order.status}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  )
}

export default ListTable