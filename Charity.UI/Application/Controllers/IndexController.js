(function () {

    AngularModule.controller('indexController', ['$scope', '$location', 'authService', function ($scope, $location, authService) {
        {
          
            $scope.prop = {
                IsUploadHeaderCount:false,
            }

            $scope.IsAdmin = false;
            $scope.IsOrg = false;
            $scope.RequestCount = 0;
            $scope.RequestsArray = {};

            $scope.checkIsAdmin = function () {
                authService.getUserRoles().then(function (data) {
                    if (data.includes("Admin")) {
                        $scope.IsAdmin = true;
                    }
                    else if (data.includes("Organization")) {
                        $scope.IsOrg = true;
                        $scope.getRequestsInfo();
                    };
                });
            };

            $scope.getRequestsInfo = function () {
                authService.getRequestInfo().then(function (info) {
                    $scope.RequestsArray = info;
                    $scope.RequestCount = info.length;
                    $scope.prop.IsUploadHeaderCount = true;
                },
                function (response) {
                    $scope.message = response.Message;
                });
            };

            $scope.checkIsAdmin();
                      
            $scope.logOut = function () {
                authService.logOut();
                $location.path('/home');
            }

            $scope.authentication = authService.authentication;
        }
    }]);
})();