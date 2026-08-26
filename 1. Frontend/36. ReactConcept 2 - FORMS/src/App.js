import './App.css';
import { useState } from 'react';

function App() {

  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");

  // console.log(firstName);
  // console.log(lastName);

  // function changeFirstNameHandler(event) {
  //   // console.log("Printing First Name");
  //   // console.log(event.target.value);
  //   setFirstName(event.target.value);
  // }
  // function changeLastNameHandler(event) {
  //   // console.log("Printing Last Name");
  //   // console.log(event.target.value);
  //   setLastName(event.target.value);
  // }


  const [formData, setFormData] = useState( {firstName: "", lastName: "", email: "", comments: "", isVisible:true, mode:"", favCar:""});

  // console.log(formData);



  // FIRST METHOD OF WRITING CHANGEHANDLER FUNCTION:-

  // function changeHandler(event) {
  //   setFormData(prevFormData => {
  //     return{
  //       ...prevFormData,
  //       [event.target.name]: event.target.value  // firstName = a(suppose);
  //     }
  //   });
  // }


  // SECOND METHOD OF WRITING CHANGEHANDLER FUNCTION

  function changeHandler(event) {
    const {name, value, checked, type} = event.target;
    setFormData(prevFormData => {
      return{
        ...prevFormData,
        [name]: type=== "checkbox" ? checked : value  // firstName = a(suppose);
      }
    });
  }

  function submitHandler(event) {
    event.preventDefault();

    console.log("Finally printing the entire form's data...");
    console.log(formData);
  }


  // CONTROLLED COMPONENTS:- [MAINTAIN STATE INSIDE COMPONENTS] (by value)
  // Refer the screenshot

  return (
    <div className="App">
        <form onSubmit={submitHandler}>
        <br/>

          <input type="text" placeholder="First Name" onChange={changeHandler} name="firstName" value={formData.firstName}/>
          

          <br/>
          <br/>

          <input type="text" placeholder="Last Name" onChange={changeHandler} name="lastName" value={formData.lastName}/>
          

          <br/>
          <br/>

          <input type="email" placeholder='Enter your email' onChange={changeHandler} name="email" value={formData.email}/>

          <br/>
          <br/>

          <textarea placeholder = 'Enter your comments' onChange={changeHandler} name="comments" value={formData.comments}/>
          

          <br/>
          <br/>
          
          <input type="checkbox" onChange={changeHandler} name="isVisble" id="isVisble" checked={formData.isVisible}/>
          <label htmlFor='isVisible'>Am I Visible</label>

          <br/>
          <br/>


        {/* Whenever we have multiple radio buttons then we put them inside fieldset attribute to group them and apply caption in them using legend tag */}

          <fieldset>
            <legend>Mode:</legend>
            {/* Agr tum chahte ho ki ek hi radio button ticked rhe toh name same rkhna else agr dono radio button ko ticked rkhna ha to name different rkho */}

          <input type="radio" onChange={changeHandler} name="mode" value="Online-Mode" id="Online-Mode" checked={formData.mode==="Online-Mode"}/>
          <label htmlFor='Online-Mode'>Online Mode</label>

          <br/>
          <br/>

          <input type="radio" onChange={changeHandler} name="mode" value="Offline-Mode" id="Offline-Mode" checked={formData.mode==="Offline-Mode"}/>
          <label htmlFor='Offline-Mode'>Offline Mode</label>
          </fieldset>
          
          <br/>
          <br/>

          <label htmlFor='favCar'>Tell me your Favourite Car   </label>

          <select onChange={changeHandler} name="favCar" value={formData.favCar}>
          <option value="scorpio">Scorpio</option>
          <option value="fortuner">Fortuner</option>
          <option value="thar">Thar</option>
          <option value="Defender">Defender</option>
          <option value="lambo">Lamborgini</option>
            
          </select>

          {/* <input type="submit" value="   submit"/>  */}
          <br/><br/>
          <button>Submit</button>

        </form>
    </div>
  );
}

export default App;




// The key difference between creating a form in HTML and React primarily revolves around how they handle form data and submission:

// 1. HTML Form:

// In a traditional HTML form:

// i} Form Structure: The form is written using basic HTML elements like <form>, <input>, <textarea>, etc.
// ii} Form Submission: When the user fills out the form and clicks the submit button, the form data is gathered all at once and sent to the server via an HTTP request (GET or POST).
// iii} How Data is Handled: The form data is accumulated only when the submit button is clicked. At that point, all input values are collected and sent together in one request, either refreshing the page or redirecting to another page after submission.
// iv} Form Control: The browser typically handles form control. JavaScript can be used to manipulate the form, but it is external to the form's structure.


// 2. In React:

// i}  Form Structure: React forms are made using JSX (a syntax extension of JavaScript) and are typically controlled by React’s state management system (using useState, useReducer, etc.).
// ii} Real-time Updates: In React, the form inputs are controlled components. This means that the input fields are linked directly to the component’s state. As the user types in the form, the input values are immediately updated in the state.
// iii} For example, every keypress or change in an input field updates the state in real time.
// iv} Form Submission: When the user clicks the submit button, React does not accumulate the form data all at once like HTML. Instead, the data is already in the component's state, so on clicking the submit button, React can immediately send the data (which has been tracked and updated in real-time) to the API.
// v} Form Control: You, as a developer, have complete control over the form’s state, validation, and submission process.
