# -*- coding: utf-8 -*-
# Generated by Django 1.11.20 on 2019-02-28 17:24
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geocoder', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rua',
            name='codlog',
            field=models.CharField(max_length=10, null=True),
        ),
    ]
