from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import UserRegistrationForm, UserUpdateForm, ClientUpdateForm
from catalog.models import Order
from .models import Client
from django.contrib.auth import logout
from catalog.utils.timezone_service import TimezoneService


def register(request):
    if request.method == "POST":
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.role = "client"
            user.save()
            Client.objects.create(
                user=user,
                company_name=form.cleaned_data["company_name"],
                city=form.cleaned_data["city"],
                address=form.cleaned_data["address"],
            )
            messages.success(request, "Регистрация успешна! Теперь вы можете войти.")
            return redirect("login")
    else:
        form = UserRegistrationForm()
    return render(
        request,
        "users/register.html",
        {
            "form": form,
        },
    )


@login_required
def profile(request):
    if request.method == "POST":
        user_form = UserUpdateForm(request.POST, instance=request.user)
        if hasattr(request.user, "client"):
            client_form = ClientUpdateForm(request.POST, instance=request.user.client)
            if user_form.is_valid() and client_form.is_valid():
                user_form.save()
                client_form.save()
                messages.success(request, "Профиль успешно обновлен!")
                return redirect("users:profile")
        else:
            if user_form.is_valid():
                user_form.save()
                messages.success(request, "Профиль успешно обновлен!")
                return redirect("users:profile")
    else:
        user_form = UserUpdateForm(instance=request.user)
        if hasattr(request.user, "client"):
            client_form = ClientUpdateForm(instance=request.user.client)
        else:
            client_form = None

    return render(
        request,
        "users/profile.html",
        {
            "user_form": user_form,
            "client_form": client_form,
            "user_timezone": TimezoneService.get_timezone(request),
        },
    )


@login_required
def logout_view(request):
    logout(request)
    messages.success(request, "Вы успешно вышли из системы!")
    return redirect("home:index")
