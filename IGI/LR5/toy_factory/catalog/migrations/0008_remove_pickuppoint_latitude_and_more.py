# Generated by Django 5.2.1 on 2025-06-23 19:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0007_alter_order_unique_together_remove_order_month'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='pickuppoint',
            name='latitude',
        ),
        migrations.RemoveField(
            model_name='pickuppoint',
            name='longitude',
        ),
        migrations.AddField(
            model_name='pickuppoint',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='pickup_points/', verbose_name='Фото'),
        ),
    ]
