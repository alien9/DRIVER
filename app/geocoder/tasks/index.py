from celery import shared_task
from geocoder.models import *
import os
from whoosh.index import create_in
import sys



@shared_task(track_started=True)
def index(root):
    '''
    Schema definition: title(name of file), path(as ID), content(indexed
    but not stored),textdata (stored text content)
    '''
    schema = get_schema()
    if not os.path.exists("indexdir"):
        os.mkdir("indexdir")

    # Creating a index writer to add document as per schema
    ix = create_in("indexdir",schema)
    writer = ix.writer()
    for rua in Rua.objects.all():
        if len(rua.nome)>2:
            writer.add_document(nome=unicode(rua.nome),id=unicode(rua.id),lat=rua.the_geom.y,lon=rua.the_geom.x)
            print "added %s"% rua.nome
    writer.commit()
