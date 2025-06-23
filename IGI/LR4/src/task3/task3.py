from .drawer import Drawer
from .math_models import TaylorSeries, TaylorSeriesLogarithm, TaylorSeriesLogTable
from ..utils.io_functions import input_with_validating
from ..utils.utils import repeating_program
from ..itask import ITask


class Task3(ITask):
    X_START, X_END, X_STEP = -99, 99, 1

    def __init__(self, directory: str):
        self._log_handler = TaylorSeriesLogarithm
        self._table = None
        self._table_manager = TaylorSeriesLogTable
        self._directory = directory
        self._drawer = Drawer()

    @repeating_program
    def run(self):
        """
        Calculate the value of the function ln(1+x) using the expansion of the function into a
        taylor series with a given calculation accuracy.
        """

        try:
            x, eps = self._input_values()

            series = self._log_handler(eps, x)
            print(series)

            self._table = self._table_manager.create_table(self._log_handler, eps)
            self._plot_ln()
        except Exception as e:
            print(e)

    def _plot_ln(self):

        x, y_taylor, y_math = self._table_manager.extract_columns(self._table, 'x', 'fx', 'math_f')

        self._drawer.plot_table(((x, y_taylor), (x, y_math)), ('x', 'y'),
                                ('y = taylor_ln(x)', 'y = math_ln(x)'),
                                'Comparison of natural logarithm graphs using Taylor series and math',
                                f'{self._directory}ln_graphics.png')
    @staticmethod
    def _input_values():
    
        x = float(input_with_validating(lambda i: abs(float(i)) < 1 and float(i) != 0,
                                        'Enter the value of x: (-1; 0) or (0; 1): '))
        eps = float(input_with_validating(lambda i: float(i) > 0, 'Enter the value of eps: (0, +inf): '))
        return x, eps
