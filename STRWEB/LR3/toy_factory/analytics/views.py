from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count, Sum
from catalog.models import Product, Order, Client

def is_superuser(user):
    return user.is_superuser

@login_required
@user_passes_test(is_superuser)
def price_list(request):
    products = Product.objects.all().order_by('product_type', 'name')
    return render(request, 'analytics/price_list.html', {'products': products})

@login_required
@user_passes_test(is_superuser)
def clients_by_city(request):
    clients = Client.objects.values('city').annotate(count=Count('id'))
    return render(request, 'analytics/clients_by_city.html', {'clients': clients})

@login_required
@user_passes_test(is_superuser)
def popular_products(request):
    popular = Product.objects.annotate(
        order_count=Count('order')
    ).order_by('-order_count')[:5]
    
    unpopular = Product.objects.annotate(
        order_count=Count('order')
    ).order_by('order_count')[:5]
    
    return render(request, 'analytics/popular_products.html', {
        'popular': popular,
        'unpopular': unpopular
    })

@login_required
@user_passes_test(is_superuser)
def monthly_sales(request):
    sales = Order.objects.values('order_date__month').annotate(
        total=Count('id'),
        revenue=Sum('total_price')
    ).order_by('order_date__month')
    
    return render(request, 'analytics/monthly_sales.html', {'sales': sales})

@login_required
@user_passes_test(is_superuser)
def yearly_report(request):
    yearly_data = Order.objects.values('order_date__year').annotate(
        total_orders=Count('id'),
        total_revenue=Sum('total_price')
    ).order_by('order_date__year')
    
    return render(request, 'analytics/yearly_report.html', {'yearly_data': yearly_data})