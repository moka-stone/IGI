from abc import ABC, abstractmethod
import math

class Figure(ABC):

    @abstractmethod
    def square(self) -> float: ...


class Color(object):

    def __init__(self, color: str):
    
        self._color: str = color

    def get_color(self) -> str:

        return self._color

    def set_color(self, value: str):

        self._color = value

    color = property(fget=get_color, fset=set_color, doc="Color property")


class Rhombus(Figure):
    name = 'Rhombus'

    def __init__(self, a: float, angle_R: float, color: str):
        self._validate(a, angle_R)
        self._a: float = a
        self._angle_R: float = angle_R
        self._color: Color = Color(color)

    def __str__(self):
        return 'side a: {}, angle R: {}, color: {}, square: {}'.format(
            self._a, self._angle_R, self._color.color, self.square())

    def square(self) -> float:
        angle_rad = math.radians(180 - self._angle_R) 
        area = self._a ** 2 * math.sin(angle_rad)
        return area

    @property
    def color(self) -> str:
        return self._color.color

    @property
    def params(self) -> tuple[float, float]:
        return self._a, self._angle_R
    
    @classmethod
    def name_of_class(cls) -> str:
        return cls.name

    @staticmethod
    def _validate(a: float, angle_R: float):
        if a <= 0:
            raise ValueError('The length of side a must be greater than 0.')
        if angle_R < 90 or angle_R >= 180:
            raise ValueError('The angle R must be greater or eq than 90 degrees and less than 180 degrees.')