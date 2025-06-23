import zipfile

from .file_managers import FileManager, ZipManager
from .text_analyzer import TextAnalyzer
from ..utils.utils import repeating_program
from ..itask import ITask


class Task2(ITask):
    """
    The text is read from the source file. Using regular expressions, the required information
    is obtained, displayed on the screen and saved to another file, archived. Information about
    the file in the archive is provided.

    Initial information:
        – number of sentences in the text;
        – number of sentences in the text of each type separately (narrative, interrogative and imperative);
        – average sentence length in characters (only words are counted);
        – average word length in the text in characters;
        – number of emoticons in the given text;
        – list of hexadecimal numbers;
        – existence of digits followed by "+";
        – number of words whose length is 4 characters;
        – words whose number of vowels is equal to the number of consonants and their ordinal numbers;
        – words in descending order of their lengths.
    """

    def __init__(self, original_text_path: str, filepath: str, archive_path: str):

        self._text = FileManager.load(original_text_path)
        self._string_handler = TextAnalyzer()
        self._final_text = ''
        self._file_path = filepath
        self._archive_path = archive_path

    @repeating_program
    def run(self):

        try:
            self._calculate_results()

            FileManager.save(self._final_text, self._file_path)
            ZipManager.save(self._file_path, self._archive_path)

            text = ZipManager.load(self._archive_path, self._file_path.split('/')[-1])
            print(f'Text from archive:\n{text}')

            info = ZipManager.file_info(self._archive_path, self._file_path.split('/')[-1])
            print(f'Information about file:\n{self._file_info(info)}')
        except Exception as e:
            print(e)

    def _calculate_results(self):
        """
        Analyzes the text to calculate various statistics, such as:
        - Number of sentences.
        - Count of different types of sentences.
        - Average word and sentence lengths.
        - Number of smileys, hexadecimal numbers, words of specific length, etc.
        The results are formatted into a string and saved in the `_final_text` attribute.
        """
        #General
        sentence_count = len(self._string_handler.sentences(self._text))
        every_sentences_count = self._string_handler.count_of_every_sentence_type(self._text)
        average_word_length_in_sentence = tuple(self._string_handler.average_sentence_length(self._text))
        average_word_length_in_text = round(sum(average_word_length_in_sentence) / sentence_count, 2)
        smileys_count = len(self._string_handler.get_smileys(self._text))
        #Individual
        replaced_space_text = self._string_handler.replace_spaces_by_char(self._text, input('Input char:'))
        guid_check_str = input('Input string to guid check:')
        guid_check = self._string_handler.is_valid_guid(guid_check_str)
        count_words_len_3 = len(self._string_handler.get_words_with_len(self._text, 3))
        words_same_vc = tuple(self._string_handler.find_words_with_same_vowel_and_consonant(self._text))
        sorted_words = sorted(self._string_handler.get_words(self._text), key=len, reverse=True)

        self._final_text += f'Original text:\n{self._text}\n' + \
                            f'Number of sentences in the text: {sentence_count}\n' + \
                            f'Number of declarative, interrogative, and exclamatory sentences: ' + \
                            f'{every_sentences_count}\n' + \
                            f'Average sentence length in characters: {average_word_length_in_sentence}\n' + \
                            f'Average word length in the text in characters: {average_word_length_in_text}\n' + \
                            f'Number of smileys: {smileys_count}\n' + \
                            f'Text with replaced spaces by char:\n{replaced_space_text}\n' + \
                            f'{guid_check_str} is guid? --->  {guid_check}\n' + \
                            f'Number of words with a length 3: {count_words_len_3}\n' + \
                            f'Words in which the number of vowels equals the number of consonants and their positions:\n{words_same_vc}\n' + \
                            f'Words sorted in descending order of length:\n{sorted_words}\n'

    @staticmethod
    def _file_info(info: zipfile.ZipInfo):
       

        return (f'Original size: {info.file_size} bytes. '
                f'\nCompressed size: {info.compress_size} bytes')
