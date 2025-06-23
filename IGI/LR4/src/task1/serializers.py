import csv
import pickle
from abc import ABC, abstractmethod
from .models import ClearingStudentsRepository, Student

class StudentFileHandler(ABC):
    
    @abstractmethod
    def save(self, repo: ClearingStudentsRepository, filename: str): ...
    
    @abstractmethod
    def load(self, repo: ClearingStudentsRepository, filename: str): ...


class PickleStudentFileHandler(StudentFileHandler):

    def save(self, repo: ClearingStudentsRepository, filename: str):
        with open(filename, 'wb') as file:
            pickle.dump(repo.students,file)

    def load(self, repo: ClearingStudentsRepository, filename: str):
        with open(filename, 'rb') as file:
            students = pickle.load(file)  
        repo.students = students  
        
class CSVStudentFileHandler(StudentFileHandler):
    
    def save(self, repo: ClearingStudentsRepository, filename: str):
        with open(filename, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['Name', 'Grades'])
            for student in repo.students.values():
                writer.writerow([student.name, ','.join(map(str, student.grades))])

    def load(self, repo: ClearingStudentsRepository, filename: str):
        repo.clear()  
        with open(filename, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                grades = list(map(int, row['Grades'].split(','))) 
                repo.add_student(Student(row['Name'], grades))