from django.test import TestCase
from home.forms import ReviewForm
from users.models import User


class HomeFormsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass",
            role="client",
            phone_number="+375(29)123-45-67",
        )

    def test_form_fields(self):
        form = ReviewForm()
        self.assertEqual(list(form.fields.keys()), ["text", "rating"])

    def test_valid_data(self):
        form = ReviewForm(data={"text": "Очень хороший товар!", "rating": 5})
        self.assertTrue(form.is_valid())

    def test_invalid_rating(self):
        form = ReviewForm(data={"text": "Очень хороший товар!", "rating": 10})
        self.assertFalse(form.is_valid())
        self.assertIn("rating", form.errors)

    def test_save_review(self):
        form = ReviewForm(data={"text": "Очень хороший товар!", "rating": 5})
        self.assertTrue(form.is_valid())
        review = form.save(commit=False)
        review.user = self.user
        review.save()
        self.assertEqual(review.text, "Очень хороший товар!")
        self.assertEqual(review.rating, 5)

    def test_example(self):
        self.assertTrue(True) 
