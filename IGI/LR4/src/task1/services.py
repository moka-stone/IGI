from .models import StudentsRepository

class StudentsService:

    def __init__(self, repository: StudentsRepository):
        self._repository = repository

    def class_average(self) -> float:
        total_students = len(self._repository.students)
        total_average = sum(student.average_grade() for student in self._repository.students.values())
        class_average = total_average / total_students if total_students > 0 else 0.0
        return class_average

    def get_failing_students(self) -> list[str]:
        return [student.name for student in self._repository.get_failing_students()]

    def get_excellent_students(self) -> list[str]:
        return [student.name for student in self._repository.get_excellent_students()]
    
    def find_student_info(self, student_name: str) -> dict | None:
        student = self._repository.students.get(student_name.lower())
        if student:
            return {
                'name': student.name,
                'average_grade': student.average_grade(),
                'failing': student.is_failing(),
                'excellent': student.is_excellent()
            }

