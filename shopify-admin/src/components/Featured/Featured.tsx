import { FC, useEffect, useState } from 'react'
import './featured.scss'
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { privateRequest } from '../../requestMethod';

const Featured : FC = () => {
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

  return (
    <div className='featured'>
      <div className="top">
        <h1 className="title">Total Revenue</h1>
        <MoreVertIcon fontSize='small'/>
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar value={70} text={'70%'} strokeWidth={5}/>
        </div>
        <p className="title">Total made today</p>
        <p className="amount">${income[1]?.total}</p>
        <p className="desc">
          Previous transactions processing. Last payments may not be included.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Target</div>
            <div className="itemResult negative">
              <KeyboardArrowDownIcon fontSize='small'/>
              <div className="resultAmount">$12.4k</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Week</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize='small'/>
              <div className="resultAmount">$12.4k</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Month</div>
            <div className="itemResult negative">
              <KeyboardArrowUpOutlinedIcon fontSize='small'/>
              <div className="resultAmount">$12.4k</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Featured