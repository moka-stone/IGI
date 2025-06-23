from abc import abstractmethod, ABC


class ITask(ABC):
    @abstractmethod
    def run(self): ...