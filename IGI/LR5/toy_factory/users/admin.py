from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Employee, Client

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role')
    list_filter = ('role', 'is_active')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Персональная информация', {'fields': ('first_name', 'last_name', 'email', 'phone_number')}),
        ('Права доступа', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'role', 'phone_number'),
        }),
    )
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('user', 'hire_date')
    list_filter = ('hire_date',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    filter_horizontal = ('clients',)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'user', 'city')
    list_filter = ('city',)
    search_fields = ('company_name', 'user__username', 'city', 'address')
