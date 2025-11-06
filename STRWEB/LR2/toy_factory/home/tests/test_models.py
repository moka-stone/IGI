from django.test import TestCase
from home.models import AboutCompany, News, FAQ, Contact, Vacancy, Review, PromoCode
from users.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from datetime import datetime, timedelta


class HomeModelsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass",
            role="client",
            phone_number="+375(29)123-45-67",
        )

    def test_about_company_str(self):
        about = AboutCompany.objects.create(text="Текст о компании")
        self.assertIn("Текст о компании", str(about))

    def test_news_str(self):
        news = News.objects.create(
            title="Заголовок", summary="Кратко", content="Полный текст"
        )
        self.assertEqual(str(news), "Заголовок")

    def test_faq_str(self):
        faq = FAQ.objects.create(question="Вопрос?", answer="Ответ.")
        self.assertEqual(str(faq), "Вопрос?")

    def test_contact_str(self):
        photo = SimpleUploadedFile(
            "test.jpg", b"filecontent", content_type="image/jpeg"
        )
        contact = Contact.objects.create(
            name="Иван",
            position="Менеджер",
            photo=photo,
            description="Описание",
            phone="+375(29)123-45-67",
            email="ivan@example.com",
        )
        self.assertEqual(str(contact), "Иван")

    def test_vacancy_str(self):
        vacancy = Vacancy.objects.create(
            title="Программист", description="desc", requirements="req"
        )
        self.assertEqual(str(vacancy), "Программист")

    def test_review_str(self):
        review = Review.objects.create(user=self.user, text="Отлично!", rating=5)
        self.assertIn("testuser", str(review))

    def test_promocode_str(self):
        now = datetime.now()
        code = PromoCode.objects.create(
            code="PROMO10",
            discount=10,
            valid_from=now,
            valid_to=now + timedelta(days=10),
            is_active=True,
        )
        self.assertIn("PROMO10", str(code))

    def test_example(self):
        self.assertTrue(True) 
