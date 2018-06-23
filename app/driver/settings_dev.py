"""
Django settings for DRIVER project development

Override base settings.py

"""

from driver.settings import *

# The only difference (currently) between this and the production settings is
# that CONN_MAX_AGE = 0.
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('DRIVER_DB_NAME', 'postgres'),
        'HOST': os.environ.get('DRIVER_DB_HOST', 'localhost'),
        'PORT': os.environ.get('DRIVER_DB_PORT', 5432),
        'USER': os.environ.get('DRIVER_DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DRIVER_DB_PASSWORD', 'postgres'),
        'CONN_MAX_AGE': 0,  # in seconds
        'OPTIONS': {
            'sslmode': 'require'
        }
    }
}
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'noreply.vidasegura@gmail.com'
EMAIL_HOST_PASSWORD = 'test432pest'
EMAIL_PORT = 587


class DisableCSRFMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        setattr(request, '_dont_enforce_csrf_checks', True)
        response = self.get_response(request)
        return response


class DisableCSRF(object):
    def process_request(self, request):
        setattr(request, '_dont_enforce_csrf_checks', True)


MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'driver.settings_dev.DisableCSRF',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
)

MEDIA_URL = 'http://localhost:7002/styles/images/'
