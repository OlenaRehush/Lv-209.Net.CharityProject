AngularModule.controller("userListController", function ($scope, $http, ApiCall, $filter, $uibModal, $location, authService) {
    {   // checking Admin role
        $scope.checkIsAdmin = function () {
            authService.getUserRolesNoAuthorizen().then(function (data) {
                if (!data.includes("Admin")) {
                    $location.path('error');
                }
            });
        };
        $scope.checkIsAdmin();
    }

    $scope.user = { name: "" }
    $scope.query = "";
    $scope.animationsEnabled = true;
    $scope.originalList = [];
    $scope.banList = [];
    $scope.filteredList = $scope.originalList;
    $scope.successfully = "Deleted succesfully";
    $scope.errorDelete = "Delete error";

    $scope.formData = {};
    $scope.ll = {}; // save Longitude, Lattitude for Companies, Organizations

    /// <summary>
    /// Get all ApplicationUsers from DB, fill list for table
    /// </summary>
    var result = ApiCall.GetApiCall('/api/users/allusers').success(function (data) {
        $scope.originalList = data;
        $scope.filteredList = $scope.originalList;
        $scope.filterUserBanList(data);
    });

    /// <summary>
    /// Checking isBanned of ApplicationUser, disable or enable buttons by status
    /// </summary>
    $scope.filterUserBanList = function (data) {

        $scope.banList = data;

        for (var i = 0; i < $scope.banList.length; i++) {
            if ($scope.banList[i].isBanned.toString() === "false") {
                $scope.banList[i].isBanned = "Ні";
            }
            else if ($scope.banList[i].isBanned.toString() === "true") {
                $scope.banList[i].isBanned = "Так";
            }
        }

        return data;
    };

    /// <summary>
    /// Pagination configuration
    /// </summary>
    $scope.config = {
        itemsPerPage: 5,
        maxPages: 5,
        fillLastPage: true
    }

    $scope.banOptions = "Так";

    $scope.updateFilteredList = function () {
        $scope.filteredList = $filter("filter")($scope.originalList, $scope.query);
    };

    /// <summary>
    /// Delete Company from DB
    /// </summary>
    $scope.removeCompany = function (Id) {
        $http({
            method: 'DELETE',
            url: '/api/Account/' + Id,
        })
             .then(function (response) {
                 console.log('Company was deleted succesfully');
             }, function (rejection) {
                 console.log('Company was not deleted');
             });

        // Remove item from table, update list of users 
        var index = -1;
        var comArr = eval($scope.originalList);
        for (var i = 0; i < comArr.length; i++) {
            if (comArr[i].Id == Id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            alert("Something gone wrong");
        }
        $scope.originalList.splice(index, 1);
        $scope.updateFilteredList();
    };

    $scope.add = function () {
        $scope.originalList.push({ Latitude: $scope.ll.lat, Longitude: $scope.ll.lon });
        $scope.updateFilteredList();
    };

    /// <summary>
    /// Create modal window for edit info
    /// </summary>
    $scope.openModal = function (_company) {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myModal.html',
            controller: 'InstanceController',
            backdrop: false,
            scope: $scope,
            resolve: {
                company: function () {
                    return _company;
                }
            }
        });

        ModalInstance.result.then(function (res1, res2) {
            $scope.originalList = res1;
            $scope.filteredList = res1;
            $scope.query = res2;
        });
    };

    /// <summary>
    /// Create modal window for Ban, UnBan 
    /// </summary>
    $scope.openModalForBan = function (_user) {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'banModal.html',
            controller: 'InstanceBanController',
            backdrop: false,
            scope: $scope,
            resolve: {
                user: function () {
                    return _user;
                }
            }
        });

        ModalInstance.result.then(function (res1, res2) {
            $scope.originalList = res1;
            $scope.filteredList = res1;
            $scope.query = res2;
        });
    };

});

/// <summary>
/// Delete ApplicationUser By passed ID from DB
/// </summary>
AngularModule.controller('InstanceController', function ($http, $scope, $uibModalInstance, $filter, company) {

    $scope.customer = company;

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
        }
        $http({
            method: 'DELETE',
            url: '/api/Account/' + company.Id,
        })
       .then(function (response) {
           console.log('User was deleted succesfully');
       }, function (rejection) {
           console.log('User was not deleted');
       });

        $scope.originalList.splice(index, 1);
        $scope.query = "";
        $uibModalInstance.close($scope.originalList, $scope.query);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

/// <summary>
/// Ban or UnBan ApplicationUser
/// </summary>
AngularModule.controller('InstanceBanController', function ($http, $scope, $uibModalInstance, $filter, user) {

    $scope.user = user;

    // Remove item from table after action
    $scope.ok = function (Id) {
        var index = -1;
        var comArr = eval($scope.originalList);
        for (var i = 0; i < comArr.length; i++) {
            if (comArr[i].Id == user.Id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            alert("Something gone wrong");
        }

        $http({
            method: 'PUT',
            url: '/api/ban',
            data: $.param({
                Id: $scope.user.Id,
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).
           success(function (data) { console.log('Users was banned'); window.location.href = "/users"; }).
           error(function (data) { console.log('Users was NOT  banned') });

        $scope.query = "";
        $uibModalInstance.close($scope.originalList, $scope.query);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});