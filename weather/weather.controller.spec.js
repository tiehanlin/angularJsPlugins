describe('myapplication.weather: WeatherController', function testController() {
  var $rootScope;
  var $controller;
  var $q;
  var gettext;
  var c8yInventory;
  var weatherService;

  var $scope;

  beforeEach(function beforeEach() {
    common.globalBeforeWithUI();
    module('myapplication.weather');

    inject(function injector(
      _$rootScope_,
      _$controller_,
      _$q_,
      _gettext_,
      _c8yInventory_,
      _weatherService_
    ) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;
      gettext = _gettext_;
      c8yInventory = _c8yInventory_;
      weatherService = _weatherService_;
    });
  });

  var id = 42;
  var scope = { child: { config: { device: { id: id } } } };
  var lat = 51.2674861;
  var lng = 6.76976378327068;
  var deviceWithLocation = { data: { c8y_Position: { lat: lat, lng: lng } } };

  it('gets the weather at a device location', function testGetWeather() {
    // Given
    spyOn(c8yInventory, 'detail').and.returnValue(async(deviceWithLocation));

    var weather = { currently: {
      icon: 'clear-day', temperature: 30, pressure: 1040, humidity: 5, windSpeed: 5, windBearing: 200
    }};
    spyOn(weatherService.weather, 'getCurrent').and.returnValue(async(weather));
    // When
    run(scope);
    // Then
    expect(c8yInventory.detail).toHaveBeenCalledWith(id);
    expect(weatherService.weather.getCurrent).toHaveBeenCalledWith(lat, lng);
    expect($scope.weather).toEqual(weather);
    expect($scope.status).toEqual('ready');
  });

  it('reports an error if the selected device has no location', function testNoLocation() {
    // Given
    var deviceNoLocation = { data: {} };
    spyOn(c8yInventory, 'detail').and.returnValue(async(deviceNoLocation));
    spyOn(weatherService.weather, 'getCurrent');
    // When
    run(scope);
    // Then
    expect(c8yInventory.detail).toHaveBeenCalled();
    expect(weatherService.weather.getCurrent).not.toHaveBeenCalled();
    expect($scope.status).toMatch('has not reported a location');
  });

  it('reports an error if the device cannot be retrieved', function testError() {
    // Given
    var deviceError = { status: 404 };
    spyOn(c8yInventory, 'detail').and.returnValue(async(deviceError));
    spyOn(weatherService.weather, 'getCurrent');
    // When
    run(scope);
    // Then
    expect(c8yInventory.detail).toHaveBeenCalled();
    expect(weatherService.weather.getCurrent).not.toHaveBeenCalled();
    expect($scope.status).toMatch('has not reported a location');
  });

  it('reports an error if the weather information cannot be retrieved', function testNoWeather() {
    // Given
    spyOn(c8yInventory, 'detail').and.returnValue(async(deviceWithLocation));
    spyOn(weatherService.weather, 'getCurrent').and.returnValue(asyncFailed('error'));
    // When
    run(scope);
    // Then
    expect(c8yInventory.detail).toHaveBeenCalled();
    expect(weatherService.weather.getCurrent).toHaveBeenCalled();
    expect($scope.status).toMatch('Error retrieving weather information');
  });

  function run(scopeBindings) {
    $scope = _.assign($rootScope.$new(), scopeBindings);

    $controller('weatherController', {
      $scope: $scope,
      $q: $q,
      weatherService: weatherService,
      gettext: gettext,
      c8yInventory: c8yInventory
    });
  }

  function async(x) {
    return { then: function cb(success) { return success(x); } };
  }

  function asyncFailed(x) {
    return { then: function cb(success, error) { return error(x); } };
  }
});
