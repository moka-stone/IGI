import matplotlib

matplotlib.use("Agg")
from matplotlib import pyplot as plt


class Plotter:
    @staticmethod
    def plt_bars(
        data,
        path=None,
        categories=None,
        show=False,
        x_label=None,
        y_label=None,
        title=None,
    ):
        plt.figure(figsize=(10, 6))
        plt.bar(range(len(data)), data)
        if x_label:
            plt.xlabel(x_label)
        if y_label:
            plt.ylabel(y_label)
        if categories:
            plt.xticks(range(len(data)), categories, rotation=15)
        if title:
            plt.title(title)
        if path:
            plt.savefig(path)
        if show:
            plt.show()
        plt.close("all")

    @staticmethod
    def plt_line(data, path=None, x_label=None, y_label=None, title=None):
        plt.figure(figsize=(10, 6))
        plt.plot(data)
        if x_label:
            plt.xlabel(x_label)
        if y_label:
            plt.ylabel(y_label)
        if title:
            plt.title(title)
        if path:
            plt.savefig(path)
        plt.close("all")
