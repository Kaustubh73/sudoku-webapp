import numpy as np
import random

Board = np.zeros((9,9), int)
# Board = np.array([[2, 5, 0, 0, 3, 0, 9, 0, 1],
#         [0, 1, 0, 0, 0, 4, 0, 0, 0],
#     [4, 0, 7, 0, 0, 0, 2, 0, 8],
#     [0, 0, 5, 2, 0, 0, 0, 0, 0],
#     [0, 0, 0, 0, 9, 8, 1, 0, 0],
#     [0, 4, 0, 0, 0, 3, 0, 0, 0],
#     [0, 0, 0, 3, 6, 0, 0, 7, 2],
#     [0, 7, 0, 0, 0, 0, 0, 0, 3],
#     [9, 0, 3, 0, 0, 0, 6, 0, 4]])
print(Board)

def isValid(Board, row, col, num):
    for i in range(9):
        if (Board[i][col] == num):
            return False
    for i in range(9):
        if (Board[row][i] == num):
            return False
    
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(start_row, start_row+3):
        for j in range(start_col, start_col + 3):
            if (Board[i][j] == num):
                return False
    return True

def Sudoku(Board, row, col):
    if (row == 8 and col == 9):
        return True
    
    if (col == 9):
        row+= 1
        col = 0
    
    if (Board[row][col] > 0):
        return Sudoku(Board, row, col+1)
    nums = random.sample(range(1,10),9)
    for num in nums:
        if (isValid(Board, row,col,num)):
            Board[row][col] = num
            if (Sudoku(Board,row,col+1)):
                return True
    Board[row][col] = 0
    return False
    
def makePuzzle(Board):
    
Sudoku(Board, 0, 0)

print(Board)