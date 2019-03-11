from django.core.management.base import BaseCommand

from geocoder.tasks import index


class Command(BaseCommand):
    help = 'Find duplicates'

    def handle(self, *args, **options):
        index(self)
