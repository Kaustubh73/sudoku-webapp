import React, { useState, useEffect, useRef } from 'react';
import '../css/Gameboard.css'

const GameBoard = () => {
  const inputRefs = useRef(
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => React.createRef()))
  );
  const [initialBoard, setInitialBoard] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 4, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  const [board, setBoard] = useState(initialBoard);
  const [activeTile, setActiveTile] = useState({row:0, col:0});
  const [cellHistory, setCellHistory] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [invalidCells, setInvalidCells] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(0); 
  const [isGameCompleted, setGameCompleted] = useState(false);
  const [wrongCounter, setWrongCounter] = useState(0);
  const [hints, setHints] = useState(3);
  const [completeBoard, setCompleteBoard] = useState(initialBoard);
  const [timer, setTimer] = useState(0);
  const [lastTimer, setLastTimer] = useState(0);

  useEffect(() => {
    (
      async () => {
        try {
        const response = await fetch('http://localhost:8000/api/generate-sudoku/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
              difficulty
            })
        });
        const content = await response.json();
        try {
            setCompleteBoard(content.completed);
            setInitialBoard(content.puzzle);
            setBoard(content.puzzle);
        } catch {
            console.error('Error fetching board');
        }
      } catch (error) {
            console.error(error);
      }
    }
    )(); 
  }, [difficulty]);
  
  const validateMove = async (row, col, value, board) => {
    try {
      const response = await fetch('http://localhost:8000/api/validate-move', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            board,
            row,
            col,
            value
        })
      });
      const content = await response.json();
      return content.valid;
      // console.log(invalidCells);
      // setInvalidCells(invalid);
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }
  const handleCellChange = async (row, col, value) => {
    if (initialBoard[row][col] !== 0 || wrongCounter >= 5)
    {
      return;
    }
    let updatedValue = value;
    if (value >= 10) {
      updatedValue = value % 10;
    }
    const updatedBoard = board.map((rowArray, rowIndex) =>
    rowArray.map((cell, colIndex) => {
      if (rowIndex === row && colIndex === col) {
        return updatedValue;
      }
      return cell;
    })
    );
    setBoard(updatedBoard);
    setCellHistory([...cellHistory, {row, col ,value: updatedValue}]);
    const isValidMove = await validateMove(row, col, updatedValue, updatedBoard);
    if (!isValidMove)
    {
      setInvalidCells((prevInvalidCells) => [...prevInvalidCells, { row, col }]); 
      setWrongCounter((prevCounter) => prevCounter + 1);
  } 
    
    // const isBoardCompleted = updatedBoard.every((row) => row.every((cell) => cell !== 0));
    // setIsCompleted(isBoardCompleted);
    if (updatedValue === 0 || !updatedValue || (updatedValue !== value && isValidMove))
    {
      const updatedInvalidCells = invalidCells.filter(
        (cell) => cell.row !== row || cell.col !== col
      );
      if (!updatedValue) setIsCompleted(false);
      // setIsCompleted(true);
      setInvalidCells(updatedInvalidCells);
    }
    else {
      const isBoardCompleted = updatedBoard.every((row) => row.every((cell) => cell !== 0));
      setIsCompleted(isBoardCompleted);  
    }  
  };

  const handleNumberButtonClick = (number) => {
    if (activeTile.row !== null && activeTile.col !== null) {
      const updatedInvalidCells = invalidCells.filter(
        (cell) => cell.row !== activeTile.row || cell.col !== activeTile.col
      );
      setInvalidCells(updatedInvalidCells);
      handleCellChange(activeTile.row, activeTile.col, number);
    }
  }
  const handleTileClick = (row, col) => {
    setActiveTile({row,col});
    setStarted(true);
    const highlightedCells = [];
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
  
    // Highlight cells in the same 3x3 block
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        highlightedCells.push({ row: r, col: c });
      }
    }
    setHighlightedCells(highlightedCells);
  };

  const handleUndo = () => {
    // Make sure there are previous board states to undo
    if (cellHistory.length > 0) {
      // Remove the last board state from the history
      const lastChangeIndex = cellHistory.length - 1;
      const lastChange = cellHistory[lastChangeIndex];
      const {row, col} = lastChange || {};
  
      const newHistory = cellHistory.slice(0, lastChangeIndex);
      setCellHistory(newHistory);
  
      const newBoard = board.map((rowArray, rowIndex) =>
        rowArray.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return 0;
          }
          return cell;
        })
      );
      setBoard(newBoard);
      const updatedInvalidCells = invalidCells.filter(
        (cell) => cell.row !== row || cell.col !== col
      );
      setInvalidCells(updatedInvalidCells);
    }
  };

  const handleHint = () => {
    if (hints > 0)
    {
      let randRow = Math.floor(Math.random() * 9);
      let randCol = Math.floor(Math.random() * 9);
      while (board[randRow][randCol] !== 0)
      {
        randRow = Math.floor(Math.random() * 9);
        randCol = Math.floor(Math.random() * 9);      
      }
      console.log(randRow, " ", randCol);
      let randVal = completeBoard[randRow][randCol];
      console.log(randVal);
      handleCellChange(randRow, randCol, randVal);
      setHints((prevHints) => prevHints - 1);
      setStarted(true);
    }
  }
  
  const handleKeyDown = (e, row, col) => {
    let newRow = row;
    let newCol = col;
    if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40)
    {
      e.preventDefault();
    }
    if (e.keyCode === 37) {
      // Left arrow key
      newCol = col > 0 ? col - 1 : col;
    } else if (e.keyCode === 38) {
      // Up arrow key
      newRow = row > 0 ? row - 1 : row;
    } else if (e.keyCode === 39) {
      // Right arrow key
      newCol = col < 8 ? col + 1 : col;
    } else if (e.keyCode === 40) {
      // Down arrow key
      newRow = row < 8 ? row + 1 : row;
    }
  
    // Set the active tile to the new row and column
    setActiveTile({ row: newRow, col: newCol });
    inputRefs.current[newRow][newCol].focus();
  
  };
  
  
  const handleDifficultyChange = (diff) => {
    setDifficulty(diff);
    setGameCompleted(false);
    setIsCompleted(false);
    setInvalidCells([]);
    setWrongCounter(0);
    setTimer(0);
    setHints(3);
    setStarted(false);
  }

  useEffect(() => {
    let interval = null;

    if (!isGameCompleted && started)
    {
      interval = setInterval(()=> {
        setTimer((prevTimer) => prevTimer + 1);
      },1000); 
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isGameCompleted, started]);

  useEffect(() => {
    if (isCompleted && invalidCells.length === 0) {
      setGameCompleted(true);
      setLastTimer(timer);
      setTimer(0);
    } else {
      setIsCompleted(false);
    }
  }, [isCompleted, invalidCells]);

  useEffect(() => {
    if (wrongCounter >= 5)
    {
      setLastTimer(timer);
      setTimer(0);
      setStarted(false);
    }
  }, [wrongCounter]);

  return (
    <div>
      <div className='menu'>
        <div className='difficulty-select'>
          <h3>Difficulty</h3>
          <button
            className={difficulty === 0 ? 'active' : ''}
            onClick={() => handleDifficultyChange(0)}
          >
            Easy
          </button>
          <button
            className={difficulty === 1 ? 'active' : ''}
            onClick={() => handleDifficultyChange(1)}
          >
            Medium
          </button>
          <button
            className={difficulty === 2 ? 'active' : ''}
            onClick={() => handleDifficultyChange(2)}
          >
            Hard
          </button>
          <button
            className={difficulty === 3 ? 'active' : ''}
            onClick={() => handleDifficultyChange(3)}
          >
            Extreme
          </button>
        </div>
      </div>
      {/* <div className='timer'>
        <p>Timer: {timer} seconds </p>
      </div> */}
        <div className="timer-container">
          <span className="timer-label">Timer:</span>
          <span className="timer-value">{timer} s</span>
        </div>
      <div className='counters'>
        <p>Hints: {hints}/3</p>
        <p>Wrong Counter: {wrongCounter}/5</p>
      </div>
        <div className={`
        ${wrongCounter >= 5 ? 'sudoku-board-lose' : ''}
        ${isGameCompleted ? 'sudoku-board-win' : ''}
        game-board`}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => {
                const isInvalidCell = invalidCells.some(
                  (invalidCell) => invalidCell.row === rowIndex && invalidCell.col === colIndex
                );
                return (
                <div key={colIndex} className={`cell`}>
                <input
                  key={colIndex}
                  type="number"
                  value={cell || ''}
                  readOnly={initialBoard[rowIndex][colIndex] !== 0}
                  min="1"
                  max="9"
                  onChange={(e) =>
                    handleCellChange(rowIndex, colIndex, parseInt(e.target.value, 10))
                  }
                  onClick={()=>handleTileClick(rowIndex, colIndex)}
                  ref={(input) => (inputRefs.current[rowIndex][colIndex] = input)}
                  onKeyDown={(e)=>handleKeyDown(e,rowIndex, colIndex)}
                  className={`
                  ${board[activeTile.row][activeTile.col] === board[rowIndex][colIndex] && board[rowIndex][colIndex] !== 0? 'active-tile': ''}
                  ${isInvalidCell ? 'invalid-cell' : ''}
                  ${initialBoard[rowIndex][colIndex] !== 0 ? 'initial-value': 'user-value'} 
                  ${activeTile.row === rowIndex && activeTile.col === colIndex ? 'active-tile' : ''}
                  ${activeTile.col === colIndex ? 'active' : ''}
                  ${activeTile.row === rowIndex ? 'active' : ''}    
                  ${highlightedCells.some(c => c.row === rowIndex && c.col === colIndex) ? 'active' : ''}
                  `}
                />
                </div>
              );
              })}
          </div>
        ))}
          {wrongCounter >= 5 && (
            <div className="wrong-limit-screen">
              <div className='game-over-message'>
                <h3>Game Over! Maximum number of wrong answers.</h3>
                <p>Try Again!</p>
                <p>Time taken - {lastTimer} seconds</p>
              </div>
            </div>
          )}
          {isCompleted && (
            <div className="win-overlay">
              <div className="win-message">
                <p>Congratulations! Puzzle Completed!</p>
                <p>Time taken - {lastTimer} seconds</p>
                </div>
            </div>
          )}
        </div>
        <div className='menu'>
          {Array.from({length : 9}, (_, index) => (
            <button key={index} onClick={()=>handleNumberButtonClick(index+1)}>{index+1}</button>
          ))}
          <div>
            <button onClick={handleUndo}>Undo</button>
            <button onClick={()=>handleNumberButtonClick(0)}>Erase</button>
            <button onClick={()=>handleHint()}>Hint</button>
          </div>
        </div>
  </div>
  );
}
export default GameBoard;
