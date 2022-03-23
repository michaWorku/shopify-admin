import { FC } from 'react'
import { Chart, Navbar, Sidebar, Table } from '../../components'
import './single.scss'

const Single : FC = () => {
  return (
    <div className='single'>
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <div className="top">
          <div className="left">
            <div className="editButton">Edit</div>
            <h1 className="title">Information</h1>
            <div className="item">
              <img 
                src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
                alt="" 
                className="itemImg" 
              />
               <div className="details">
                <h1 className="itemTitle">Mikias Worku</h1>
                <div className="detailItem">
                  <span className="itemKey">Email</span>
                  <span className="itemValue">micha@gmail.com</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Phone</span>
                  <span className="itemValue">+251945566509</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Address :</span>
                  <span className="itemValue">
                    4 Killo King George VI Street
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Country:</span>
                  <span className="itemValue">Ethiopia</span>
                </div>
            </div>
            </div>
          </div>
          <div className="right">
          <Chart aspect={3 / 1} title="User Spending ( Last 6 Months)" />
          </div>
        </div>
        <div className="bottom">
          <h1 className="title"> Last Transactions </h1>
          <Table />
        </div>
      </div>
    </div>
  )
}

export default Single