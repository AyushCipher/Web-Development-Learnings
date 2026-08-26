const boxes =document.querySelectorAll(".box");
const gameInfo = document.querySelector(".game-info");
const newGameBtn = document.querySelector(".btn");


// Define variables
let currentPlayer ;
let gameGrid;

const winingPositions = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

// Function to initialize the game
function initGame(){
    currentPlayer = 'X';
    gameGrid = ["", "", "", "", "", "", "", "", ""]

    // Reset the UI or Update UI that each boxes is empty and all are clickables 
    boxes.forEach((box, index) => {
        // Each box is empty
        box.innerText = "";
        boxes[index].style.pointerEvents = "all";
        //one more thing is missing, initialise box with css properties again
        box.classList = `box box${index+1}`;
    });
    
    // UI render
    newGameBtn.classList.remove("active");
    gameInfo.innerText = `Current Player- ${currentPlayer}`;
}
initGame();

// Swap the turn
function swapTurn() {
    if(currentPlayer === "X"){
        currentPlayer = "O";
    }else{
        currentPlayer ="X";
    }
    // UI update
    gameInfo.innerText = `Current Player- ${currentPlayer}` ;
}

// This function checks the game is over or not
function checkGameOver() {
    let answer = "";
    winingPositions.forEach((positions) => {
        // All 3 boxes should be non-empty and exactly same in value
        if((gameGrid[positions[0]] !== "" || gameGrid[positions[1]] !== "" || gameGrid[positions[2]]) !== "" &&
        (gameGrid[positions[0]] === gameGrid[positions[1]] ) && (gameGrid[positions[1]] === gameGrid[positions[2]] ) ){
            // check if winner is X
            if(gameGrid[positions[0]] === "X"){
                answer = "X";
            }else{
                answer = "O";
            }

            // Disable pointer events: Disabeling the pointers is necessary else we could aslo get two winner at a time
            boxes.forEach((box) =>{
                box.style.pointerEvents = "none";
            });
           
            //Now we know X/O is a winner So we highlight the boxes by passing win class into it which gives them green color
            boxes[positions[0]].classList.add("win");
            boxes[positions[1]].classList.add("win");
            boxes[positions[2]].classList.add("win");

        }
    });

    // It means we have a winner
    if(answer !== ""){
        gameInfo.innerText = `Winner Player - ${answer}`;
        newGameBtn.classList.add("active");
        return;
    }
    //We know that no Winner is found, let's check whether there is tie
    let fillCount = 0;
    gameGrid.forEach((box) =>{
        if(box !==""){
            fillCount++;
        }
    });

    //Board is Filled, game is TIE
    if(fillCount === 9){
        gameInfo.innerText = "Game Tied !";
        newGameBtn.classList.add("active");
    }
}


function handleClick(index){
    if(gameGrid[index] === ""){
        // UI updation
        boxes[index].innerText = currentPlayer;
        // Grid updation
        gameGrid[index] = currentPlayer;
        boxes[index].style.pointerEvents = "none";
         //Swap karo turn/chance ko
        swapTurn();
         // Checking if someone has won
        checkGameOver();
    }
}

boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        handleClick(index);
    })
});

newGameBtn.addEventListener("click", initGame);