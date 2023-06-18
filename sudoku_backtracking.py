import numpy as np
import random

Board = np.zeros((9,9), int)
# Board = np.array([[6, 0, 0, 0, 0, 3, 0, 5, 8],
#                 [0, 8, 5, 1, 0, 0, 0, 3, 0],
#                 [0, 0, 9, 0, 0, 0, 2, 6, 1],
#                 [0, 2, 4, 8, 3, 6, 0, 7, 5],
#                 [0, 7, 6, 0, 5, 0, 8, 0, 0],
#                 [3, 5, 0, 0, 9, 0, 0, 0, 6],
#                 [8, 6, 0, 0, 0, 7, 0, 1, 0],
#                 [4, 9, 0, 0, 0, 0, 3, 8, 7],
#                 [5, 1, 7, 3, 0, 0, 0, 0, 9]])
print(Board)

def findZeros(Board, l):
    for row in range(9):
        for col in range(9):
            if Board[row][col] == 0:
                l[0] = row
                l[1] = col
                return True
    return False

def isValid(Board, row, col, num):
    if (Board[row][col] != 0):
        return False
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

def Sudoku(Board):
    l = [0,0]
    if (not findZeros(Board, l)):
        return True
          
    row = l[0]
    col = l[1]
    nums = random.sample(range(1,10), 9)
    for num in nums:
        if (isValid(Board, row,col,num)):
            Board[row][col] = num
            if (Sudoku(Board)):
                return True
            Board[row][col] = 0
    return False
def checkIfSolvable(Board):
    alt_Board = Board.copy()
    if Sudoku(alt_Board):
        return True
    return False
def makePuzzle(Board, level):
    Board_dup = Board.copy()
    nums_removed =[]
    if (level == 0):
        nums = 40
    elif (level == 1):
        nums = 45
    elif (level == 2):
        nums = 50
    elif (level == 3):
        nums = 55
        
    for i in range(nums):
        row = random.randint(0,8)
        col = random.randint(0,8)
        while (Board_dup[row][col] == 0):
            row = random.randint(0,8)
            col = random.randint(0,8)   
        Board_dup[row][col] = 0
    if checkIfSolvable(Board_dup):
        return Board_dup
    else:
        return makePuzzle(Board, level)
Sudoku(Board)    
puzzle = makePuzzle(Board, 1)
print(puzzle)
# Puzzle = makePuzzle(Board, 0)
# print(Puzzle)
# Puzzle = makePuzzle(Board, 1)
# print(Puzzle)
# Puzzle = makePuzzle(Board, 2)
# print(Puzzle)
# Puzzle = makePuzzle(Board, 3)
# print(Puzzle)
# # cont = 0
# # for i in range(9):
#     for j in range(9):
#         if Puzzle[i][j] == 0:
#             cont += 1
# print(cont)