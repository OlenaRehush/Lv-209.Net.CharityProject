(function () {
    AngularModule.controller('ExternalloginController', ['$scope', '$http',function ($scope, $http) {
       
          
        $scope.loginFacebook = function () {
            FB.login(function (response) {
              
                $scope.isUserRegistered(response.authResponse.accessToken);
                if (response.status === 'connected') {

                   FB.api('/me', 'GET', { fields: 'first_name,last_name,name,id,email' }, function (response) {
                        document.getElementById('status').innerHTML = response.name + ' ви успішно увійшли через Facebook.';
                    });

                }
            }, { scope: 'email' });
         
        }
       
        $scope.isUserRegistered = function (accessToken) {
            $.ajax({
                url: '/api/Account/IsAuthorizen',
                method: 'GET',
                headers: {
                    'content-type': 'application/JSON',
                    'Authorization': 'Bearer ' + accessToken
                },
                success: function (response) {
                    if (response) {
                        localStorage.setItem('accessToken', accessToken);
                        localStorage.setItem('userName', response.Email);
                     }
                    else {
                        FB.api('/me', 'GET', { fields: 'name,email' }, function (UserObject) {
                            $scope.signupExternalUser(accessToken, UserObject); 
                        });
                       
                    }
                }
            });
        }
        $scope.signupExternalUser = function (accessToken, UserObject) {
            $scope.UserData = {
                Email: UserObject.email
              }
            var req = {
                method: 'POST',
                url: '/api/Account/RegisterExternal',
                dataType: 'json',
                headers: {
                                  'content-type': 'application/json',
                               'Authorization': 'Bearer ' + accessToken
                             },
                data: { object: $scope.UserData.Email }
            }

            $http(req).then(function (response) {
               
            }, function () { });
    

       }
    }]);
})();

