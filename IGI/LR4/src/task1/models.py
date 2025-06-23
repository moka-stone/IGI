class Student:
    def __init__(self, name: str, grades: list[int]):
        self._name = name
        self._grades = grades

    @property
    def name(self) -> str:
        return self._name

    @property
    def grades(self) -> list[int]:
        return self._grades

    
    def average_grade(self) -> float:
        return sum(self._grades) / len(self._grades) if self._grades else 0.0
   
    def is_excellent(self) -> bool:
        return (self.average_grade() >= 90)
    
    def is_failing(self) -> bool:
        return (self.average_grade() < 60)

class StudentsRepository:
    def __init__(self):
        self._students: dict[str, Student] = {}

    @property
    def students(self) -> dict[str, Student]:
        return self._students.copy()
    
    @students.setter
    def students(self, d: dict[str, Student]):
        self._students = d.copy()

    def add_student(self, student: Student):
        self._students[student.name.lower()] = student

    def get_failing_students(self) -> list[Student]:
        return [student for student in self._students.values() if student.is_failing()]

    def get_excellent_students(self) -> list[Student]:
        return [student for student in self._students.values() if student.is_excellent()]

class ClearingStudentMixin(object):
    def clear(self):
        self._students.clear()


class ClearingStudentsRepository(StudentsRepository, ClearingStudentMixin):
    pass
