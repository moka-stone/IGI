from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from datetime import date
from django.db.models.signals import post_save
from django.dispatch import receiver


class User(AbstractUser):
    ROLE_CHOICES = {
        "employee": "Сотрудник",
        "client": "Клиент",
        "admin": "Администратор",
    }
    phone_regex = RegexValidator(
        regex=r"^\+375\d{9}$",
        message="Формат номера: +375XXXXXXXXX",
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=13, validators=[phone_regex])
    created_at = models.DateTimeField(auto_now_add=True)
    company_name = models.CharField(max_length=200, blank=True)
    date_of_birth = models.DateField(
        null=True, blank=True, verbose_name="Дата рождения"
    )

    def __str__(self):
        if self.role == "client":
            return f"{self.company_name} ({self.get_role_display()})"
        return f"{self.username} ({self.get_role_display()})"


class Client(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    address = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        if not self.company_name:
            self.company_name = self.user.company_name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.company_name


class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    hire_date = models.DateField()
    clients = models.ManyToManyField(Client, blank=True)

    def __str__(self):
        return f"{self.user.username}"


@receiver(post_save, sender=Employee)
def convert_client_to_employee(sender, instance, created, **kwargs):
    user = instance.user
    if user.role != "employee":
        user.role = "employee"
        user.save()
    # Удаляем Client, если был
    if hasattr(user, "client"):
        user.client.delete()
