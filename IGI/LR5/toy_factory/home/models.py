from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator

class AboutCompany(models.Model):
    text = models.TextField(help_text="Введите текст о компании")

    def __str__(self):
        return f"{self.text[:40]}..."

    class Meta:
        verbose_name = "О компании"
        verbose_name_plural = "О компании"


class News(models.Model):
    title = models.CharField(max_length=200)
    summary = models.TextField()
    content = models.TextField()
    image = models.ImageField(upload_to="news/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Новость"
        verbose_name_plural = "Новости"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class FAQ(models.Model):
    question = models.CharField(max_length=200)
    answer = models.TextField()
    added_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.question

    class Meta:
        verbose_name = "FAQ"
        verbose_name_plural = "FAQ"


class Contact(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    photo = models.ImageField(upload_to="contacts/")
    description = models.TextField()
    phone = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r"^\+375\(29\)\d{3}-\d{2}-\d{2}$",
                message="Формат номера: +375(29)XXX-XX-XX",
            )
        ],
    )
    email = models.EmailField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Контакт"
        verbose_name_plural = "Контакты"


class Vacancy(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField()
    salary_from = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    salary_to = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Вакансия"
        verbose_name_plural = "Вакансии"


class Review(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    text = models.TextField()
    rating = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return f"Отзыв от {self.user.username}"

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ["-created_at"]
        
class PromoCode(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount = models.IntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ]
    )
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.discount}%)"

    class Meta:
        verbose_name = "Промокод"
        verbose_name_plural = "Промокоды"