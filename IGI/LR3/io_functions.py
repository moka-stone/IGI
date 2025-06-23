from validators import validate_any_input


def input_with_validating(validator: callable, msg: str = ""):
    """Input before true in validator, then return"""
    while True:
        value = input(msg)
        if validate_any_input(value, validator):
            return value
        print("Invalid input. Try again.")


def ask_for_repeat() -> bool:
    choice = input("Repeat? (y/otherwise): ").lower()
    return True if choice == "y" else False
