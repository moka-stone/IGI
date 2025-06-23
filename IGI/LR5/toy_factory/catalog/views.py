from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import Product, ProductCategory, Order, PickupPoint
import logging
from django.views.generic import ListView, DetailView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.forms import formset_factory
from django.db import transaction
from django.db.models import Sum, F
from django.utils import timezone
from users.models import Employee, Client
from datetime import date
from django.conf import settings
from .utils.statistics_calculator import StatisticsCalculator
from .utils.plotter import Plotter
from .utils.timezone_service import TimezoneService
import os

logger = logging.getLogger(__name__)


def product_list(request, category_id=None):
    products = Product.objects.filter(is_active=True)
    categories = ProductCategory.objects.all()

    if category_id:
        products = products.filter(category_id=category_id)

    # Фильтрация по цене
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")
    if min_price:
        products = products.filter(price__gte=min_price)
    if max_price:
        products = products.filter(price__lte=max_price)

    # Поиск
    query = request.GET.get("q")
    if query:
        products = products.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )

    return render(
        request,
        "catalog/product_list.html",
        {
            "products": products,
            "categories": categories,
            "current_category": category_id,
        },
    )


def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return render(
        request,
        "catalog/product_detail.html",
        {
            "product": product,
        },
    )


def get_cart(request):
    cart = request.session.get("cart", {})
    return cart


def cart_add(request, product_id):
    cart = get_cart(request)
    product = get_object_or_404(Product, id=product_id)

    if str(product_id) in cart:
        cart[str(product_id)]["quantity"] += 1
    else:
        cart[str(product_id)] = {"quantity": 1, "price": str(product.price)}

    request.session["cart"] = cart
    messages.success(request, f'Товар "{product.name}" добавлен в корзину')
    return redirect("catalog:product_list")


def cart_remove(request, product_id):
    cart = get_cart(request)
    if str(product_id) in cart:
        del cart[str(product_id)]
        request.session["cart"] = cart
        messages.success(request, "Товар удален из корзины")
    return redirect("catalog:cart_detail")


def cart_detail(request):
    cart = get_cart(request)
    cart_items = []
    total_price = 0

    for product_id, item in cart.items():
        product = get_object_or_404(Product, id=product_id)
        quantity = item["quantity"]
        price = float(item["price"])
        total = quantity * price
        total_price += total

        cart_items.append(
            {"product": product, "quantity": quantity, "price": price, "total": total}
        )

    return render(
        request,
        "catalog/cart_detail.html",
        {"cart_items": cart_items, "total_price": total_price},
    )


@login_required
def order_list(request):
    if hasattr(request.user, "employee"):
        employee = request.user.employee
        orders = Order.objects.filter(client__in=employee.clients.all()).select_related(
            "client", "product"
        )
    else:
        orders = Order.objects.filter(client=request.user.client).select_related(
            "product"
        )
    return render(request, "catalog/order_list.html", {"orders": orders})


@login_required
def order_detail(request, order_id):
    if hasattr(request.user, "employee"):
        employee = request.user.employee
        order = get_object_or_404(Order, id=order_id, client__in=employee.clients.all())
        if request.method == "POST" and "mark_as_sold" in request.POST:
            order.status = "sold"
            order.completion_date = timezone.now()
            order.save()
            messages.success(request, "Заказ отмечен как проданный")
            return redirect("catalog:order_list")
    else:
        order = get_object_or_404(Order, id=order_id, client=request.user.client)
    return render(request, "catalog/order_detail.html", {"order": order})


@login_required
def create_order(request):
    if not hasattr(request.user, "client"):
        messages.error(request, "Только клиенты могут создавать заказы")
        return redirect("home")

    if request.method == "POST":
        product_id = request.POST.get("product")
        quantity = request.POST.get("quantity")
        try:
            product = Product.objects.get(id=product_id)
            # Проверка на повторный заказ в течение 30 дней
            last_order = (
                Order.objects.filter(client=request.user.client, product=product)
                .order_by("-order_date")
                .first()
            )
            if last_order and (timezone.now().date() - last_order.order_date).days < 30:
                messages.error(
                    request, "Вы уже заказывали этот товар менее 30 дней назад!"
                )
                return redirect("catalog:create_order")
            order = Order.objects.create(
                client=request.user.client,
                product=product,
                quantity=quantity,
                total_amount=int(quantity) * product.price,
            )
            messages.success(request, "Заказ успешно создан")
            return redirect("catalog:order_detail", order_id=order.id)
        except Exception as e:
            messages.error(request, f"Ошибка при создании заказа: {str(e)}")
    products = Product.objects.filter(is_active=True)
    return render(request, "catalog/create_order.html", {"products": products})


@login_required
def employee_dashboard(request):
    if not hasattr(request.user, "employee"):
        messages.error(request, "Доступ запрещен")
        return redirect("home")

    employee = request.user.employee
    assigned_clients = employee.clients.all()

    # Статистика по заказам назначенных клиентов
    orders = Order.objects.filter(client__in=assigned_clients)
    total_orders = orders.count()
    new_orders = orders.filter(status="new").count()
    completed_orders = orders.filter(status="sold").count()

    # Топ клиентов по сумме заказов
    top_clients = assigned_clients.annotate(
        total_orders=Sum("order__total_amount")
    ).order_by("-total_orders")[:5]

    # Последние заказы
    recent_orders = orders.select_related("client").order_by("-order_date")[:10]

    return render(
        request,
        "catalog/employee_dashboard.html",
        {
            "total_orders": total_orders,
            "new_orders": new_orders,
            "completed_orders": completed_orders,
            "top_clients": top_clients,
            "recent_orders": recent_orders,
        },
    )


