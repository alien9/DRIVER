from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin

from rest_framework import routers

from black_spots import views as black_spot_views
from data import views as data_views
from driver_auth import views as auth_views
from user_filters import views as filt_views

from django.contrib.auth import views as contrib_auth_views


router = routers.DefaultRouter()
router.register('assignments', black_spot_views.EnforcerAssignmentViewSet)
router.register('audit-log', data_views.DriverRecordAuditLogViewSet)
router.register('blackspots', black_spot_views.BlackSpotViewSet, base_name='blackspots')
router.register('blackspotsets', black_spot_views.BlackSpotSetViewSet, base_name='blackspotsets')
router.register('blackspotconfig', black_spot_views.BlackSpotConfigViewSet, base_name='blackspotconfig')
router.register('boundaries', data_views.DriverBoundaryViewSet)
router.register('boundarypolygons', data_views.DriverBoundaryPolygonViewSet)
router.register('csv-export', data_views.RecordCsvExportViewSet, base_name='csv-export')
router.register('duplicates', data_views.DriverRecordDuplicateViewSet)
router.register('jars', data_views.AndroidSchemaModelsViewSet, base_name='jars')
router.register('records', data_views.DriverRecordViewSet, base_name='records')
router.register('publicrecords', data_views.DriverPublicRecordViewSet, base_name='publicrecords')
router.register('requestrecords', data_views.DriverRequestRecordViewSet)
router.register('recordschemas', data_views.DriverRecordSchemaViewSet)
router.register('recordtypes', data_views.DriverRecordTypeViewSet)
router.register('recordcosts', data_views.DriverRecordCostConfigViewSet)
router.register('userfilters', filt_views.SavedFilterViewSet, base_name='userfilters')


# user management
router.register(r'users', auth_views.UserViewSet)
router.register(r'groups', auth_views.GroupViewSet)

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^geocode/forward$', data_views.search_location, name='forward'),
    url(r'^geocode/reverse$', data_views.reverse_search_location, name='reverse'),
    url(r'^password_reset/$', contrib_auth_views.password_reset, name='password_reset'),
    url(r'^password_reset/done/$', contrib_auth_views.password_reset_done, name='password_reset_done'),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        contrib_auth_views.password_reset_confirm, name='password_reset_confirm'),
    url(r'^reset/done/$', contrib_auth_views.password_reset_complete, name='password_reset_complete'),
    url(r'^api/', include(router.urls)),
    url(r'^api/create-user/', auth_views.user_create),
    # get token for given username/password
    url(r'^api-token-auth/', auth_views.obtain_auth_token),
    url(r'^api/sso-token-auth/', auth_views.sso_auth_token),
    url(r'^openid/clientlist/', auth_views.get_oidc_client_list, name='openid_client_list'),
    # override openid login callback endpoint by adding url here before djangooidc include
    url(r'^openid/callback/login/?$', auth_views.authz_cb, name='openid_login_cb'),
    # OIDC
    url(r'openid/', include('djangooidc.urls')),
    url(r'^captcha/', include('captcha.urls')),
    url(r'^signup$', auth_views.signup),
]

# Allow login to the browseable API
urlpatterns.append(url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')))

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        url(r'^api/__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
