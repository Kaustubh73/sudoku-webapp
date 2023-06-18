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


    