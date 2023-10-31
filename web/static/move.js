// Functionality for Game Moves

// player turns
const players = ["Player 1", "Player 2"];
let currentPlayerIndex = 0;

// switch player turns
function switchTurn() {
    currentPlayerIndex = (currentPlayerIndex + 1) % 2;
    document.querySelector('h3').innerHTML = `Welcome! ${players[currentPlayerIndex]}, it's your turn.`;
}

// finds the range of affected pits from click dispersal
function range(start, moves) {
    let res = [];
    for (let i = 1; i <= parseInt(moves); i++) {
        res.push((parseInt(start) + i) % 14 || 14);
    }
    return res;
}

function welcomeMessage() {
    return "Welcome! Player 1, please click on a pit in your row to start the game.";
}

// watching page activity
document.addEventListener('DOMContentLoaded', function() {
    // welcome
    document.querySelector('h3').innerHTML = welcomeMessage();

    // tracking pit changes
    document.querySelectorAll('.pit').forEach(function(pit) {
        // Get the pit number from the data attribute
        let pitNumber = parseInt(pit.getAttribute('data-pit'));
        
        if (pitNumber !== 7 && pitNumber !== 14 && pit.textContent !== "0") {
            pit.addEventListener('click', function() {
                if ((currentPlayerIndex === 0 && pitNumber > 6) || (currentPlayerIndex === 1 && pitNumber < 7)) {
                    alert("Be patient. It's not your turn!");
                    return;
                }
                
                // Get list of all affected pits (from next pit to the last pit affected)
                let pitRange = range(pitNumber, pit.textContent);

                // Send an AJAX request to the server to capture the pit value
                fetch('/capture_pit', {
                    method: 'POST',
                    body: JSON.stringify({ pitNumber: pitNumber, pitValue: pit.textContent, pitRange: pitRange }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    // Handle the response from the server if needed
                    console.log('Pit value captured: ' + data.pitValue);
                    console.log('Pit values affected: ' + pitRange);
                    var pitResultElement = document.querySelector('.pit[data-pit="' + pitNumber + '"]');
                    pitResultElement.textContent = "0";
                    
                    for (const pit of pitRange) {
                        var pitAffectedElement = document.querySelector('.pit[data-pit="' + pit + '"]');
                        var temp = parseInt(pitAffectedElement.textContent);
                        pitAffectedElement.textContent = temp + 1;
                    }

                    // Capture mechanism starts here
                    if (data.capture) {
                        console.log("Capture occurred on pit: " + pitNumber);
       
                        var oppositePit = 14 - pitNumber;
                        var oppositePitElement = document.querySelector('.pit[data-pit="' + oppositePit + '"]');
       
                        // Capture stones from the opposite pit
                        var capturedStones = parseInt(oppositePitElement.textContent);
                        oppositePitElement.textContent = "0";
       
                        // Determine which Mancala store to add captured stones to. 
                        var mancalaStorePit = (pitNumber <= 6) ? "7" : "14";
                        var mancalaStoreElement = document.querySelector('.pit[data-pit="' + mancalaStorePit + '"]');
       
                        // Add captured stones to the Mancala store
                        mancalaStoreElement.textContent = parseInt(mancalaStoreElement.textContent) + capturedStones + 1; // +1 for the last stone that caused the capture
                    }

                    // Switch turns after a move
                    switchTurn();
                })
                .catch((error) => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
            });
        }
    });
});
