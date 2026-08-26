import './App.css';
import Item from './components/Item';
import ItemDate from './components/ItemDate';
import card from './components/card';

function App() {
  const itemTwoName = "SurfExcel";
  return ( 
    <div>
      <Item name="Nirma"></Item>
      <ItemDate day="28" month="September" year="2004"></ItemDate>

      {/* Generally we prefer this way */}
      <Item name={itemTwoName}></Item>
      <ItemDate day="12" month="April" year="2008"></ItemDate>

      <Item name="555"></Item>
      <ItemDate day="23" month="August" year="2010"></ItemDate>

      <div className="App">
        Hello Jee
      </div>
    </div>
  );
}

export default App;
