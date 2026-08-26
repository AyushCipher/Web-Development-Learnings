import logo from './logo.svg';
import './App.css';
import { NavLink, Routes, Route } from 'react-router-dom'; // Importing Router, Routes, and Route
import Home from './components/Home';
import Support from './components/Support';
import Lab from './components/Lab';
import ABout from './components/ABout';
import NotFound from './components/NotFound';
import { Link } from 'react-router-dom';
import { MainHeader } from './components/MainHeader';

function App() {

  return (
    <div className="App">

      <nav>
        <ul>
        <li>
          <NavLink to="/" >Home</NavLink>
        </li>
        <li>
          <NavLink to="/support" >Support</NavLink>
        </li>
        <li>
          <NavLink to="/about" >About</NavLink>
        </li>
        <li>
          <NavLink to="/lab" >Lab</NavLink>
        </li>
        </ul>
      </nav>

        {/* <Routes>
          <Route path="/" element={<div>{<Home/>}</div>} />
          <Route path="/support" element={<div>{<Support/>}</div>} />
          <Route path="/about" element={<div>{<ABout/>}</div>} />
          <Route path="/lab" element={<div>{<Lab/>}</div>} />

          Above paths ko chor k kuch b different tag dala to is page pe chle jyega 
          <Route path="*" element={<div>Not Found Page</div>} />

        </Routes> */}


          {/* Humne ye observe kiya ki home page ka path "/" so hm har dusre element jase support about etc,
          sbke age "/" lgane k bd us element ka final path set kr rhe ha to iska mtlb yha Home page parent element jasa behave kr
          skta ha kuki uska path "/" sbhi baki elements k path k age juda ha isliye humne home page ko parent man k chla ...
          Lekin isma ek gadbadi ha ki aisa krne se if I click on any other element rather than Home Page then text written in home page appears always
          rather than text of that particular element hence we need to use the outlet tag ..but then aisa b krnma se if I click on any element like EG:- lab 
          then lab k component ka text and home page ka text both appears*/}
        <Routes>


          <Route path="/" element={<div>{<MainHeader/>}</div>}>
            {/* This becomes our default Route */}
            <Route index element={<Home/>}/>
            <Route path="/support" element={<div>{<Support/>}</div>} />
            <Route path="/about" element={<div>{<ABout/>}</div>} />
            <Route path="/lab" element={<div>{<Lab/>}</div>} />

            {/* Above paths ko chor k kuch b different tag dala to is page pe chle jyega  */}
            <Route path="*" element={<div>Not Found Page</div>} />
          </Route>
        
        </Routes>
    </div>
  );
}

export default App;

