(function () {
    AngularModule.controller("adminPanelController", ['$scope', '$location', 'authService', function ($scope, $location, authService) {

        /// <summary>
        /// Checking role for get access to Admin page
        /// </summary>
        $scope.checkIsAdmin = function () {
            authService.getUserRolesNoAuthorizen().then(function (data) {
                if (!data.includes("Admin")) {
                    $location.path('error');
                }
            });
        };

        $scope.checkIsAdmin();
    }]);
})(); 