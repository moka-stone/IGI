import logging
from datetime import datetime
import pandas as pd
from django.db.models import Count, Sum
from catalog.models import Order, Product
from users.models import Client
from django.db.models.functions import TruncMonth

logger = logging.getLogger(__name__)


class StatisticsCalculator:
    @staticmethod
    def get_clients_by_city():
        return Client.objects.values("city", "company_name").order_by(
            "city", "company_name"
        )

    @staticmethod
    def get_most_popular_product():
        return (
            Product.objects.annotate(total=Sum("order__quantity"))
            .order_by("-total")
            .first()
        )

    @staticmethod
    def get_least_popular_product():
        return (
            Product.objects.annotate(total=Sum("order__quantity"))
            .order_by("total")
            .first()
        )

    @staticmethod
    def get_monthly_sales():
        return (
            Order.objects.values(
                "product__name", "order_date__year", "order_date__month"
            )
            .annotate(total=Sum("quantity"))
            .order_by("product__name", "order_date__year", "order_date__month")
        )

    @staticmethod
    def get_yearly_income():
        return (
            Order.objects.values("order_date__year")
            .annotate(income=Sum("total_amount"))
            .order_by("order_date__year")
        )

    @staticmethod
    def get_sales_trend():
        # Группируем заказы по месяцам и суммируем total_amount
        sales = (
            Order.objects.annotate(month=TruncMonth("order_date"))
            .values("month")
            .annotate(total=Sum("total_amount"))
            .order_by("month")
        )
        # Возвращаем список кортежей (месяц, сумма)
        return [(item["month"], item["total"]) for item in sales]
