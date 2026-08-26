import React from 'react'
import { useNavigate } from 'react-router-dom';


const ABout = () => {
    const navigate = useNavigate();

    function clickHandler() {
        navigate("/support");
    }

  return (
    <div>
        <div>
            This is About Page
        </div>
        <button onClick={clickHandler}>Move to Support Page</button>
    </div> 
  )
}
export default ABout
