const countValue = document.querySelector('#counter');

const increment = () =>  {
    // Get the value from UI
    let value = parseInt(countValue.innerText);  // Value will be recieved in form of string
    // Update the value
    value = value + 1;
    // Set the value on to UI
    countValue.innerText = value;
};

const decrement = () =>  {
        // Get the value from UI
        let value = parseInt(countValue.innerText);  // Value will be recieved in form of string
        // Update the value
        value = value - 1;
        // Set the value on to UI
        countValue.innerText = value;
    };