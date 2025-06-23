from functools import wraps
from .io_functions import ask_for_repeat

def repeating_program(foo: callable) -> callable:
    """
    Decorator that repeats the wrapped function execution until user declines.

    :param foo: Function to be repeated (should accept no arguments).
    :return: Wrapped function with repeat logic.
    """

    @wraps(foo)
    def wrapper(*args, **kwargs):
        while True:
            foo(*args, **kwargs)
            if not ask_for_repeat():
                break

    return wrapper