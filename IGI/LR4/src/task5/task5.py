from .math_models import MatrixProcessor
from ..utils.io_functions import input_with_validating
from ..utils.utils import repeating_program
from ..itask import ITask


class Task5(ITask):
   
    @repeating_program
    def run(self):

        try:
            n, m = self._input_values()

            processor = MatrixProcessor(n, m)
            print("Original matrix:\n", processor.matrix)

            sorted_matrix = processor.sort_by_last()
            print("Sorted matrix:\n", sorted_matrix)

            mean_n, mean_m = processor.calculate_mean_last_column()
            print("Numpy method:", mean_n)
            print("My formula:", mean_m)

        except Exception as e:
            print(e)

    @staticmethod
    def _input_values():

        n = int(input_with_validating(lambda x: int(x) > 0, 'Enter n: '))
        m = int(input_with_validating(lambda x: int(x) > 0, 'Enter m: '))

        return n, m
