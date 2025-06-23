from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Client


class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(
        widget=forms.EmailInput(
            attrs={"class": "form-control", "placeholder": "example@email.com"}
        )
    )
    username = forms.CharField(
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Имя пользователя"}
        )
    )
    company_name = forms.CharField(
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Название компании"}
        )
    )
    city = forms.CharField(
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Город"})
    )
    address = forms.CharField(
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Адрес"})
    )
    phone_number = forms.CharField(
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "+375(29)XXX-XX-XX"}
        )
    )
    date_of_birth = forms.DateField(
        widget=forms.DateInput(attrs={"class": "form-control", "type": "date"}),
        label="Дата рождения",
    )
    password1 = forms.CharField(
        widget=forms.PasswordInput(
            attrs={"class": "form-control", "placeholder": "Пароль"}
        )
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(
            attrs={"class": "form-control", "placeholder": "Подтверждение пароля"}
        )
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "company_name",
            "city",
            "address",
            "phone_number",
            "date_of_birth",
            "password1",
            "password2",
        ]

    def clean_date_of_birth(self):
        dob = self.cleaned_data["date_of_birth"]
        from datetime import date

        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < 18:
            raise forms.ValidationError(
                "Регистрация доступна только для пользователей 18+"
            )
        return dob


class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField(widget=forms.EmailInput(attrs={"class": "form-control"}))
    username = forms.CharField(widget=forms.TextInput(attrs={"class": "form-control"}))
    company_name = forms.CharField(
        widget=forms.TextInput(attrs={"class": "form-control"})
    )
    phone_number = forms.CharField(
        widget=forms.TextInput(attrs={"class": "form-control"})
    )

    class Meta:
        model = User
        fields = ["username", "email", "company_name", "phone_number"]


class ClientUpdateForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ["company_name", "city", "address"]
        widgets = {
            "company_name": forms.TextInput(attrs={"class": "form-control"}),
            "city": forms.TextInput(attrs={"class": "form-control"}),
            "address": forms.TextInput(attrs={"class": "form-control"}),
        }
