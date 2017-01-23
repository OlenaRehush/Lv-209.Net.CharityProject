// Controller that works with performNeed.html
AngularModule.controller("performNeedController", function ($scope, $http, $location, shareNeedData) {
    $scope.loadedInfo = false;
    $scope.inProgress = false;
// Get id of need from need page
    $scope.sharedData = shareNeedData.getData();
    $scope.Need = angular.copy($scope.sharedData);

    $scope.Request = {
        Phone: '',
        IsAnonymous: false,
        Description: ''
    };
// Gets phone of current user and stops loader after
    $http.get('/api/Account/UserInfo').then(function (userInfo) {
        $scope.Request.Phone = userInfo.data.PhoneNumber;
        $scope.loadedInfo = true;
    });
// Adds new need request    
    $scope.sendNeedRequest = function () {
        $scope.inProgress = true;
        $scope.loadedInfo = false;

        $http({
            method: 'POST',
            url: 'api/NeedRequest/Add',
            data: $.param({
                Status: false,
                Date: $scope.Need.DateCreated,
                Phone: $scope.Request.Phone,
                IsAnonymous: $scope.Request.IsAnonymous,
                Description: $scope.Request.Description,
                Need: { Id: $scope.Need.Id },
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }).
           success(function (data)
           {
               window.location.href = "/need";
           }).
           error(function (error) {
               alert(error.Message);
               $scope.inProgress = false;
               $scope.loadedInfo = true;
           });
    };
// Redirect back to page with needs
    $scope.backToNeedsList = function () {
        window.location.href = "/need";
    };
});
