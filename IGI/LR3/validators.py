def validate_ln_calc_input(value: float, n: int) -> None:
    if abs(value) >= 1 or n < 1:
        raise ValueError


def validate_any_input(value, validator: callable) -> bool:
    """Check and return bool"""
    try:
        result = validator(value)
        if isinstance(result, bool):
            return result
        return True
    except Exception:
        return False

def validate_hexadecimal_string(string: str) -> bool:
    try:
        int(string, 16)
        return True
    except ValueError:
        return False