'use strict';
AngularModule.controller("AddNeed", function ($scope, $http, ApiCall, $location, $filter, $timeout) {
  
    $scope.km = this;
    $scope. km.options = '{format:"DD:MM:YYYY HH:mm"}'
    $scope.km.date = new Date();

    $scope.today = new Date();

    var userRoles = $http.get('/api/Account/UserRolesNoAuthorizen').then(function (roles) {
        if (roles.data.includes("User") || roles.data.includes("Organization") || roles.data.includes("Admin")) {
            $http.get('/api/Account/UserInfo').then(function (userInfo) {
                $scope.UserInformation = userInfo.data;
                $scope.loadedInfo = true;
            });
        }
        else {
            $scope.message = "У вас не достатньо прав для доступу до цієї сторінки";
        }
    }, function (error) {
        $scope.message = error.data.Message;
    });

    $scope.options = [
      {
          name: 'Матеріальні',
          code: 1
      },
      {
          name: 'Мрії',
          code: 2
      },
      {
          name: 'Волонтерство',
          code: 3
      }
    ];
    $scope.selectedOption = $scope.options[0];
    console.log($scope.selectedOption)
    $scope.additionalInfo =
        {
            Name: '',
            ImageLink:''
        }
    $scope.AddNewNeed = function () {
        $scope.today = new Date();
        $scope.type = {};
        $http.get('api/user/' + $scope.UserInformation.Id).then(function (results) {
            $scope.users = results.data;
            $http.get('api/TypeOfNeed/' + $scope.selectedOption.code).then(function (resultes) {
                $scope.type=resultes.data;
                console.log($scope.type);
                $scope.need =
                    { 
                        Name: $scope.additionalInfo.Name,
                         State: 0,
                         DateCreated: $scope.today,
                         DateEnd: $scope.km.date,
                         User: $scope.users,
                         TypeOfNeed: $scope.type,
                         ImageLink: $scope.additionalInfo.ImageLink
                    }
                console.log($scope.need);
           
                $.ajax({
                    type: "POST",
                    data: JSON.stringify($scope.need),
                    url: "api/Need/addNew",
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                }).done(function (res) {
                    console.log('res', res);
                    // Do something with the result :)
                });
            });
            });
    };


    $scope.backToNeedsList = function () {
        window.location.href = "/need";
    };
});

(function () {
    'use strict';
    AngularModule.directive('datetimepicker',function ($timeout) {
            return {
                require: '?ngModel',
                restrict: 'EA',
                scope: {
                    datetimepickerOptions: '@',
                    onDateChangeFunction: '&',
                    onDateClickFunction: '&'
                },
                link: function ($scope, $element, $attrs, controller) {
                    $element.on('dp.change', function () {
                        $timeout(function () {
                            var dtp = $element.data('DateTimePicker');
                            controller.$setViewValue(dtp.date());
                            $scope.onDateChangeFunction();
                        });
                    });

                    $element.on('click', function () {
                        $scope.onDateClickFunction();
                    });

                    controller.$render = function () {
                        if (!!controller && !!controller.$viewValue) {
                            var result = controller.$viewValue;
                            $element.data('DateTimePicker').date(result);
                        }
                    };

                    $element.datetimepicker($scope.$eval($attrs.datetimepickerOptions));
                }
            };
        }
      );

})();
 

