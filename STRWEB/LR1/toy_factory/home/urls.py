from django.urls import re_path
from . import views

app_name = "home"

urlpatterns = [
    re_path(r"^$", views.index, name="index"),
    re_path(r"^about/$", views.about, name="about"),
    re_path(r"^news/$", views.news_list, name="news"),
    re_path(r"^news/(?P<pk>\d+)/$", views.news_detail, name="news_detail"),
    re_path(r"^faq/$", views.faq, name="faq"),
    re_path(r"^contacts/$", views.contacts, name="contacts"),
    re_path(r"^vacancies/$", views.vacancies, name="vacancies"),
    # re_path(r"^reviews/$", views.reviews, name="reviews"),
    # re_path(r"^reviews/add/$", views.add_review, name="add_review"),
    re_path(r"^promocodes/$", views.promocodes, name="promocodes"),
    re_path(r"^policy/$", views.PolicyView.as_view(), name="policy"),
    re_path(r"^review-crud/$", views.review_crud_list, name="review_crud_list"),
    re_path(
        r"^review-crud/edit/(?P<pk>\d+)/$",
        views.review_crud_edit,
        name="review_crud_edit",
    ),
    re_path(
        r"^review-crud/delete/(?P<pk>\d+)/$",
        views.review_crud_delete,
        name="review_crud_delete",
    ),
]
