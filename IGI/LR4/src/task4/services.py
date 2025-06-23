import math

from ..task3.drawer import Drawer
from .models import Rhombus


class RhombusManager(object):

    def __init__(self, directory: str, drawer: Drawer):
        self._directory = directory
        self._drawer = drawer

    def draw_rhombus(self, rhombus: Rhombus, title: str):

        x_coords, y_coords = self.calculate_coordinates(rhombus)

        self._drawer.plot_by_coords(
            x_coords,
            y_coords,
            title,
            f"{self._directory}rhombus.png",
            rhombus.color
        )

    @staticmethod
    def calculate_coordinates(rhombus: Rhombus) -> tuple[tuple[float, ...], tuple[float, ...]]:
        a, angle_R = rhombus.params  

        # Вычисляем углы в радианах
        angle_rad = math.radians(angle_R)

        # Координаты вершин ромба
        x1, y1 = 0, 0
        x2 = a * math.sin(angle_rad/2)
        y2 = a * math.cos(angle_rad/2)
        x3 = 0
        y3 = y2*2
        x4 = -x2
        y4 = y2

        x_coords = (x1, x2, x3, x4, x1)
        y_coords = (y1, y2, y3, y4, y1)

        return x_coords, y_coords