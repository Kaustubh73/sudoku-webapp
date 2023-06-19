import React, { useState, useEffect } from 'react';
import '../css/Gameboard.css'

const GameBoard = () => {

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
  const [activeCell, setActiveCell] = useState({row:0, col:0});
  const [activeTile, setActiveTile] = useState({row:0, col:0});
  const [cellHistory, setCellHistory] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [invalidCells, setInvalidCells] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const [difficulty, setDifficulty] = useState(null); 

  useEffect(() => {
    (
      async () => {
        try {
        const response = await fetch('http://localhost:8000/api/generate-sudoku', {
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
        });
        
        const content = await response.json();
        try {
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
  }, []);
  
  // const printBoard = async (difficulty) => {
  //   (
  //     async () => {
  //       try {
  //       const response = await fetch('http://localhost:8000/api/generate-sudoku', {
  //           method: 'POST',
  //           headers: {'Content-Type': 'application/json'},
  //           credentials: 'include',
  //           body: JSON.stringify({
  //             difficulty
  //         })
  //       });
  //       const content = await response.json();
  //       try {
  //           setInitialBoard(content.puzzle);
  //           setBoard(content.puzzle);
  //           setIsSet(true);
  //       } catch {
  //           console.error('Error fetching board');
  //       }
  //     } catch (error) {
  //           console.error(error);
  //     }
  //   }
  //   )(); 
  // }
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
    if (initialBoard[row][col] !== 0)
    {
      return;
    }
    const updatedBoard = board.map((rowArray, rowIndex) =>
    rowArray.map((cell, colIndex) => {
      if (rowIndex === row && colIndex === col) {
        return value;
      }
      return cell;
    })
    );
    setBoard(updatedBoard);
    setCellHistory([...cellHistory, {row, col ,value}]);
    const isValidMove = await validateMove(row, col, value, updatedBoard);
    if (!isValidMove)
    {
      setInvalidCells((prevInvalidCells) => [...prevInvalidCells, { row, col }]); 
    }
    if (value === 0 || !value)
    {
      const updatedInvalidCells = invalidCells.filter(
        (cell) => cell.row !== row || cell.col !== col
      );
      setInvalidCells(updatedInvalidCells);
    }
  };

  const handleNumberButtonClick = (number) => {
    if (activeTile.row !== null && activeTile.col !== null) {
      handleCellChange(activeTile.row, activeTile.col, number);
    }
  }
  const handleTileClick = (row, col) => {
    setActiveTile({row,col});
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
  
  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
    console.log(difficulty);

  }
  useEffect(() => {
    const isBoardCompleted = board.every(row => row.every(cell => cell !== 0));
    setIsCompleted(isBoardCompleted);
  }, [board]);
  if (isCompleted && invalidCells.length == 0) {
    setIsSet(false);
    return <div className="completion-screen">Congratulations! Puzzle Completed!</div>;
  }
  return (
    <div className="game-board">
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
                onClick={()=>handleTileClick(rowIndex, colIndex)} className={`
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
      <div className='menu'>
        {Array.from({length : 9}, (_, index) => (
          <button key={index} onClick={()=>handleNumberButtonClick(index+1)}>{index+1}</button>
        ))}
        <div>
          <button onClick={handleUndo}>Undo</button>
          <button onClick={()=>handleNumberButtonClick(0)}>Erase</button>
          <button>Hint</button>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
