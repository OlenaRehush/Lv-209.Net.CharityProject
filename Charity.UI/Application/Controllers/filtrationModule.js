// Controller that works with company.html
AngularModule.controller("basicCompanyController", function ($scope, $http, ApiCall, $filter, $uibModal, $location, srvShareData) {
    $scope.inProgress = true;
    $scope.dataToShare = { Id: '' };
// Share data to edit page
    $scope.shareMyData = function (myValue) {
        $scope.dataToShare = myValue;
        srvShareData.addData($scope.dataToShare);
        window.location.href = "/editCompany";
    }

    $scope.User = {}
    $scope.AdminRole = false;

    $scope.query = "";
    $scope.animationsEnabled = true;

    $scope.originalList = [];
    $scope.filteredList = $scope.originalList;
// Gets data abbout all companies
    var result = $http.get('/api/companies/allcompanies').success(function (data) {
        $scope.originalList = data;
        $scope.filteredList = $scope.originalList;
        $scope.inProgress = false;
        var userRoles = $http.get('/api/Account/UserRoles').then(function (roles) {
            if (roles.data.includes("Admin")) {
                $scope.AdminRole = true;
            }
            else {
                $scope.message = "У вас не достатньо прав для доступу до цієї сторінки";
            }
        }, function (error) {
            $scope.message = error.data.Message;
        });
    });
// ng-table config
    $scope.config = {
        itemsPerPage: 5,
        maxPages: 5,
        fillLastPage: false
    }
// Search field filtration
    $scope.updateFilteredList = function () {
        $scope.filteredList = $filter("filter")($scope.originalList, $scope.query);
    }; 
// Function that open confirmation delete window
    $scope.openModal = function (_company) {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'ModalCompany.html',
            controller: 'InstanceControllerCompany',
            backdrop: true,
            scope: $scope, // send scope values to modal window
            resolve: {
                company: function () {
                    return _company; // send item with company data to modal window
                }
            }
        });
// Function that return reult from modal
        ModalInstance.result.then(function (ListDefinition, newQuery) {
            $scope.originalList = ListDefinition;
            $scope.filteredList = ListDefinition;
            $scope.query = newQuery;
        });
    };
});
// Controller of delete modal window
AngularModule.controller('InstanceControllerCompany', function ($http, $scope, $uibModalInstance, $filter, company) {

    $scope.company = company;

    $scope.ok = function (Id) {
        var index = -1;
        var comArr = eval($scope.originalList);
        for (var i = 0; i < comArr.length; i++) {
            if (comArr[i].Id == company.Id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            alert("Something gone wrong");
        } else {
            $http({
                method: 'DELETE',
                url: '/api/Account/' + company.Id,
            })
                 .then(function (response) {
                    console.log('Company was deleted succesfully');
                 }, function (rejection) {
             console.log('Company was not deleted');
       });

            $scope.originalList.splice(index, 1);
            $scope.query = "";
        }
    
        $uibModalInstance.close($scope.originalList, $scope.query);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
// Controller that works with editCompany.html
AngularModule.controller("companyControllerEdit", function ($scope, $http, $httpParamSerializer, ApiCall, $filter, $uibModal, srvShareData,$location, authService) {
    $scope.prop = { // validation property
       noValid: false,
    };
    $scope.inProgress = true;
// Gets role of current user and redirect if not admin
    $scope.checkIsAdmin = function () {
        authService.getUserRolesNoAuthorizen().then(function (data) {
            if (!data.includes("Admin")) {
                $location.path('error');
            }
        });
    };
    $scope.checkIsAdmin();
    $scope.confirmation = false;
// Generate address list using google maps api
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), {
        types: ['geocode']
    });
// Data from sessionStorage about company
    $scope.sharedData = srvShareData.getData();
    $scope.User = {}
// Gets data about company by id
    $http.get('/api/user/' + $scope.sharedData.Id).then(function (response) {
        $scope.User = response.data
        $scope.inProgress = false;
        $scope.parsedDateOfUser = $filter('date')(new Date($scope.User.Birthday), 'MM/dd/yyyy');
    });
// Open modal edit confirmation window
    $scope.openModal = function () {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'ModalCompanyConfirmation.html',
            controller: 'InstanceConfirmationController',
            backdrop: true, 
            scope: $scope // send scope values to modal window
        });
// Return result from confirmation window
        ModalInstance.result.then(function (ConfirmationStatus) {
            $scope.confirmation = ConfirmationStatus;
            var place = autocomplete.getPlace();
            if ($scope.confirmation) {
// Update of company table
            $http({
                method: 'PUT',
                url: 'api/companies/updates',
                data: $.param({
                    Id: $scope.sharedData.Id,
                    Longitude: (place === undefined) ? $scope.sharedData.Longitude : place.geometry.location.lng(),
                    Latitude: (place === undefined) ? $scope.sharedData.Latitude : place.geometry.location.lat()
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).
              success(function (data) { console.log('Company was updated succesfully '); }).
              error(function (data) { console.log('Company was NOT updated succesfully') });
// Update of user fields
            $http({
                method: 'PUT',
                url: '/api/User/Update',
                data: $.param({
                    Id: $scope.User.Id,
                    FullName: $scope.User.FullName,
                    Birthday: $("#DateOfBirth").val(),
                    Description: $scope.User.Description,
                    Address: $("#autocomplete").val(),
                    WebSite: $scope.User.WebSite,
                    UserName: $scope.User.UserName
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).
         success(function (data) { console.log('Users data was succesfully updated'); window.location.href = "/company"; }).
         error(function (data) { console.log('Users data was NOT succesfully updated') });
            };
        });
    };
    $scope.backToCompanyList = function () {
        window.location.href = "/company";
    };
});
