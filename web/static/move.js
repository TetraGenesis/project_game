document.addEventListener('DOMContentLoaded', function() {
    const playerTurnElement = document.querySelector('h3');
    
    // initializing game settings
    let currentPlayer = 1; 
    let boardState = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]; // the initial distribution of stones

    // function to update the board's visual state
    const updateBoard = (newBoardState) => {
        newBoardState.forEach((stones, index) => {
            // for each pit, find the corresponding element and update its text content
            const pitElement = document.querySelector(`.pit[data-pit="${index + 1}"]`);
            pitElement.textContent = stones.toString();
        });
    };

    // function to check if the pit clicked is valid for the current player
    const checkTurn = (pitIndex) => {
        // player 1 can only select pits 1-6, and player 2 can only select pits 8-13
        return (currentPlayer === 1 && pitIndex < 6) || (currentPlayer === 2 && pitIndex >= 7 && pitIndex < 13);
    };

    // // function to handle making a move
    // const makeMove = (pitIndex) => {
    //     fetch('/move', {
    //         method: 'POST',
    //         body: JSON.stringify({
    //             board_state: boardState, // current state of the board
    //             pit_index: pitIndex,     // the selected pit index
    //             current_player: currentPlayer // the current player number
    //         }),
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         // update the board with the new state
    //         boardState = data.board_state;
    //         updateBoard(boardState);

    //         // check if the game is over (i do not think this works)
    //         if (data.game_over) {
    //             playerTurnElement.textContent = `Game over! Player ${currentPlayer} wins!`;
    //             // disable all pits to prevent further moves
    //             document.querySelectorAll('.pit').forEach(pit => pit.removeEventListener('click', pitClickHandler));
    //         } else {
    //             // announce captured stones if any *unnecessary
    //             if (data.captured_stones > 0) {
    //                 // determine the opposite player
    //                 const oppositePlayer = currentPlayer === 1 ? 2 : 1;
    //                 alert(`Player ${currentPlayer} captured ${data.captured_stones} stones from Player ${oppositePlayer}!`);
    //             }

    //             // change the turn if the current player doesn't get another turn
    //             if (!data.another_turn) {
    //                 currentPlayer = currentPlayer === 1 ? 2 : 1;
    //             }
    //             // update the turn message
    //             playerTurnElement.textContent = `Player ${currentPlayer}'s turn.`;
    //             // if the current player gets another turn, append the message
    //             if (data.another_turn) {
    //                 playerTurnElement.textContent += ` You get another turn!`;
    //             }
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
    // };

    const makeMove = (pitIndex) => {
        fetch('/move', {
            method: 'POST',
            body: JSON.stringify({
                board_state: boardState,
                pit_index: pitIndex,
                current_player: currentPlayer
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            boardState = data.board_state;
            updateBoard(boardState);
    
            if (data.game_over) {
                playerTurnElement.textContent = `Game over! Player ${currentPlayer} wins!`;
                document.querySelectorAll('.pit').forEach(pit => pit.removeEventListener('click', pitClickHandler));
                checkAndHandleGameEnd();
            } else {
                if (data.captured_stones > 0) {
                    const oppositePlayer = currentPlayer === 1 ? 2 : 1;
                    alert(`Player ${currentPlayer} captured ${data.captured_stones} stones from Player ${oppositePlayer}!`);
                }
    
                if (!data.another_turn) {
                    currentPlayer = currentPlayer === 1 ? 2 : 1;
                }
                playerTurnElement.textContent = `Player ${currentPlayer}'s turn.`;
                if (data.another_turn) {
                    playerTurnElement.textContent += ` You get another turn!`;
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
    
    const checkAndHandleGameEnd = () => {
        const winCheckPits = {};
        for (const pit of document.querySelectorAll('.pit')) {
            var pitId = pit.getAttribute('data-pit');
            winCheckPits[pitId] = pit.textContent;
        }
        var gameEnd = gameWin(winCheckPits);
        if (gameEnd == true) {
            console.log('The game is over :)');
            var player1 = winCheckPits[7];
            var player2 = winCheckPits[14];
            var dbString = player1 + " : " + player2;
            var res = "Player 1 score: " + player1 + " Player 2 score: " + player2;
            var winner, loser;
            if (player1 > player2) {
                console.log("Player 1 win");
                winner = "numWins1";
                loser = 'numWins2';
            } else if (player2 > player1) {
                console.log("Player 2 win");
                winner = 'numWins2';
                loser = 'numWins1';
            } else {
                console.log("It's a tie");
                return; // Handle a tie situation appropriately
            }
    
            var incrementQuery = {query: `SELECT MAX(${winner}) AS maxWins, MAX(${loser}) AS maxLoserWins FROM scores`};
            console.log(res);
            fetch('/dbconnect', {
                method: 'POST',
                body: JSON.stringify({
                    incrementQuery: incrementQuery
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(findResult => {
                console.log('Response from server:', findResult);
                if (findResult && findResult.result !== undefined) {
                    incWins = parseInt(findResult.result[0][0]) + 1;
                    sameVal = parseInt(findResult.result[0][1]);
                }
                var insertQuery = {query: `INSERT INTO scores (score, ${winner}, ${loser}) VALUES (%s, %s, %s)`, values: [dbString, incWins, sameVal]};
                fetch('/dbconnect', {
                    method: 'POST',
                    body: JSON.stringify({
                        insertQuery: insertQuery
                    }), 
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(insertResult => {
                    console.log(insertQuery);
                    console.log('Response from server:', insertResult);
                    
                })
                .catch(error => {
                    console.error('Error:', error);
                })
            })
            .catch(error => {
                console.error('Error:', error);
            })
        }
    };    

    // function to handle a click event on a pit
    const pitClickHandler = (event) => {
        const pitElement = event.target;
        // get the index of the pit clicked, adjusting for zero-indexed array
        const pitIndex = parseInt(pitElement.getAttribute('data-pit')) - 1;

        // check if it's the correct player's turn and the correct pit was selected
        if (!checkTurn(pitIndex)) {
            alert("It's not your turn... or you selected the wrong pit!");
            return;
        }

        // if valid, make the move
        makeMove(pitIndex);
    };

    // attach the click event handler to each pit on the board
    document.querySelectorAll('.pit').forEach(pit => {
        pit.addEventListener('click', pitClickHandler);
    });

    playerTurnElement.textContent = `Player ${currentPlayer}'s turn!`;
});
