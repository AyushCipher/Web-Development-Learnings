
// document.addEventListener('click', function() {
//     console.log('I clicked on Document');
// });

// document.removeEventListener('click', function() {
//     console.log('I clicked on Document');
// });

// NOTE:- The method addEventListener will run while the other removeEventListener will not run since
//        they both can be applied on same object. Whilst the first method is executed so in this case
//        a method(addEventListener) is declared for the above object so another method (removeEventListener)
//        could not be executed so will not have any impact even after writing it down. So a function/Object needs to be declared first
//        then both methods can be applied successfully on same object.


// TO make removeEventListener method working target must be same, type must be same, and function must be same.



// function eventFunction(){
//     console.log('I clicked on Document');
// };

// document.addEventListener('click', eventFunction);

// document.removeEventListener('click', eventFunction);

// Both addEventListener and removeEventListener will be executed




// CONCEPT OF EVENT OBJECT:- 

// An event object is an instance of the Event interface (or a derived interface, such as MouseEvent, KeyboardEvent, etc.) that contains detailed information about a browser event.
// In JS, when an event is triggered, the browser creates an event object and passes it to the event handler function.


// const content = document.querySelector('#wrapper');
// content.addEventListener('click', function(event){
//     console.log(event);
// })



// Browser Event: The click on the button is the browser event.



// Event Object: When the button is clicked, the handleClick function is called with an event object as its argument.
// This object provides details about the click event, such as the type of event (event.type), the element that triggered the event (event.target), and the mouse position (event.clientX and event.clientY).



// let links =  document.querySelectorAll('a');
// let thirdLink = links[2];    --->  // Selects the third <a> element from the list (index 2 since indexing starts at 0)

// thirdLink.addEventListener('click', function(event) {
//     event.preventDefault();
//     console.log('maza aya, acha laga');
// });





// CONCEPT OF AVOIDING TOO MANY EVENTS:-

// Below is a code which creates 100 para with each para having eventListener 
// but this is not the optimized version since it uses many lines

// let myDiv = document.createElement('div');
// for(let i=1; i<=100; i++) {
//     let newElement = document.createElement('p');
//     newElement.textContent = 'This is para ' + i;

//     newElement.addEventListener('click', function(event) { 
//         console.log('I have clicked on para');
//     });
//     myDiv.appendChild(newElement);
// }   
// document.body.appendChild(myDiv);    ----> Without this line, the div and its child elements (the paragraphs) would exist only in memory and wouldn't be rendered on the webpage.




// Below is little smart approach, we have linked eventListener directly to div[Parent of para's]
// so we do not have to attach eventListener to each para but by doing so we have lost individuality of para,
// that means we the eventListener would be equally accessible for all para's inside div, no individual action to eventListener could be taken now.

// let myDiv = document.createElement('div');
// function paraStatus (event) {
//     console.log('I have clicked on para');
//     }
// myDiv.addEventListener('click', paraStatus);

// for(let i=1; i<=100; i++) {
//     let newElement = document.createElement('p');
//     newElement.textContent = 'This is para' + i;

//     myDiv.appendChild(newElement);
// }
// document.body.appendChild(myDiv);


// RESULT:- I have clicked on para
//          I have clicked on para




// # Usage of event.target:- event.target is a property of the event object that refers to the actual DOM element that triggered the event — 
// not necessarily the element the listener is attached to.
// The event object is automatically passed to the event handler when an event occurs (e.g., a click) 

//  <div id="container">
//     <button>Button 1</button>
//     <button>Button 2</button>
//   </div>

//   <script>
//     const container = document.getElementById('container');

//     // Add one event listener to the parent div
//     container.addEventListener('click', function(event) {
//       alert('You clicked: ' + event.target.textContent);
//     });
//   </script>


// RESULT (IF CLICKED ON BUTTON 2): You clicked: Button 2





// # PROBLEM:-

{/* <body>

  <p id="control">
    This is a paragraph with a <span>clickable span</span> inside.
  </p>

  <script>
    let element = document.querySelector('#control');

    element.addEventListener('click', function (event) {
      console.log('Clicked content: ' + event.target.textContent);
    });
  </script>

</body> */}



// RESULT:- Aise krne se hume span pr click krne se eventListener dwara set kiya gya printed statement dikha
// lekin para pe click krne se span aur para dono k content print ho kr console ma nzar aa rhe ha jb ki para pe click krne se hume sirf para ka hi content chahiye
// span ka content aur uska set kiya hua eventListener nhi.





// let element = document.querySelector('#control');
// element.addEventListener('click', function (event) {
//     if( event.target.nodeName == 'SPAN') {
//         console.log('span pr click kiya hai' + event.target.textContent);
//     }  
// });
// RESULT:- Aise krne se para ka khud ka content print hoga aur span ka khud ka.


// FIND OUT ABOUT EVENT BUBBLING AND EVENT CAPTURING/TRECKLING.

// FIND OUT ABOUT DEBOUNCING.



// EVENT BUBBLING:-

// WHAT IS IT:- 
// * Event bubbling is a type of event propagation where the event starts from the deepest target element and then bubbles up to its ancestors in the DOM tree.
// * When an event occurs on a DOM element, it starts at the target element and propagates upwards through its ancestors.
// * Default behavior in JavaScript.

// WHY USE IT:
// * Makes it easier to manage events on nested elements without attaching listeners to every child.
// * Allows event delegation, where a parent can handle events for all its children.

// USE CASES:
// * Clicking on items in a list: Instead of adding a click listener to every <li>, you attach one listener to the <ul> and handle events for any <li> that was clicked.



// Event Capturing (Trickling)
// What it is:

// Event starts from the outermost ancestor and propagates down to the target element.

// Not default; needs addEventListener(..., true) to enable.

// Why designed like this:

// Gives developers control over the order in which events are handled.

// Useful when parent elements want to intercept an event before child elements handle it.

// Use case:

// Form validation at parent level before child inputs process events.

// Example: A parent div intercepts a click to prevent certain child interactions.