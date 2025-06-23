from .models import Rhombus
from .services import RhombusManager
from ..task3.task3 import Drawer
from ..utils.io_functions import input_with_validating
from ..utils.utils import repeating_program
from ..itask import ITask

class Task4(ITask):

    def __init__(self, directory: str):
        self._directory = directory

    @staticmethod
    def input_figure():
        a = float(input_with_validating(lambda i: float(i) > 0, 'Enter side length a: '))
        angle_R = float(input_with_validating(lambda i: float(i) > 0, 'Enter obtuse angle R: '))
        color = input('Enter figure color (#rgb, #rrggbb or color name...): ').strip().lower()

        return a, angle_R, color

    @repeating_program
    def run(self):
        try:
            rhombus_manager = RhombusManager(self._directory, Drawer())
            rhombus = Rhombus(*self.input_figure())

            print(rhombus.name_of_class() + ': ' + str(rhombus))
            rhombus_manager.draw_rhombus(rhombus, input('Enter figure title: '))
        except Exception as e:
            print(e)