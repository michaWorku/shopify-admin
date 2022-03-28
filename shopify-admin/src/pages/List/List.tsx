import { FC, useEffect, useLayoutEffect, useState } from 'react'
import { useLocation } from "react-router-dom";

import { DataTable, Navbar, Sidebar } from '../../components'
import './list.scss'

const List : FC = () => {
  


  return (
    <div className='list'>
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DataTable />
      </div>
    </div>
  )
}

export default List