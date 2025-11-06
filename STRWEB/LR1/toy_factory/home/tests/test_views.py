from django.test import TestCase, Client as DjangoClient
from django.urls import reverse
from users.models import User
from home.models import News, AboutCompany, FAQ, Review, PromoCode
from datetime import datetime, timedelta


class HomeViewsTest(TestCase):
    def setUp(self):
        self.client = DjangoClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass",
            role="client",
            phone_number="+375(29)123-45-67",
        )

    def test_index_view(self):
        News.objects.create(title="Новость", summary="Кратко", content="Текст")
        response = self.client.get(reverse("home:index"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("last_news", response.context)

    def test_about_view(self):
        AboutCompany.objects.create(text="О компании")
        response = self.client.get(reverse("home:about"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("about", response.context)

    def test_news_list_view(self):
        response = self.client.get(reverse("home:news"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("news_list", response.context)

    def test_reviews_view(self):
        Review.objects.create(user=self.user, text="Отзыв", rating=5, is_published=True)
        response = self.client.get(reverse("home:reviews"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("reviews", response.context)

    def test_add_review_get(self):
        self.client.login(username="testuser", password="testpass")
        response = self.client.get(reverse("home:add_review"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("form", response.context)

    def test_add_review_post(self):
        self.client.login(username="testuser", password="testpass")
        data = {"text": "Очень хороший товар!", "rating": 5}
        response = self.client.post(reverse("home:add_review"), data)
        self.assertEqual(response.status_code, 302)  # redirect
        self.assertTrue(
            Review.objects.filter(text="Очень хороший товар!", user=self.user).exists()
        )

    def test_promocodes_view(self):
        now = datetime.now()
        PromoCode.objects.create(
            code="PROMO10",
            discount=10,
            valid_from=now,
            valid_to=now + timedelta(days=10),
            is_active=True,
        )
        response = self.client.get(reverse("home:promocodes"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("promocodes", response.context)
