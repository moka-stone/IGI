import math
from statistics import median, mode, pvariance, pstdev
from typing import Any


class TaylorSeries(object):
    """
    Represents a Taylor series and provides methods to calculate statistics
    for the series, such as sum, average, median, mode, variance, and standard deviation.
    """

    def __init__(self, series: tuple[float, ...]):

        self._series = series
        self._n = len(series)

    @property
    def n(self):
        """Returns the number of terms in the series."""

        return self._n

    def sum(self):
        """Calculates the sum of all terms in the series."""

        return sum(self._series)

    def average_value(self):
        """Calculates the average value of the series."""

        return sum(self._series) / self._n

    def median(self):
        """Calculates the median of the series."""

        return median(self._series)

    def mode(self):
        """Calculates the mode (the most common value) of the series."""

        return mode(self._series)

    def variance(self):
        """Calculates the variance of the series."""

        return pvariance(self._series)

    def stdev(self):
        """Calculates the standard deviation of the series."""

        return pstdev(self._series)

    def __str__(self):
        """Returns a string representation of the Taylor series."""

        return (f'n: {self.n}\n'
                f'F(x): {self.sum()}\n'
                f'Average value: {self.average_value()}\n'
                f'Median: {self.median()}\n'
                f'Mode: {self.mode()}\n'
                f'Variance: {self.variance()}\n'
                f'Stdev: {self.stdev()}')



class TaylorSeriesLogarithm(TaylorSeries):

    def __init__(self, epsilon: float, x: float):

        n = self._find_min_n_for_epsilon(epsilon, x)

        super().__init__(tuple(pow(-1, i - 1) * pow(x, i) / i for i in range(1, n + 1)))

    @staticmethod
    def _find_min_n_for_epsilon(epsilon: float, x: float) -> int:

        math_result = math.log(x + 1)
        num_of_members = 1

        for num_of_members in range(1, 501):
            result = TaylorSeries(tuple(pow(-1, i - 1) * pow(x, i) / i for i in range(1, num_of_members + 1)))
            if abs(result.sum() - math_result) <= epsilon:
                return num_of_members

        return num_of_members


class TaylorSeriesLogTable(object):

    @staticmethod
    def create_table(log_handler: type[TaylorSeriesLogarithm], eps: float):

        table = []
        for x in range(-99, 99, 1):
            f_x = log_handler(eps, x * 0.01)
            table.append({
                'x': x * 0.01,
                'n': f_x.n,
                'fx': f_x.sum(),
                'math_f': math.log(x * 0.01 + 1),
                'eps': eps
            })

        return table

    @staticmethod
    def extract_columns(table: list[dict[str, Any]], *column_values: str):

        return tuple(tuple(row[i] for row in table) for i in column_values)


