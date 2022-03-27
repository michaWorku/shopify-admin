import { FC, useEffect, useMemo, useState } from 'react'
import { Chart, Featured, Navbar, Sidebar, Table, Widget } from '../../components'
import { privateRequest } from '../../requestMethod';
import './home.scss'

const Home : FC = () => {
  const [userStats, setUserStats] = useState([] as any);

  const MONTHS = useMemo(
    () => [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    []
  );

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await privateRequest.get("/users/stats");
        res.data.map((item :any) =>
          setUserStats((prev : any) => [
            ...prev,
            { name: MONTHS[item._id - 1], "Active User": item.total },
          ])
        );
      } catch {}
    };
    getStats();
  }, [MONTHS]);

  return (
    <div className='home'>
      <Sidebar/>
      <div className="homeContainer">
        <Navbar />
        <div className="widgets">
          <Widget widgetType='user'/>
          <Widget widgetType='order'/>
          <Widget widgetType='earning'/>
          <Widget widgetType='balance'/>
        </div>
        <div className="charts">
          <Featured/>
          <Chart data={userStats} title="User Analytics" dataKey="Active User" aspect={2 / 1} />
        </div>
        <div className="listContainer">
          <div className="listTitle">Latest Transactions</div>
          <Table/>
        </div>
      </div>
    </div>
  )
}

export default Home