"""
Lab №4
Completed by Spetsian Makar, group 353504.

work with classes, serializers, regular expressions, standard libraries.
"""

from src import ITask, Task1, Task2, Task3, Task4, Task5


class Menu(object):
    def __init__(self):
        self.tasks: dict[str, ITask] = {
            '1': Task1(filepath='data/students'),
            '2': Task2(original_text_path='data/text.txt',
                       filepath='data/final_text.txt',
                       archive_path='data/final_text.zip'),
            '3': Task3(directory='data/'),
            '4': Task4(directory='data/'),
            '5': Task5()
        }

    def show(self):
        while True:
            choice = input('\nComplete task - 1..5'
                           '\nShow task documentation - 1d..5d'
                           '\nExit - 0\n').strip()

            match choice:
                case cmd if cmd in self.tasks:
                    self.tasks[cmd].run()
                case cmd if cmd.endswith('d') and (num := cmd[:-1]) in self.tasks:
                    print(self.tasks[num].__doc__)
                case '0':
                    break
                case _:
                    print('Invalid choice.')


if __name__ == '__main__':
    menu = Menu()
    menu.show()