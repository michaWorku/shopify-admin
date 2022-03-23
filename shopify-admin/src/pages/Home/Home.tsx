import { FC } from 'react'
import { Chart, Featured, Navbar, Sidebar, Table, Widget } from '../../components'
import './home.scss'

const Home : FC = () => {
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
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
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