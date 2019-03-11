# -*- coding: utf-8 -*-
# Generated by Django 1.11.20 on 2019-02-28 17:00
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Rua',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=400)),
                ('codlog', models.CharField(max_length=10)),
                ('the_geom', django.contrib.gis.db.models.fields.PointField(srid=4326)),
            ],
        ),
    ]
