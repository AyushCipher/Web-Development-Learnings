import React from 'react'
import { useNavigate, useRouteError } from 'react-router-dom';

const Error = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    return (
        <div>
            <h3>An Error Occured</h3> <br/>
            <p>{error.message}</p>  <br/>
            <button className="btn button1" onClick={() => navigate("/")}>Go To Homepage</button>
        </div>
    )
}

export default Error