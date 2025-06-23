import math
from mathematics import find_n_for_series, calculate_more_than_23_nums, calculate_count_of_negative_odd_indexed_elements, \
    calculate_sum_of_elements_before_last_zero
from utils import repeating_program, init_with_validating_user_input, init_with_random
from io_functions import input_with_validating
from validators import validate_hexadecimal_string
from string_handler import find_uppercase_words, find_longest_word_starting_with_t, find_repeating_words


@repeating_program
def task1():
    """Calculate ln(1+x)"""
    x = float(input_with_validating(lambda i: abs(float(i)) < 1 and float(i) != 0,
                                    'Enter the value of x: (-1; 0) or (0; 1): '))
    eps = float(input_with_validating(lambda i: float(i) > 0, 'Enter the value of eps: (0, +inf): '))

    f_x, n = find_n_for_series(eps, x)
    result_lst = ('x -',x, 'n -', n, 'tailor -', f_x, 'mathfunk -', math.log(x + 1), 'eps -', eps)

    print(*result_lst)


@repeating_program
def task2():
    """Calculate the number of numbers > 23 in the sequence."""
    numbers = []
    generating_way = int(input_with_validating(lambda i: 0 <= int(i) <= 1, '0 - Generate sequence, 1 - Input: '))

    if generating_way == 0:
        init_with_random(numbers, max_iterations=100)
    else:
        init_with_validating_user_input(numbers, int, int, 'Enter integer number (15 to stop):', 15)

    print('Orig numbers: ', *numbers)
    print(f'Count of numbers: {len(numbers)}. Count of numbers which > 23: {len(calculate_more_than_23_nums(numbers))}')


@repeating_program
def task3():
    """Check if input string is an hexadecimal value."""
    string = input('Enter string: ')
    print('It is hexadecimal number.' if validate_hexadecimal_string(string) else 'It is not hexadecimal number.')


@repeating_program
def task4():
    """
    Analyze text and calculate various statistics:
    - Count of words with uppercase symbols.
    - Longest word starting with 'l'.
    - All repeating words.
    """
    string = ('So she was considering in her own mind, as well as she could, for the hot day made her feel very sleepy '
              'and stupid, whether the pleasure of making a daisy-chain would be worth the trouble of getting up and '
              'picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.')
    words = [word for el in string.split(',') for word in el.strip().split()]

    
    uppercase_count = find_uppercase_words(words)
    longest_word_with_l = find_longest_word_starting_with_t(words)
    repeating_words = find_repeating_words(words)

    print('Count of words with uppercase symbols:', uppercase_count)
    print(f"Longest word starting with 'l': {longest_word_with_l or 'no word'}")
    print('Repeating words:', *repeating_words)


@repeating_program
def task5():
    """
    Find next values for a given sequence of float values:
    - Count of negative elements with odd indexes.
    - Sum of elements before last 0.
    """
    numbers = input_with_validating(lambda s: tuple(map(int, s.strip().split())),
                                    'Enter the list (separated by space): ')
    numbers = tuple(map(int, numbers.strip().split()))

    count_of_negative_elements_with_odd_index = calculate_count_of_negative_odd_indexed_elements(numbers)
    sum_of_elements_before_last_zero = calculate_sum_of_elements_before_last_zero(numbers)

    print('Count of negative elements with odd index: ' +
          (f"{count_of_negative_elements_with_odd_index}"
          if count_of_negative_elements_with_odd_index is not None else 'no negative elements odd indexed'))
    print('Sum of elements between first and last negative: ' +
          (f"{sum_of_elements_before_last_zero}"
          if sum_of_elements_before_last_zero is not None
          else 'no 0'))


def menu():
    tasks = {'1': task1, '2': task2, '3': task3, '4': task4, '5': task5}
    while True:
        choice = input('\nComplete task - 1..5'
                       '\nShow task documentation - 1d..5d'
                       '\nExit - 0\n').strip()

        match choice:
            case cmd if cmd in tasks:
                tasks[cmd]()
            case cmd if cmd.endswith('d') and (num := cmd[:-1]) in tasks:
                print(tasks[num].__doc__)
            case '0':
                break
            case _:
                print('Invalid choice.')


if __name__ == '__main__':
    menu()