class ProductListView(ListView):
    model = Product
    template_name = "catalog/product_list.html"
    paginate_by = 9
    ordering = "-price"

    def get_queryset(self):
        logger.debug("Fetching queryset for ProductListView")
        queryset = Product.objects.select_related("category")

        # Поиск по названию и описанию
        search_query = self.request.GET.get("q")
        if search_query:
            logger.debug(f"Filtering by search query: {search_query}")
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(description__icontains=search_query)
                | Q(category__name__icontains=search_query)
            )

        # Фильтрация по категории
        category_id = self.request.GET.get("category")
        if category_id:
            logger.debug(f"Filtering by category_id: {category_id}")
            queryset = queryset.filter(category_id=category_id)

        # Фильтрация по цене
        min_price = self.request.GET.get("min_price")
        max_price = self.request.GET.get("max_price")

        if min_price:
            logger.debug(f"Filtering by min_price: {min_price}")
            queryset = queryset.filter(price__gte=min_price)

        if max_price:
            logger.debug(f"Filtering by max_price: {max_price}")
            queryset = queryset.filter(price__lte=max_price)

        # Сортировка
        sort = self.request.GET.get("sort")
        if sort:
            logger.debug(f"Sorting by: {sort}")
            sort_options = {
                "price_asc": "price",
                "price_desc": "-price",
                "name_asc": "name",
                "name_desc": "-name",
            }
            if sort in sort_options:
                queryset = queryset.order_by(sort_options[sort])
            else:
                logger.warning(f"Invalid sort option: {sort}")
                queryset = queryset.order_by(self.ordering)
        else:
            queryset = queryset.order_by(self.ordering)

        logger.info("ProductListView queryset prepared")
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["categories"] = ProductCategory.objects.all()
        context["current_category"] = self.request.GET.get("category", "")
        context["search_query"] = self.request.GET.get("q", "")
        context["current_sort"] = self.request.GET.get("sort")
        context["min_price"] = self.request.GET.get("min_price", "")
        context["max_price"] = self.request.GET.get("max_price", "")
        return context


class ProductDetailView(DetailView):
    model = Product
    template_name = "catalog/product_detail.html"
    context_object_name = "product"

    def get_context_data(self, **kwargs):
        logger.debug(
            f"Preparing context for ProductDetailView, product_id={self.kwargs.get('pk')}"
        )
        context = super().get_context_data(**kwargs)
        # Добавляем похожие товары той же категории
        context["related_products"] = Product.objects.filter(
            category=self.object.category
        ).exclude(id=self.object.id)[:4]
        logger.info("ProductDetailView context prepared")
        return context


def pickup_points_map(request):
    pickup_points = PickupPoint.objects.filter(is_active=True)
    return render(
        request,
        "catalog/pickup_points_map.html",
        {"pickup_points": pickup_points},
    )


class StatisticsView(LoginRequiredMixin, TemplateView):
    template_name = "statistics.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logger = logging.getLogger(__name__)
        logger.info(
            f"Preparing context for StatisticsView, user={self.request.user.username}"
        )

        user_timezone = TimezoneService.get_timezone(self.request)
        context["user_timezone"] = user_timezone

        clients_by_city = StatisticsCalculator.get_clients_by_city()
        most_popular = StatisticsCalculator.get_most_popular_product()
        least_popular = StatisticsCalculator.get_least_popular_product()
        monthly_sales = StatisticsCalculator.get_monthly_sales()
        yearly_income = StatisticsCalculator.get_yearly_income()
        sales_trend = StatisticsCalculator.get_sales_trend()

        # Пути для графиков
        image_paths = {
            "monthly_sales": f"{settings.MEDIA_URL}monthly_sales.jpg",
            "yearly_income": f"{settings.MEDIA_URL}yearly_income.jpg",
            "sales_trend": f"{settings.MEDIA_URL}sales_trend.jpg",
        }

        # Построение графиков (всегда пересоздаём)
        dj_settings = settings
        if monthly_sales:
            Plotter.plt_bars(
                [item["total"] for item in monthly_sales],
                path=os.path.join(dj_settings.MEDIA_ROOT, "monthly_sales.jpg"),
                categories=[
                    f"{item['product__name']} {item['order_date__year']}-{item['order_date__month']}"
                    for item in monthly_sales
                ],
                x_label="Игрушка/Месяц",
                y_label="Объем продаж",
                title="Ежемесячный объем продаж игрушек",
            )
        if yearly_income:
            Plotter.plt_bars(
                [item["income"] for item in yearly_income],
                path=os.path.join(dj_settings.MEDIA_ROOT, "yearly_income.jpg"),
                categories=[str(item["order_date__year"]) for item in yearly_income],
                x_label="Год",
                y_label="Поступления",
                title="Годовой отчет поступлений от продаж",
            )
        if sales_trend:
            Plotter.plt_line(
                [total for month, total in sales_trend],
                path=os.path.join(dj_settings.MEDIA_ROOT, "sales_trend.jpg"),
                x_label="Месяц",
                y_label="Сумма продаж",
                title="Тренд продаж",
            )

        context.update(
            {
                "clients_by_city": clients_by_city,
                "most_popular": most_popular,
                "least_popular": least_popular,
                "monthly_sales": monthly_sales,
                "yearly_income": yearly_income,
                "sales_trend": sales_trend,
                "chart_images": image_paths,
            }
        )
        return context
