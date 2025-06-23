from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import Client, Employee
from datetime import date
from django.core.exceptions import ValidationError


class ProductCategory(models.Model):
    name = models.CharField(max_length=200, help_text="Введите название категории")
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Категория товара"
        verbose_name_plural = "Категории товаров"


class ProductModel(models.Model):
    name = models.CharField(max_length=200, help_text="Введите название модели")
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Модель товара"
        verbose_name_plural = "Модели товаров"


class Product(models.Model):
    name = models.CharField(max_length=200)
    product_code = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True)
    model = models.ForeignKey(ProductModel, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)]
    )
    min_order_quantity = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(100)],
        help_text="Минимальное количество для оптового заказа",
    )
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.product_code})"

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"


class Order(models.Model):
    STATUS_CHOICES = [
        ("new", "Новый"),
        ("sold", "Продан"),
    ]

    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, verbose_name="Компания-заказчик"
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, null=True, verbose_name="Продукция"
    )
    quantity = models.PositiveIntegerField(verbose_name="Количество", default=100)
    order_date = models.DateField(auto_now_add=True, verbose_name="Дата заказа")
    completion_date = models.DateField(
        null=True, blank=True, verbose_name="Дата выполнения заказа"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Заказ {self.id} от {self.order_date} — {self.product.name} ({self.quantity})"

    class Meta:
        unique_together = ("client", "product")
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ["-order_date"]


class PickupPoint(models.Model):
    name = models.CharField(max_length=200, verbose_name="Название")
    address = models.CharField(max_length=255, verbose_name="Адрес")
    working_hours = models.CharField(max_length=100, verbose_name="Часы работы")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    is_active = models.BooleanField(default=True, verbose_name="Активная точка")
    image = models.ImageField(
        upload_to="pickup_points/", blank=True, null=True, verbose_name="Фото"
    )

    def __str__(self):
        return f"{self.name} ({self.address})"

    class Meta:
        verbose_name = "Пункт самовывоза"
        verbose_name_plural = "Пункты самовывоза"
