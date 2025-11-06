from django.contrib import admin
from .models import AboutCompany, News, FAQ, Contact, Vacancy, Review, PromoCode, Partner, CompanyMilestone, CompanyRequisites, CompanyCertificate, CompanyVideo

@admin.register(AboutCompany)
class AboutCompanyAdmin(admin.ModelAdmin):
    list_display = ('text',)


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'content')


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'added_date')
    list_filter = ('added_date',)
    search_fields = ('question', 'answer')


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'phone', 'email')
    search_fields = ('name', 'position', 'phone', 'email')


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'salary_from', 'salary_to')
    list_filter = ('is_active',)
    search_fields = ('title', 'description', 'requirements')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'created_at', 'is_published')
    list_filter = ('rating', 'is_published', 'created_at')
    search_fields = ('user__username', 'text')

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount', 'valid_from', 'valid_to', 'is_active')
    list_filter = ('is_active', 'valid_from', 'valid_to')
    search_fields = ('code',)

@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'logo', 'url')
    search_fields = ('name',)

@admin.register(CompanyMilestone)
class CompanyMilestoneAdmin(admin.ModelAdmin):
    list_display = ('year', 'title', 'description')
    list_filter = ('year',)
    search_fields = ('year',)

@admin.register(CompanyRequisites)
class CompanyRequisitesAdmin(admin.ModelAdmin):
    list_display = ('text', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('created_at', 'updated_at')

@admin.register(CompanyCertificate)
class CompanyCertificateAdmin(admin.ModelAdmin):
    list_display = ('text','created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('created_at', 'updated_at')

@admin.register(CompanyVideo)
class CompanyVideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'video_url','video_file','description', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title',)
