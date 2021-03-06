import logging
from urllib import quote
from urlparse import parse_qs

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.shortcuts import redirect

from oauth2client import client, crypt

from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from djangooidc.oidc import OIDCError
from djangooidc.views import CLIENTS

from grout.pagination import OptionalLimitOffsetPagination

from django.conf import settings
from driver_auth.serializers import UserSerializer, GroupSerializer
from driver_auth.permissions import (IsAdminOrReadSelfOnly, IsAdminOrReadOnly, is_admin_or_writer,
                                     is_admin)
from django.views.decorators.csrf import csrf_exempt
import json
from django import forms
from captcha.fields import CaptchaField
from captcha.models import CaptchaStore
from django.http import HttpResponse
from django.shortcuts import render
from django.utils import  timezone
# match what auth-service.js looks for
USER_ID_COOKIE = 'AuthService.userId'
TOKEN_COOKIE = 'AuthService.token'
CAN_WRITE_COOKIE = 'AuthService.canWrite'
ADMIN_COOKIE = 'AuthService.isAdmin'
EMAIL_COOKIE = 'AuthService.Email'

logger = logging.getLogger(__name__)


def authz_cb(request):
    """
    Based on OIDC callback:
    https://github.com/marcanpilami/django-oidc/blob/master/djangooidc/views.py

    Overriden to set auth token cookie for client; still logs in session as well.
    """

    oauth_client = CLIENTS[request.session["op"]]
    query = None

    try:
        query = parse_qs(request.META['QUERY_STRING'])
        userinfo = oauth_client.callback(query, request.session)
        request.session["userinfo"] = userinfo
        user = authenticate(**userinfo)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            # set session cookie for frontend
            response = redirect(settings.START_PAGE)
            response.set_cookie(USER_ID_COOKIE, token.user_id)
            response.set_cookie(EMAIL_COOKIE, user.email)

            # set cookie for frontend write access (will be false by default)
            if is_admin_or_writer(user):
                response.set_cookie(CAN_WRITE_COOKIE, 'true')
            if is_admin(user):
                response.set_cookie(ADMIN_COOKIE, 'true')
            response.set_cookie(TOKEN_COOKIE, quote('"' + token.key + '"', safe=''))
            return response
        else:
            # authentication failed
            # return 403 here instead of raising error
            return JsonResponse({'error': 'This login is not valid in this application'},
                            status=status.HTTP_403_FORBIDDEN)
    except OIDCError as err:
        return JsonResponse({'error': err, 'callback': query}, status=status.HTTP_400_BAD_REQUEST)


# helper to return list of available SSO clients
def get_oidc_client_list(request):
    return JsonResponse({'clients': CLIENTS.keys()})

@csrf_exempt
def user_create(request):
    #return JsonResponse({'error': request.POST},status=status.HTTP_400_BAD_REQUEST)
    #if not 'data' in request:
    #    return JsonResponse({'error': 'missing data'}, status=status.HTTP_400_BAD_REQUEST)

    d = json.loads(request.body)
    if not 'email' in d:
        return JsonResponse({'username': 'LOGIN.EMAIL_NEEDED'}, status=status.HTTP_400_BAD_REQUEST)
    if not 'captcha_0' in d or not 'captcha_1' in d:
        return JsonResponse({'captcha_1': 'LOGIN.CAPTCHA_MISSING'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        CaptchaStore.objects.get(response=d['captcha_1'].lower(), hashkey=d['captcha_0'], expiration__gt=timezone.now()).delete()
    except CaptchaStore.DoesNotExist:
        return JsonResponse({'captcha_1': 'LOGIN.CAPTCHA_ERROR'}, status=status.HTTP_400_BAD_REQUEST)

    from os import urandom
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    d['groups']=[]
    d['username']=d['email']
    d['password'] = "".join(chars[ord(c) % len(chars)] for c in urandom(64))

    serialized = UserSerializer(data=d, context={"request": request})
    if serialized.is_valid():
        #my_group = Group.objects.get(name='analyst')
        u=serialized.save()
        #my_group.user_set.add(u) unfortunately thats too dangerous
        return JsonResponse(serialized.data, status=status.HTTP_201_CREATED)
    else:
        return JsonResponse(serialized.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
def signup(request):
    if request.POST:
        nop
    else:
        form = CaptchaSignupForm()
        return HttpResponse(form.as_p())

class CaptchaSignupForm(forms.Form):
    email = forms.CharField()
    captcha = CaptchaField()

class DriverSsoAuthToken(APIView):
    parser_classes = (JSONParser,)
    permission_classes = (AllowAny,)

    def post(self, request, format=None):
        token = request.data.get('token')
        if token:
            return validate_oauth_token(token)
        else:
            return JsonResponse({'error': 'Token parameter is required'}, status=status.HTTP_400_BAD_REQUEST)


def validate_oauth_token(token):
    """Validate the token code from a mobile client SSO login, then return the user's DRF token
    for use in authenticating future requests to this API.

    https://developers.google.com/identity/sign-in/android/backend-auth#using-a-google-api-client-library
    """
    try:
        idinfo = client.verify_id_token(token, settings.GOOGLE_OAUTH_CLIENT_ID)
        if idinfo['aud'] not in [settings.GOOGLE_OAUTH_CLIENT_ID]:
            return JsonResponse({'error': 'Unrecognized client.'}, status=status.HTTP_403_FORBIDDEN)
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return JsonResponse({'error': 'Wrong issuer.'}, status=status.HTTP_403_FORBIDDEN)
        # have a good token; get API token now
        user = authenticate(**idinfo)
        if user:
            logger.debug('validated SSO token code for user: {email}'.format(email=user.email))
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': token.user_id})
        else:
            return JsonResponse({'error': 'This login is not valid in this application'}, status=status.HTTP_403_FORBIDDEN)
    except crypt.AppIdentityError:
        return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_403_FORBIDDEN)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    serializer_class = UserSerializer
    permission_classes = (IsAdminOrReadSelfOnly,)
    queryset = User.objects.all().order_by('-date_joined')
    pagination_class = OptionalLimitOffsetPagination

    def get_queryset(self):
        """Limit non-admin users to only see their own info"""
        user = self.request.user
        if is_admin(user):
            return self.queryset
        else:
            return self.queryset.filter(id=user.id)


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = (IsAdminOrReadOnly,)
    pagination_class = OptionalLimitOffsetPagination


class DriverObtainAuthToken(ObtainAuthToken):
    def post(self, request):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': token.user_id})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


obtain_auth_token = DriverObtainAuthToken.as_view()
sso_auth_token = DriverSsoAuthToken.as_view()
