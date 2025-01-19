import json
import os


class File(object):
    instances = {}

    def __new__(cls, path, loader=None, writer=None):
        if path in cls.instances:
            cls.instances[path].exist = True
            return cls.instances[path]

        cls.instances[path] = temp_inst = super(File, cls).__new__(cls)
        temp_inst.exist = False
        return temp_inst

    def __init__(self, path, loader=None, writer=None):
        if not self.exist:
            self.path = path
            self.modified = None
            self.loader = loader
            self.writer = writer
            self.old_data = None
            self._data = None
            self.extension = os.path.splitext(path)[1]

    def content(self):
        if os.path.getmtime(self.path) != self.modified:
            temp = self._data
            if self.loader is not None:
                self._data = self.loader()
            else:
                if self.extension == ".json":
                    with open(self.path, "r") as f:
                        self._data = json.load(f)
                else:
                    with open(self.path, "r") as f:
                        self._data = f.read()
            self.modified = os.path.getmtime(self.path)
            self.old_data = temp
        return self._data

    def set_content(self, data) -> None:
        if self.writer is not None:
            self.writer(data)
        else:
            if self.extension == ".json":
                with open(self.path, "w") as f:
                    json.dump(data, f)
            else:
                with open(self.path, "w") as f:
                    f.write(data)

        self.old_data = self._data
        self._data = data
        self.modified = os.path.getmtime(self.path)

    def update(self):
        self.set_content(self.content)

    content = property(content, set_content)
