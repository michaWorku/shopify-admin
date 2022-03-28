import { FC, useEffect, useState } from 'react'
import './widget.scss'
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import { privateRequest } from '../../requestMethod';

interface widgetProps {
  widgetType: string
}

const Widget : FC<widgetProps> = ({widgetType}) => {
  const [income, setIncome] = useState([] as any);
  const [perc, setPerc] = useState(0);

  useEffect(() => {
    const getIncome = async () => {
      try {
        const res = await privateRequest.get("orders/income");
        setIncome(res.data);
        setPerc((res.data[1].total * 100) / res.data[0].total - 100);
      } catch {}
    };
    getIncome();
  }, []);

  let data;

  //temporary
  // const amount = 100;
  // const diff = 20;

  switch (widgetType) {
    case "user":
      data = {
        title: "USERS",
        isMoney: false,
        link: "See all users",
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
            }}
          />
        ),
      };
      break;
    case "order":
      data = {
        title: "ORDERS",
        isMoney: false,
        link: "View all orders",
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
            }}
          />
        ),
      };
      break;
    case "earning":
      data = {
        title: "EARNINGS",
        isMoney: true,
        link: "View net earnings",
        icon: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    case "balance":
      data = {
        title: "BALANCE",
        isMoney: true,
        link: "See details",
        icon: (
          <AccountBalanceWalletOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(128, 0, 128, 0.2)",
              color: "purple",
            }}
          />
        ),
      };
      break;
    default:
      break;
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data?.title}</span>
        <div className="counter">
          {data?.isMoney && "$"} {income[1]?.total}
        </div>
        <div className="link">{data?.link}</div>
      </div>
      <div className="right">
        {perc < 0 ? (
          <div className="percentage negative">
            <KeyboardArrowDownIcon /> {Math.floor(perc)} %
          </div>
        ) : (
          <div className="percentage positive">
            <KeyboardArrowUpIcon /> {Math.floor(perc)} %
          </div>
        )}
        {data?.icon}
      </div>
    </div>
  );
}

export default Widget