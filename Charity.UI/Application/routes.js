/// <reference path="Views/signin-google.html" />
/// <reference path="Views/signin-google.html" />
var AngularModule = angular.module('client_side', ['ngRoute', 'ngActivityIndicator', 'LocalStorageModule', 'angular-table', 'angular-tabs', 'ngAnimate', 'ui.bootstrap','angularUtils.directives.dirPagination']);

AngularModule.config(function ($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
        templateUrl: '../Application/Views/home.html'
    })
    .when('/contacts', {
        templateUrl: '../Application/Views/contacts.html',
    })
    .when('/about', {
        templateUrl: '../Application/Views/about.html'
    })
    .when('/company', {
        templateUrl: '../Application/Views/company.html',       
        title: 'Компанії'
    })
    .when('/organization', {
        templateUrl: '../Application/Views/organization.html',
        title: 'Організації'
    })
    .when('/editOrganization', {
        templateUrl: '../Application/Views/editOrganization.html',
        title: 'Organizations edit'
    })
    .when('/editCompany', {
        templateUrl: '../Application/Views/editCompany.html',
        title: 'Company edit'
    })
    .when('/user', {
        templateUrl: '../Application/Views/user.html',
    })
    .when('/need', {
        templateUrl: '../Application/Views/need.html',
        controller: 'needController'
    })
    .when('/editNeeds', {
        templateUrl: '../Application/Views/editNeeds.html',
    })
    .when('/need/:needId', {
        templateUrl: '../Application/Views/needPage.html',
        controller: 'needPageController'
    })
    .when('/socialWorkers', {
        templateUrl: '../Application/Views/socialWorkers.html',
        controller: 'socialWorkerController'
    })
    .when('/home', {
        templateUrl: '../Application/Views/home.html',
    })
    .when('/registration', {
        templateUrl: '../Application/Views/Authentication/registration.html',
        controller: 'signupController'
    })
    .when('/login', {
       templateUrl: '../Application/Views/Authentication/login.html',
       controller: 'loginController'
    })
    .when('/SocialWorker/Update', {
        templateUrl: '../Application/Views/addSocialWorkers.html',
    })
    .when('/panel', {
        templateUrl: '../Application/Views/adminPanel.html'       
    })
    .when('/statistic', {
        templateUrl: '../Application/Views/statistic.html'
    })
    .when('/users', {
        templateUrl: '../Application/Views/users.html'
    })
    .when('/addNewUser', {
        templateUrl: '../Application/Views/addNewUser.html',
        controller: 'addCompanyController'
    })
    .when('/needs', {
        templateUrl: '../Application/Views/needs.html'
    })
    .when('/rules', {
        templateUrl: '../Application/Views/rules.html'
    })
    .when('/profile', {
        templateUrl: '../Application/Views/profile.html',
        controller: 'profilePageController',
        css: '../Styles/Profile/profile.css'
    })
    .when('/editProfile', {
        templateUrl: '../Application/Views/editProfile.html',
        controller: 'profilePageController',
    })
    .when('/forgot_password', {
        templateUrl: '../Application/Views/Authentication/forgot_password.html',
        controller: 'forgotPasswordController',
    })
    .when('/Reset_Password', {
        templateUrl: '../Application/Views/Authentication/Reset_Password.html',
        controller: 'resetPasswordController',
    }) 
    .when('/perform', {
        templateUrl: '../Application/Views/performNeed.html',
        controller: 'performNeedController'
    })
    .when('/InfoPage/:Id', {
        templateUrl: '../Application/Views/InfoPage.html',
        controller: 'InfoController'
    })
    .when('/signin-google', {
        templateUrl: '../Application/Views/signin-google.html',
        controller: 'loginController'
    })
         .when('/signin-facebook', {
             templateUrl: '../Application/Views/Authentication/signin-facebook.html',
             controller: 'ExternalloginController'
         })
    .otherwise({
        templateUrl: '../Application/Views/error.html'
    });

   
    $locationProvider.html5Mode(true);

})

AngularModule.run(['authService', function (authService) {
    authService.fillAuthData();
}]);

AngularModule.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

AngularModule.service('ApiCall', ['$http', function ($http) {

    var result;

    this.GetApiCall = function (controllerName, methodName) {
        result = $http.get(controllerName).success(function (data, status) {
            result = (data);    
        });
        return result;
    };

    this.PostApiCall = function (controllerName, methodName, obj) {
        result = $http.post('api/' + controllerName + '/' + methodName, obj).success(function (data, status) {
            result = (data);
        });
        return result;
    };
}]);


/*
    Directive for opening link in new _blank
*/
AngularModule.directive('myTarget', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var href = element.href;
            if (true) {  
                element.attr("target", "_blank");
            }
        }
    };
});

AngularModule.directive('head', ['$rootScope', '$compile',
    function ($rootScope, $compile) {
        return {
            restrict: 'E',
            link: function (scope, elem) {
                var html = '<link rel="stylesheet" ng-repeat="(routeCtrl, cssUrl) in routeStyles" ng-href="{{cssUrl}}" />';
                elem.append($compile(html)(scope));
                scope.routeStyles = {};
                $rootScope.$on('$routeChangeStart', function (e, next, current) {
                    if (current && current.$$route && current.$$route.css) {
                        if (!angular.isArray(current.$$route.css)) {
                            current.$$route.css = [current.$$route.css];
                        }
                        angular.forEach(current.$$route.css, function (sheet) {
                            delete scope.routeStyles[sheet];
                        });
                    }
                    if (next && next.$$route && next.$$route.css) {
                        if (!angular.isArray(next.$$route.css)) {
                            next.$$route.css = [next.$$route.css];
                        }
                        angular.forEach(next.$$route.css, function (sheet) {
                            scope.routeStyles[sheet] = sheet;
                        });
                    }
                });
            }
        };
    }
]);

   