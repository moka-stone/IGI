def find_uppercase_words(string_sequence: list | tuple) -> int:
    """
    Counts the number of words consisting entirely of uppercase letters.
    """
    return sum(1 for word in string_sequence if word!=word.lower())

def find_longest_word_starting_with_t(string_sequence: list | tuple) -> str | None:
    """
    Finds the longest word in sequence that starts with the letter 'l'
    """
    words = filter(lambda word: word.lower().startswith('t'), string_sequence)
    longest_word = max(words, key=len, default=None)

    return longest_word


def find_repeating_words(string_sequence: list | tuple) -> tuple:
    """
    Identifies words that are repeated in input sequence.
    """
    return tuple(set(filter(lambda word: string_sequence.count(word) >= 2, string_sequence)))