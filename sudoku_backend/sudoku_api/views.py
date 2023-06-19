from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
import numpy as np
from sudoku_api.generator import *
# Create your views here.
class GenerateView(APIView):
    def get(self, request):
        Board = np.zeros((9,9), int)
        Sudoku(Board)
        puzzle = makePuzzle(Board, 0)
        response_data = {
            'puzzle': puzzle,
        }
        
        return Response(response_data)


class ValidateView(APIView):
    def post(self, request):
        board = request.data['board']
        row = request.data['row']
        col = request.data['col']
        value = request.data['value']
        
        if (isValidMove(board, row, col, value)):
            return Response({'valid': True})
        else:
            return Response({'valid': False})