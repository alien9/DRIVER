# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.gis.db import models as geo_models
from whoosh.fields import Schema, TEXT, ID, STORED, NUMERIC


class Rua(models.Model):
    nome=models.CharField(max_length=400)
    codlog=models.CharField(max_length=10, null=True)
    the_geom=geo_models.PointField(srid=4326)


def get_schema():
    return Schema(nome=TEXT(stored=True),id=ID(stored=True),lat=NUMERIC(stored=True), lon=NUMERIC(stored=True))

# Create your models here.
