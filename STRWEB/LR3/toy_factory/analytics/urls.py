from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('price-list/', views.price_list, name='price_list'),
    path('customers-by-city/', views.clients_by_city, name='clients_by_city'),
    path('product-popularity/', views.popular_products, name='popular_products'),
    path('monthly-sales/', views.monthly_sales, name='monthly_sales'),
    path('yearly-report/', views.yearly_report, name='yearly_report'),
    path('sales-forecast/', views.monthly_sales, name='monthly_sales'),
    path('dashboard/', views.yearly_report, name='yearly_report'),
]