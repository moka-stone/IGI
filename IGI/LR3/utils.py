import random

from io_functions import ask_for_repeat, input_with_validating
from functools import wraps

# Decorator
def repeating_program(foo: callable) -> callable:

    
    @wraps(foo)
    def wrapper():
        while True:
            foo()
            if not ask_for_repeat():
                break

    return wrapper


def generate_int_sequence(mid: int = 15, spread=100):
    while True:
        yield random.randint(mid - spread, mid + spread)


def init_with_random(sequence: list, stop: int = 15, max_iterations: int = 100) -> None:
    iterations = 0

    for num in generate_int_sequence(mid=stop):
        iterations += 1
        if num == stop or iterations == max_iterations:
            sequence.append(stop)
            break
        sequence.append(num)


def init_with_validating_user_input(sequence: list, validator: callable, transformation: callable = str,
                                    msg: str = '', stop: int = 15):
    number = -1

    while number != stop:
        number = transformation(input_with_validating(validator, msg))
        sequence.append(number)