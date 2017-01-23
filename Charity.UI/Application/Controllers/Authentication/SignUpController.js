

// Sign Up controller


(function () {

    AngularModule.controller('signupController', ['$scope', '$location', 'authService', function ($scope, $location, authService) {

        $scope.savedSuccessfully = false;
        $scope.inProgress = false;

        $scope.message = "";

        $scope.registration = {
            FullName: "Волонтер",
            Birthday: "",
            Gender: "",
            PhotoURL: "",
            Email: "",
            Address: "",
            PhoneNumber: "",
            Password: "",
            ConfirmPassword: "",
            RoleName: "User",
            Description: ""
        };

        $scope.signUp = function () {
            
            $scope.inProgress = true;
            if ($scope.registration.Password == $scope.registration.ConfirmPassword) {

                authService.saveRegistration($scope.registration).then(function (response) {
                    $scope.inProgress = false;
                    $scope.savedSuccessfully = true;
                    $scope.message = "Ви зареєстровані, тепер перейдіть на вашу електронну пошту, та підтвердіть реєстрацію";

                },
                 function (response) {
                     $scope.inProgress = false;

                     $scope.message = response.data.Message;
                 });
            }
            else
                $scope.inProgress = false;

        };

    }]);

})();


