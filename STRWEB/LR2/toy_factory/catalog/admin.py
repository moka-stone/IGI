from django.contrib import admin
from django.db.models import Sum, Count
from django.utils.html import format_html
from .models import (
    ProductCategory,
    ProductModel,
    Product,
    Order,
    PickupPoint,
)


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "description"]
    search_fields = ["name"]


@admin.register(ProductModel)
class ProductModelAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "product_code", "category", "price", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["name", "product_code"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "client",
        "product",
        "quantity",
        "order_date",
        "completion_date",
        "status",
        "total_amount",
    ]
    list_filter = ["status", "order_date", "completion_date"]
    search_fields = ["client__company_name", "product__name"]

    def get_monthly_sales(self, request):
        return (
            Order.objects.filter(status="completed")
            .values("order_date__month")
            .annotate(total_sales=Sum("total_amount"))
            .order_by("order_date__month")
        )


@admin.register(PickupPoint)
class PickupPointAdmin(admin.ModelAdmin):
    list_display = ["name", "address", "phone", "image"]
    search_fields = ["name", "address"]
