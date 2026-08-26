import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar';

const RootLayout = () => {
  return (
    <div>
        <Navbar/>
        <div className="container">
            <Outlet/>
            {/* <Outlet /> is a placeholder used in a layout route to render child (nested) routes. */}
        </div>

    </div>
  )
}

export default RootLayout