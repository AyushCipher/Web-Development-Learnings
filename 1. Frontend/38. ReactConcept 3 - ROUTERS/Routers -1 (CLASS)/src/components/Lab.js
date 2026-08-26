import React from 'react'
import { useNavigate } from 'react-router-dom';

const Lab = () => {

    const navigate = useNavigate();

    function clickHandler() {
        navigate("/about");
    }

  return (
    <div>
        <div>
            This is Lab Page
        </div>
        <button onClick={clickHandler}>Move to About Page</button>
    </div> 
  )
}
export default Lab

