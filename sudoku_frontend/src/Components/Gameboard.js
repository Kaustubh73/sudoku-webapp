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
  const [activeRow, setActiveRow] = useState(null);
  const [activeCol, setActiveCol] = useState(null);
  const [activeCell, setActiveCell] = useState({row:null, col:null});
  const [activeTile, setActiveTile] = useState({row:null, col:null});
  const [cellHistory, setCellHistory] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);


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
  const handleCellChange = (row, col, value) => {
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
  };

  const handleNumberButtonClick = (number) => {
    if (activeTile.row !== null && activeTile.col != null) {
      handleCellChange(activeTile.row, activeTile.col, number);
    }
  }
  const handleTileClick = (row, col) => {
    setActiveTile({row,col});
    const highlightedCells = [];
    setActiveRow(row);
    setActiveCol(col);

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
      const {row, col} = lastChange;

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
    }
  };


  return (
    <div className="game-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <div key={colIndex} className={`cell`}>
              {/* {activeCol} */}
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
              onClick={()=>handleTileClick(rowIndex, colIndex)} className={`${initialBoard[rowIndex][colIndex] !== 0 ? 'initial-value': 'user-value'} 
              ${activeTile.row === rowIndex && activeTile.col === colIndex ? 'active-tile' : ''}
              ${activeCol === colIndex ? 'active' : ''}
              ${activeRow === rowIndex ? 'active' : ''}    
              ${highlightedCells.some(c => c.row === rowIndex && c.col === colIndex) ? 'active' : ''}
              `}
            />
            </div>
          ))}
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
