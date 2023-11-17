// Game over page that displays final scores and the winner

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/GameOver.css';

const GameOver = () => {
    // grab the scores and player names
    let location = useLocation();
    const playerOneScore = location.state.player1Score;
    const playerTwoScore = location.state.player2Score;
    const [showGameResults, setGameResults] = useState(0);
    const navigate = useNavigate();

    // Determine the winner on page load
    useEffect(() => {
        if (playerOneScore > playerTwoScore) {
            setGameResults(1);
        } else if (playerOneScore < playerTwoScore) {
            setGameResults(2);
        }
      });

    // give user option to return to Home
    const returnToHomePage = () => {
        navigate("/");
    }

    // displays winner and loser or tie
    const displayGameResults = (move) => {
        if (move === 1) {
            return {player1: '🎊 WINNER 🎊', player2: '💔 LOSER 💔'};
        } else if (move === 2) {
            return {player1: '💔 LOSER 💔', player2: '🎊 WINNER 🎊'};
        } else {
            return {player1: '👔 TIE 👔', player2: '👔 TIE 👔'};
        }
    }

    if (playerOne > playerTwo) {
        console.log("Player 1 wins");
        winner = "numWins1";
        loser = 'numWins2';
        tie = false;
    } else if (playerTwo > playerOne) {
        console.log("Player 2 wins");
        winner = 'numWins2';
        loser = 'numWins1';
        tie = false;
    } else {
        console.log("It's a tie");
        tie = true; // Handle a tie situation appropriately
    }

    
    return (
        <div>
            <h1>GAME OVER</h1>
            <h2>Thanks for playing!</h2>
            <div className='score-box'>
                    <h3> Final Score: { playerOneScore } - { playerTwoScore }</h3>
                    <div className='display-score'>
                        <h4> { displayGameResults(showGameResults).player1 } </h4>
                        <p>PLAYER ONE</p>
                    </div>
                    <div className='display-score'>
                        <h4> { displayGameResults(showGameResults).player2 } </h4>
                        <p>PLAYER TWO</p>
                    </div>
            </div>
            <span>
                <button onClick={returnToHomePage}>Go Home</button>
            </span>
        </div>
    );
}

export default GameOver;