import numpy


class MatrixProcessor(object):

    def __init__(self, rows: int, cols: int):

        self.matrix = numpy.random.randint(-100, 100, size=(rows, cols))

    def sort_by_last(self) -> numpy.ndarray:
         sorted_indices = numpy.argsort(self.matrix[:, -1])[::-1]
         return self.matrix[sorted_indices]
      

    def calculate_mean_last_column(self) -> float:
        last_column = self.matrix[:, -1]

        mean_nump = numpy.mean(last_column)
        mean_mine = sum(last_column) / len(last_column)

        return round(mean_nump, 2), round(mean_mine, 2)