// declaring angular module
var AngularModule = angular.module('client_side', ['ngRoute'],'angular-table', 'angular-tabs','ngAnimate','ui.bootstrap');

AngularModule.service('ApiCall', ['$http', function ($http) {

    var result;

    // This is used for calling get methods from web api
    this.GetApiCall = function (controllerName,methodName) {
        result = $http.get('/Home/api/' + controllerName + '/' + methodName).success(function (data, status) {
            result = (data);
        }).error(function () {
            alert("Error + GetApiCall ->" + Error.name);
        });
        return result;
    };

    // This is used for calling post methods from web api with passing some data to the web api controller
    this.PostApiCall = function (controllerName, methodName,obj) {
        result = $http.post('api/' + controllerName + '/' + methodName, obj).success(function (data, status) {
            result = (data);
        }).error(function () {
            alert("Error + PostApiCall ->" + Error.name);
        });
        return result;
    };
}]);