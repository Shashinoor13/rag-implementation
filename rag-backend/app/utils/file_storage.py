import os
from werkzeug.datastructures import FileStorage

def save_txt_file(file: FileStorage, upload_dir='uploaded_txts'):
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    file.save(file_path)
    return file_path 