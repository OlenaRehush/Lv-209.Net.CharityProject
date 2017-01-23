AngularModule.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

// Service for sharing data between organization,company pages and edit page
AngularModule.service('srvShareData', function ($window) {
    var KEY = 'App.SelectedValue';
    var mydata =
          {
              Id: '',
              Name: '',
              Address: '',
              Longitude: '',
              Latitude: '',
              WebSite: ''
          };
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
// Controller that works with organization.html
AngularModule.controller("organizationController", function ($scope, $http, ApiCall, $filter, $uibModal, $location, srvShareData) {

    $scope.User = {}
    $scope.inProgress = true;
    $scope.dataToShare =
          {
              Id: '',
              Name: '',
              Address:'',
              Longitude: '',
              Latitude: '',
              WebSite: ''
          };

    // Share data about organization to editOrganization page
    $scope.shareMyData = function (myValue) {
        $scope.dataToShare = myValue;
        srvShareData.addData($scope.dataToShare);
        window.location.href = "/editOrganization";
    }
 
    $scope.query = "";
    $scope.animationsEnabled = true; // animation for popup window
    $scope.originalList = []; // Organization list
    $scope.filteredList = $scope.originalList;
    $scope.successfully = "Deleted succesfully";
    $scope.errorDelete = "Delete error";
    $scope.AdminRole = false;

    // Get all Organization from DB, checking role for this action
    var result = $http.get('/api/organizations/allorganizations').success(function (data) {
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

    // Pagination configuration
    $scope.config = {
        itemsPerPage: 5,
        maxPages: 5,
        fillLastPage: false
    }

    // Update list of Organizations
    $scope.updateFilteredList = function () {
        $scope.filteredList = $filter("filter")($scope.originalList, $scope.query);
    }; 

    $scope.add = function () {
        $scope.originalList.push({ Latitude: $scope.ll.lat, Longitude: $scope.ll.lon });
        $scope.updateFilteredList();
    };

    // Modal window for deleting Organization
    $scope.openModal = function (_organization) {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'ModalOrganization.html',
            controller: 'InstanceControllerOrganization',
            backdrop: true,  
            scope: $scope, // send scope values to modal window
            resolve: {
                organization: function () {
                    return _organization; // send organization item to modal 
                }
            }
        });

        // Reftesh list after deleting Organizations
        ModalInstance.result.then(function (ListDefinition, newQuery) {
            $scope.originalList = ListDefinition;
            $scope.filteredList = ListDefinition;
            $scope.query = newQuery;
        });
    };
});
// Controller of delete modal window
AngularModule.controller('InstanceControllerOrganization', function ($http, $scope, $uibModalInstance, $filter, organization) {

    $scope.organization = organization;

    // Delete Organization by Id
    $scope.ok = function (Id) {
        var index = -1;
        var comArr = eval($scope.originalList);
        for (var i = 0; i < comArr.length; i++) {
            if (comArr[i].Id == organization.Id) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            alert("Something gone wrong");
        } else {
            $http({
                method: 'DELETE',
                url: '/api/Account/' + organization.Id,
            })
                  .then(function (response) {
                        console.log('Organization was deleted succesfully');
                 }, function (rejection) {
                       console.log('Organization was not deleted');
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
///Controller that works with editOrganization.html
AngularModule.controller("organizationControllerEdit", function ($scope, $http, $httpParamSerializer, ApiCall, $filter, $uibModal, srvShareData, $location, authService) {

    $scope.prop = {    // validation status
        noValid: false,
    };

    $scope.inProgress = true;
    // Gets role of current user
    $scope.checkIsAdmin = function () {
        authService.getUserRolesNoAuthorizen().then(function (data) {
            if (!data.includes("Admin")) {
                $location.path('error');
            }
        });
    };

    $scope.checkIsAdmin();
    $scope.animationsEnabled = true;
    $scope.confirmation = false;
    // Generate list of places in google map autocomplete input
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), {
        types: ['geocode']
    });

    $scope.sharedData =
       {
           Id: '',
           Name: '',
           Address: '',
           Longitude: '',
           Latitude: '',
           WebSite: ''
       };

    $scope.sharedData = srvShareData.getData();
    $scope.User = {}
    // Gets data about organization from user table
    $http.get('/api/user/' + $scope.sharedData.Id).then(function (response) {
        $scope.User = response.data;
        $scope.inProgress = false;
        $scope.parsedDateOfUser = $filter('date')(new Date($scope.User.Birthday), 'MM/dd/yyyy');

    });
    // Open confirmation edit windows
    $scope.openModal = function () {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'ModalConfirmation.html',
            controller: 'InstanceConfirmationController',
            backdrop: true,
            scope: $scope
        });

        // Update information about Organizations
        ModalInstance.result.then(function (ConfirmationStatus) {
            $scope.confirmation = ConfirmationStatus;
            var place = autocomplete.getPlace();
            if ($scope.confirmation) {
                // Update in organization table
                $http({
                    method: 'PUT',
                    url: '/api/organizations/updates',
                    data: $.param({
                        Id: $scope.sharedData.Id,
                        Longitude: (place === undefined) ? $scope.sharedData.Longitude : place.geometry.location.lng(),
                        Latitude: (place === undefined) ? $scope.sharedData.Latitude : place.geometry.location.lat()
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).
                  success(function (data) { console.log('Organization table was updated succesfully'); }).
                  error(function (data) { console.log('Organization table was NOT updated succesfully') });
                // Update of user
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
                   success(function (data) { console.log('Users data was succesfully updated'); window.location.href = "/organization" }).
                   error(function (data) { console.log('Users data was NOT succesfully updated') });

            };
        });
    };
    $scope.backToOrganizationList = function () {
        window.location.href = "/organization";
    };
});
// Controller that works with  confirmation modal window on edit organization info page
AngularModule.controller('InstanceConfirmationController', function ($http, $scope, $uibModalInstance, $filter) {
    $scope.ok = function ()  {
        $scope.confirmation = true;
        $uibModalInstance.close($scope.confirmation);
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});