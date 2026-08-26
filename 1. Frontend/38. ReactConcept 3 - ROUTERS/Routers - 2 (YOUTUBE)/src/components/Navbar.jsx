import React from 'react'
import bird from "../assets/bird-thumbnail.jpg"
import { NavLink,useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="Navbar">
        <img src={bird} alt="" width="80px" height="80px"/>
        <ul>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/products">Products</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
          <li><NavLink to="/jobs">Jobs</NavLink></li>
</ul>

        <button className="btn button1" onClick = {() => navigate("./about")}>Get Started</button>
    </div>
  )
}

export default Navbar

// | Feature        | `Link`                              | `NavLink`                                                  |
// | -------------- | ----------------------------------- | ---------------------------------------------------------- |
// | Basic use      | Navigates to a different route      | Also navigates, but can apply active styles or classes |
// | Active styling | ❌ Not aware of the current route    | ✅ Automatically applies styling to the active link         |
// | Props          | `to`                                | `to`, **plus** `className`, `style` with active info       |
// | Use Case       | For simple links (no styling logic) | For menus/navbars where active tab needs to be highlighted |
