from django.shortcuts import render, get_object_or_404, redirect
from .models import AboutCompany, News, FAQ, Contact, Vacancy, Review, PromoCode, CompanyMilestone, CompanyRequisites, CompanyCertificate, CompanyVideo, Partner
from django.contrib.auth.decorators import login_required
from .forms import ReviewForm
from django.contrib import messages
from django.views.generic import TemplateView
from django.utils import timezone


def index(request):
    last_news = News.objects.order_by("-created_at").first()
    partners = Partner.objects.all()
    return render(
        request,
        "home/index.html",
        {
            "last_news": last_news,
            "partners": partners,
        },
    )

def about(request):
    about_company = AboutCompany.objects.first()
    milestones = CompanyMilestone.objects.all()
    requisites = CompanyRequisites.objects.first()
    certificate = CompanyCertificate.objects.first()

    video = CompanyVideo.objects.first()
    embed_url = None
    video_file = None

    if video:
        if video.video_file:
            video_file = video.video_file
        elif video.video_url:
            url = video.video_url.strip()
            try:
                if "youtube.com/watch" in url:
                    import urllib.parse as _up
                    parsed = _up.urlparse(url)
                    qs = _up.parse_qs(parsed.query)
                    vid = qs.get("v", [None])[0]
                    if vid:
                        embed_url = f"https://www.youtube.com/embed/{vid}"
                elif "youtu.be/" in url:
                    vid = url.rstrip("/").split("/")[-1]
                    if vid:
                        embed_url = f"https://www.youtube.com/embed/{vid}"
                elif "vimeo.com/" in url:
                    vid = url.rstrip("/").split("/")[-1]
                    if vid and vid.isdigit():
                        embed_url = f"https://player.vimeo.com/video/{vid}"
                else:
                    embed_url = url
            except Exception:
                embed_url = video.video_url
    return render(
        request,
        "home/about.html",
        {
            "about": about_company,
            "milestones": milestones,
            "requisites": requisites,
            "certificate": certificate,
            "video_embed_url": embed_url,
            "video_file": video_file,
            "video": video,
        },
    )


def news_list(request):
    news = News.objects.all()
    return render(
        request,
        "home/news.html",
        {
            "news_list": news,
        },
    )


def news_detail(request, pk):
    news = get_object_or_404(News, pk=pk)
    return render(
        request,
        "home/news_detail.html",
        {
            "news": news,
        },
    )


def faq(request):
    faqs = FAQ.objects.all()
    return render(
        request,
        "home/faq.html",
        {
            "faqs": faqs,
        },
    )


def contacts(request):
    contacts = Contact.objects.all()
    return render(
        request,
        "home/contacts.html",
        {
            "contacts": contacts,
        },
    )


def vacancies(request):
    active_vacancies = Vacancy.objects.filter(is_active=True)
    return render(
        request,
        "home/vacancies.html",
        {
            "vacancies": active_vacancies,
        },
    )


def apply_vacancy(request, vacancy_id):
    if request.method == "POST":
        vacancy = get_object_or_404(Vacancy, id=vacancy_id)
        resume = request.POST.get("resume")

        # Здесь можно добавить логику сохранения отклика в базу данных
        # или отправки уведомления HR-менеджеру

        messages.success(request, "Ваш отклик успешно отправлен!")
        return redirect("home:vacancies")

    return redirect("home:vacancies")


# def reviews(request):
#     published_reviews = Review.objects.filter(is_published=True)
#     return render(
#         request,
#         "home/reviews.html",
#         {
#             "reviews": published_reviews,
#         },
#     )


# @login_required
# def add_review(request):
#     if request.method == "POST":
#         form = ReviewForm(request.POST)
#         if form.is_valid():
#             review = form.save(commit=False)
#             review.user = request.user
#             review.save()
#             messages.success(
#                 request, "Спасибо за ваш отзыв! Он будет опубликован после модерации."
#             )
#             return redirect("home:reviews")
#     else:
#         form = ReviewForm()
#     return render(request, "home/add_review.html", {"form": form})


def promocodes(request):
    PromoCode.objects.filter(valid_to__lt=timezone.now(), is_active=True).update(is_active=False)

    active_promocodes = PromoCode.objects.filter(is_active=True)
    inactive_promocodes = PromoCode.objects.filter(is_active=False)
    return render(
        request,
        "home/promocodes.html",
        {
            "promocodes": active_promocodes,
            "inactive_promocodes": inactive_promocodes,
        },
    )


class PolicyView(TemplateView):
    template_name = "home/policy.html"


def review_crud_list(request):
    reviews = Review.objects.all()
    form = ReviewForm()
    # Создание отзыва
    if request.method == "POST":
        if hasattr(request.user, "client"):
            form = ReviewForm(request.POST)
            if form.is_valid():
                review = form.save(commit=False)
                review.user = request.user
                review.is_published = True
                review.save()
                return redirect("home:review_crud_list")
        else:
            return redirect("users:login")
    
    return render(
        request, "home/review_crud_list.html", {"form": form, "reviews": reviews}
    )


@login_required
def review_crud_edit(request, pk):
    review = get_object_or_404(Review, pk=pk)
    if not (request.user == review.user or request.user.is_superuser):
        return redirect("home:review_crud_list")
    if request.method == "POST":
        form = ReviewForm(request.POST, instance=review)
        if form.is_valid():
            review = form.save(commit=False)
            review.is_published = True
            review.save()
            return redirect("home:review_crud_list")
    else:
        form = ReviewForm(instance=review)
    return render(
        request, "home/review_crud_edit.html", {"form": form, "review": review}
    )


@login_required
def review_crud_delete(request, pk):
    review = get_object_or_404(Review, pk=pk)
    if not (request.user == review.user or request.user.is_superuser):
        return redirect("home:review_crud_list")
    if request.method == "POST":
        review.delete()
        return redirect("home:review_crud_list")
    return render(request, "home/review_crud_delete.html", {"review": review})
