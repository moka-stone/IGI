from django.urls import re_path, path
from . import views

app_name = "catalog"

urlpatterns = [
    re_path(r"^$", views.ProductListView.as_view(), name="product_list"),
    re_path(
        r"^product/(?P<pk>\d+)/$",
        views.ProductDetailView.as_view(),
        name="product_detail",
    ),
    re_path(r"^pickup-points/$", views.pickup_points_map, name="pickup_points"),
    re_path(r"^orders/$", views.order_list, name="order_list"),
    re_path(r"^orders/create/$", views.create_order, name="create_order"),
    re_path(r"^orders/(?P<order_id>\d+)/$", views.order_detail, name="order_detail"),
    re_path(
        r"^employee/dashboard/$", views.employee_dashboard, name="employee_dashboard"
    ),
    re_path(r"^statistics/$", views.StatisticsView.as_view(), name="statistics"),
    path("orders/<int:order_id>/payment/", views.payment_view, name="payment"),
]
