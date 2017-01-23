
// Forgot password controller

(function () {
    AngularModule.controller('forgotPasswordController', ['$scope', 'forgotPasswordService', function ($scope, forgotPasswordService) {

        $scope.responseData = '';
        $scope.inProgress = false;
        $scope.show_message = false;

        $scope.forgotPassword = {
            Email: ""
        };

        $scope.ForgotPassword = function () {
            $scope.inProgress = true;

            forgotPasswordService.forgotPassword($scope.forgotPassword).then(function () {
                $scope.show_message = true;
                $scope.inProgress = false;
            }, function (responseData) {
                $scope.responseData += responseData.data.Message;
                $scope.inProgress = false;
            })
        }

    }]);

    AngularModule.factory('forgotPasswordService', ['$http', function ($http) {

        var forgotPasswordService = {};

        forgotPasswordService.forgotPassword = function (forgotPasswordData) {
            return $http.post('/api/Account/ForgotPassword', forgotPasswordData)
        };
        return forgotPasswordService;
    }]);

})();

// Reset password controller

(function () {
    AngularModule.controller('resetPasswordController', ['$scope', '$window', '$location', 'resetPasswordService', 'authService', function ($scope, $window, $location, resetPasswordService, authService) {
        $scope.message = '';
        $scope.inProgress = false;

        $scope.UserData = {
            Email: "",
            Password: "",
            ConfirmPassword: "",
            Code: "",
        }

        $scope.loginData = {
            userName: "",
            password: ""
        };

        var parseLocation = function (location) {
            var pairs = location.substring(1).split("&");
            var obj = {};
            var pair;
            var i;

            for (i in pairs) {
                if (pairs[i] === "") continue;

                pair = pairs[i].split("=");
                obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }

            return obj;
        };

        $scope.UserData.Code = parseLocation(window.location.search)['code'];
        $scope.UserData.Email = parseLocation(window.location.search)['email'];
        //console.log(x);

        $scope.ChangePassword = function () {
            if ($scope.UserData.Password == $scope.UserData.ConfirmPassword) {
                $scope.inProgress = true;

                resetPasswordService.resetPassword($scope.UserData).then(function (response) {
                    $scope.loginData.userName = $scope.UserData.Email;
                    $scope.loginData.password = $scope.UserData.Password;
                    $scope.login();

                }, function (error) {
                    $scope.message = error.data.Message;
                    $scope.inProgress = false;
                })
            }
            else {
                $scope.inProgress = false;
            }
        }

        $scope.login = function () {
            authService.login($scope.loginData).then(function (response) {
                $location.path('/home');
            },
             function (err) {
                 $scope.message = err.error_description;
             });
        };

    }]);

    AngularModule.factory('resetPasswordService', ['$http', function ($http) {

        var resetPasswordService = {};

        resetPasswordService.resetPassword = function (resetPasswordData) {
            return $http.post('/api/Account/ResetPassword', resetPasswordData)
        };

        return resetPasswordService;

    }]);
})();
