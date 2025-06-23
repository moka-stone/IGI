def input_with_validating(validator: callable, msg: str = '', repeat: bool = True):
    """
    Performs validated input with retries on invalid data.

    :param validator: Validation function.
    :param msg: Input prompt message (default '').
    :param repeat: Repeat prompt after validating error.
    :return: Input value.
    """
    while repeat:
        value = input(msg)
        if validate_any_input(value, validator):
            return value
        print('Invalid input.')


def validate_any_input(value, validator: callable) -> bool:
    """
    Validates a user-provided value using a specified validator function.

    :param value: Value to validate.
    :param validator: The validator function to use.
    :return: True if the value passes validation, False otherwise.
    """
    try:
        result = validator(value)
        if isinstance(result, bool):
            return result
        return True
    except Exception:
        return False


def ask_for_repeat() -> bool:
    """
    Asks a user to repeat.

    :return: True if the answer is y, False otherwise.
    """
    choice = input("Repeat? (y/otherwise): ").lower()
    return True if choice == 'y' else False
