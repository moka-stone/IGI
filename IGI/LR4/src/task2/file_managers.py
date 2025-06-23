import os
import zipfile


class FileManager(object):

    @staticmethod
    def load(filename: str):
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()

    @staticmethod
    def save(data, filename: str):
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(data)


class ZipManager(object):

    @staticmethod
    def save(filename: str, archive_name: str):
        with zipfile.ZipFile(archive_name, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.write(filename, arcname=os.path.basename(filename))

    @staticmethod
    def load(archive_name: str, filename: str):
        with zipfile.ZipFile(archive_name, 'r', zipfile.ZIP_DEFLATED) as zf:
            return zf.read(filename).decode('utf-8')

    @staticmethod
    def file_info(archive_name: str, filename: str):
        with zipfile.ZipFile(archive_name, 'r', zipfile.ZIP_DEFLATED) as zf:
            return zf.getinfo(filename)
