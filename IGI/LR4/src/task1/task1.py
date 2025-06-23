from .models import ClearingStudentsRepository, Student
from .serializers import StudentFileHandler, PickleStudentFileHandler, CSVStudentFileHandler
from .services import StudentsService
from ..utils.io_functions import input_with_validating
from ..utils.utils import repeating_program
from ..itask import ITask
import os


class Task1(ITask):
   
    def __init__(self, filepath: str):
        self._repo = ClearingStudentsRepository()
        self._service = StudentsService(self._repo)
        self._export_methods: dict[str, StudentFileHandler] = {
            'pickle': PickleStudentFileHandler(),
            'csv': CSVStudentFileHandler()
        }
        self._filepath = filepath

    @repeating_program
    def run(self):
        try:
            export_method = input_with_validating(lambda msg: msg.lower().strip() in self._export_methods,
                                                  'Enter export method (pickle, csv): ').lower().strip()
            filename = f'{self._filepath}.{export_method}'

            # Проверка на существование файла
            if not os.path.exists(filename):
                print(f"Файл '{filename}' не найден. Создание нового файла с начальными данными.")           
                initial_students = [
                    Student("Специан", [100, 90, 100, 90, 90, 40]),
                    Student("Иванов", [85, 90, 78]),
                    Student("Петров", [95, 92, 88]),
                    Student("Сидоров", [55, 60, 45]),
                ]
                for student in initial_students:
                    self._repo.add_student(student)
                self._export_methods[export_method].save(self._repo, filename)

            self._export_methods[export_method].load(self._repo, filename)
            print(f"Средняя оценка в классе: {self._service.class_average():.2f}")
            print("Неуспевающие ученики:", ', '.join(self._service.get_failing_students()) or "Нет")
            print("Отличники:", ', '.join(self._service.get_excellent_students()) or "Нет")

            student_name = input('Введите имя ученика: ').strip()
            student_info = self._service.find_student_info(student_name)
            if student_info:
                print(f"Информация о {student_info['name']}:")
                print(f"Средний балл: {student_info['average_grade']:.2f}")
                print("Неуспевающий" if student_info['failing'] else "Отличник" if student_info['excellent'] else "Успевающий")
            else:
                print("Ученик не найден.")
        except Exception as e:
            print(e)