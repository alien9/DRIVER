'use strict';

describe('driver.navbar: Navbar', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.templates'));
    beforeEach(module('driver.navbar'));
    beforeEach(module('driver.views.account'));
    beforeEach(module('driver.views.dashboard'));
    beforeEach(module('driver.views.home'));
    beforeEach(module('driver.views.map'));
    beforeEach(module('driver.views.record'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var DriverResourcesMock;
    var RecordTypes;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _RecordTypes_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should load directive', function () {
        var geographiesUrl = /\/api\/boundaries/;
        $httpBackend.expectGET(geographiesUrl).respond(200, ResourcesMock.GeographyResponse);

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var geographyId = ResourcesMock.GeographyResponse.results[0].uuid;
        var polygonsUrl = new RegExp('api/boundarypolygons/\\?boundary=' + geographyId);
        $httpBackend.expectGET(polygonsUrl).respond(200, DriverResourcesMock.PolygonResponse);

        var scope = $rootScope.$new();
        var element = $compile('<driver-navbar></driver-navbar>')(scope);
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(element.find('.nav-rt-item').length).toBeGreaterThan(0);
        expect(element.find('.nav-page-item').length).toBeGreaterThan(0);
    });
});