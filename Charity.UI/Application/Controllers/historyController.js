AngularModule.controller('historyController', function ($scope, $http, ApiCall) {

    var result = ApiCall.GetApiCall('/api/needs/allneeds').success(function (data) {
        $scope.list = data;
    });

     window.onload = function () {
        var val = sessionStorage.getItem('value');
        document.getElementById("historySearch").value = val;
        $scope.table = document.getElementById("historySearch").value;
    }

    window.onbeforeunload = function () {
        sessionStorage.setItem('value', document.getElementById("historySearch").value);
        $scope.table = document.getElementById("historySearch").value;
    }
});