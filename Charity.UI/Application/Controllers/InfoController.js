
AngularModule.controller('InfoController', InfoController);
InfoController.$inject = ['$scope', '$http', 'ApiCall', '$routeParams', 'shareNeedData'];
function InfoController($scope, $http, ApiCall, $routeParams, shareNeedData) {
    $scope.params = {
        message: '',
        inProgress: true,
    };

    $scope.user = {};
    $scope.prop = {
        isAdmin: false,
        isComp: false,
        isOrg: false,
        isUser: false,
    };
    $scope.prop.stateItem = {};
    var result = ApiCall.GetApiCall('/api/user/' + $routeParams.Id).success(function (data) {
        $scope.params.inProgress = false;
        $scope.user = data;
        $scope.list = data.Needs;
        for (var i = 0; i < $scope.user.Roles.length; i++) {

        if ($scope.user.Roles[i].RoleId == 1)
            $scope.prop.isUser = true;
        if ($scope.user.Roles[i].RoleId == 2)
            $scope.prop.isAdmin = true;
        if ($scope.user.Roles[i].RoleId == 3)
            $scope.prop.isOrg = true;
        if ($scope.user.Roles[i].RoleId == 4)
            $scope.prop.isComp = true;
        }

    },
    function errorCallback(response) {
        alert("Помилка на сервері");
    }).then(function () {
        $scope.stateOptions = {
            stores: [
                { id: 1, name: 'Виконано' },
                { id: 2, name: 'Не виконано' },
                { id: 3, name: 'Відмінено' },
                { id: 4, name: 'Виконується' },
                { id: 5, name: 'Всі статуси' }
            ]
        };

        $scope.prop.stateItem = $scope.stateOptions.stores[$scope.stateOptions.stores.length - 1];
    });

    $scope.stateFilter = function (list) {
        if ((list.State === 0) && ($scope.prop.stateItem.name) === 'Не виконано') {
            return true;
        } else if ((list.State === 1) && ($scope.prop.stateItem.name) === 'Виконано') {
            return true;
        } else if ((list.State === 2) && ($scope.prop.stateItem.name) === 'Відмінено') {
            return true;
        } else if ((list.State === 3) && ($scope.prop.stateItem.name) === 'Виконується') {
            return true;
        } else if ($scope.prop.stateItem.name === 'Всі статуси') {
            return true;
        } else {
            return false;
        }
    };

    $scope.perform = function (myValue) {
        $scope.dataToShare = myValue;
        $scope.dataToShare.Organization = $scope.user.FullName;
        shareNeedData.addData($scope.dataToShare);
        window.location.href = "/perform";
    };

    $scope.Redirect = {}

    $scope.Redirect.Need = function (id) {
        window.location.href = "/need/" + id;
    };

};

AngularModule.service('shareNeedData', function ($window) {
    var KEY = 'App.SelectedValue';
    var mydata = {};
    var addData = function (newObj) {
        var mydata = $window.sessionStorage.getItem(KEY);
        if (mydata) {
            mydata = JSON.parse(mydata);
        } else {
            mydata = "";
        }
        mydata = newObj;
        $window.sessionStorage.setItem(KEY, JSON.stringify(mydata));
    };

    var getData = function () {
        var mydata = $window.sessionStorage.getItem(KEY);
        if (mydata) {
            mydata = JSON.parse(mydata);
        }
        return mydata;
    };

    return {
        addData: addData,
        getData: getData
    };
});