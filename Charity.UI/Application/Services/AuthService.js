

// Auth service


(function () {

    AngularModule.factory('authService', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {
        
        var authServiceFactory = {};

        var _authentication = {
            isAuth: false,
            userName: ""
        };

        var _saveRegistration = function (registration) {

            _logOut();

            return $http.post('api/Account/Register', registration).then(function (response) {
                return response;
            });

        };

        var _login = function (loginData) {
            
            var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

            var deferred = $q.defer();

            $http.post('token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

                localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName });

                _authentication.isAuth = true;
                _authentication.userName = loginData.userName;

                deferred.resolve(response);

            }).error(function (err, status) {
                _logOut();
                deferred.reject(err);
            });

            return deferred.promise;

        };

        var _reConfirmEmail = function (email) {

            return $http({
                url: 'api/Account/ReconfirmEmail',
                method: 'GET',
                params: { email: email }
            }).then(function (response) {
                return response.data;
            });
        };

        var _logOut = function () {

            localStorageService.remove('authorizationData');

            _authentication.isAuth = false;
            _authentication.userName = "";

        };

        var _fillAuthData = function () {

            var authData = localStorageService.get('authorizationData');
            if (authData) {
                _authentication.isAuth = true;
                _authentication.userName = authData.userName;
            }

        };

        var _getUserRoles = function () {
            return $http.get('api/Account/UserRoles').then(function (response) {
                return response.data;
            });
        };

        var _getUserRolesNoAuthorizen = function () {
            return $http.get('api/Account/UserRolesNoAuthorizen').then(function (response) {
                return response.data;
            });
        };

        var _getRequestInfo = function () {
            return $http.get('api/Organization/RequestInfo').then(function (response) {
                return response.data;
            });
        };

        authServiceFactory.saveRegistration = _saveRegistration;
        authServiceFactory.login = _login;
        authServiceFactory.reConfirmEmail = _reConfirmEmail;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;
        authServiceFactory.getUserRoles = _getUserRoles;
        authServiceFactory.getUserRolesNoAuthorizen = _getUserRolesNoAuthorizen;
        authServiceFactory.getUserRolesNoAuthorizen = _getUserRolesNoAuthorizen;
        authServiceFactory.getRequestInfo = _getRequestInfo;
        return authServiceFactory;
    }]);

})();