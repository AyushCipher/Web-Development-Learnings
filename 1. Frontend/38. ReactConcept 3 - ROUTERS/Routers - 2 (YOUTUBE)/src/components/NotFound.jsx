import React from 'react'
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
  return (
    <div>
        <h2>Error 404 | Page Not Found</h2>
        <br/>
        <button className="btn button1" onClick={() => navigate("/")}> Go To Home page</button>
    </div>
  )
}

export default NotFound