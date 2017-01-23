AngularModule.controller("addCompanyController", ['$scope', '$window', 'signupService2', '$location', 'authService', function ($scope, $window, signupService2, $location, authService) {
    {
        // checking Admin role
        $scope.checkIsAdmin = function () {
            authService.getUserRolesNoAuthorizen().then(function (data) {
                if (!data.includes("Admin")) {
                    $location.path('error');
                }
            });
        };
        $scope.checkIsAdmin();
    }

    $scope.message = '';

    // ApplcationUser model for registration new Company and Organization
    $scope.Registration = {
        FullName: "",
        Birthday:  "",
        Gender: "",
        PhotoURL: "",
        Email: "",
        Address: "",
        PhoneNumber: "",
        Website: "",
        Password: "",
        ConfirmPassword: "",
        RoleName: "",
        Description: "",
        Longitude: "",
        Latitude: "",
        IsHiden: false
    };

    // Retrieve Longitude and Lattitude after user type Address
    $scope.inProgress = false;
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), {
        types: ['geocode']
    });

    $scope.registerNewUser = function () {

        $scope.inProgress = true;

        try {
            var place = autocomplete.getPlace();
            $scope.Registration.Longitude = place.geometry.location.lng();
            $scope.Registration.Latitude = place.geometry.location.lat();
            $scope.Registration.Address = place.formatted_address;
        }
        catch (ex) {
            $scope.inProgress = false;
            $scope.message = "Не можливо отримати геодані, спробуйте ще раз";
        }

        signupService2.saveRegistration($scope.Registration).then(function () {
            $window.location.href = "panel";

        }, function (error) {
            $scope.inProgress = false;
            $scope.message = error.data.Message;
        })
    };

    $scope.cancel = function () {
        window.location.href = "/users";
    };
}]);

/// <summary>
/// Register a new Company, Organization
/// </summary>
AngularModule.factory('signupService2', function ($http) {

    var signupService2 = {};

    signupService2.saveRegistration = function (registration) {
        return $http.post('api/Account/Register', registration);
    };

    return signupService2;
});