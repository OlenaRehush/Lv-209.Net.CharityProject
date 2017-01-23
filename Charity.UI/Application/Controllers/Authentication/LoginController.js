
// Login controller


(function () {

    AngularModule.controller('loginController', ['$scope', '$location', 'authService', function ($scope, $location, authService) {

        $('#btnGoogleLogin').click(function () {
            window.location.href = "/api/Account/ExternalLogin?provider=Google&response_type=token&client_id=self&redirect_uri=http%3A%2F%2Flocalhost%3A52917%2Flogin&state=2m2O0wrElVgZqk5tAVt9mby40hemgBRRbybumsPbh7s1";
        });
       
        // initialize and setup facebook js sdk
         window.fbAsyncInit = function () {
        FB.init({
                appId: '1740290402966376',
                xfbml: true,
                version: 'v2.5'
            });
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    document.getElementById('status').innerHTML = 'Ви успішно увійшли через Facebook.';
                 } 
            });
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        // login with facebook sdk end   
       
        //end facebook
        //start google
     
        //end google
        $scope.forceError = false;
     
        $scope.reload = function () {
            $scope.show_message = false;
            $scope.inProgress = false;
            $scope.forceError = false;
            $scope.message = "";
        }

        $scope.reload();

        $scope.loginData = {
            userName: "",
            password: ""
        };
        $scope.allowReconfrimEmail = false;

        $scope.login = function () {
            $scope.inProgress = true;

            authService.login($scope.loginData).then(function (response) {
                location.reload();
                $location.path('/home');

            },
             function (err) {
                 $scope.inProgress = false;
                 if (err.error == 'invalid_grant') {
                     $scope.forceError = true;
                 }
                 else {
                     $scope.show_message = true;
                     $scope.message = err.error_description;
                     if (err.error == 'notConfimed_email')
                         $scope.allowReconfrimEmail = true;
                 }
             });
        };
        $scope.recomfirmEmail = function () {
            $scope.inProgress = true;
            authService.reConfirmEmail($scope.loginData.userName).then(function (response) {
                location.reload();
                $location.path('/home');
            },
             function (err) {
                 $scope.inProgress = false;
                 $scope.show_message = true;
                 $scope.message = err.error_description;
             });
        };

    }]);

})();


