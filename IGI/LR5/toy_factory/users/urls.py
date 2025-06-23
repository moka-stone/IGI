from django.urls import re_path
from django.contrib.auth import views as auth_views
from . import views

app_name = "users"

urlpatterns = [
    re_path(r"^register/$", views.register, name="register"),
    re_path(r"^profile/$", views.profile, name="profile"),
    re_path(r"^orders/$", views.orders, name="orders"),
    re_path(r"^logout/$", views.logout_view, name="logout"),
    re_path(
        r"^login/$",
        auth_views.LoginView.as_view(template_name="users/login.html"),
        name="login",
    ),
]
