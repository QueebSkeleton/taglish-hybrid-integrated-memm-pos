# Generated by Django 4.1.5 on 2023-01-17 08:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tagger', '0004_annotationchangelog_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='annotatedsentence',
            name='is_validated',
            field=models.BooleanField(default=False),
        ),
    ]
