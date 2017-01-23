
AngularModule.controller("socialWorkerController", function ($scope, $http, ApiCall, $filter, $uibModal, $location, authService, srvShareSocialWorkerData) {
    {
        // Checking roles for access to this page
        $scope.checkIsAdmin = function () {
            authService.getUserRolesNoAuthorizen().then(function (data) {
                if (!data.includes("Admin")) {
                    $location.path('error');
                }
            });
        };
        $scope.checkIsAdmin();
    }

    $scope.inProgress = true;
    $scope.dataToShare =
          {
              Id: ''
          };

    /// <summary>
    /// Share data for other window for update information about SocialWorker
    /// </summary>
    $scope.shareMyData = function (myValue) {

        $scope.dataToShare = myValue;
        srvShareSocialWorkerData.addData($scope.dataToShare);
        window.location.href = "/SocialWorker/Update";
    }

    $scope.AddNew = function () {
        srvShareSocialWorkerData.addData(null);
        window.location.href = "/SocialWorker/Update";
    }

    $scope.query = "";
    $scope.animationsEnabled = true;
    $scope.originalList = []; // SocialWorker list
    $scope.filteredList = $scope.originalList;
    $scope.successfully = "Deleted succesfully";
    $scope.errorDelete = "Delete error";
    $scope.AdminRole = false;

    /// <summary>
    /// Get list of socialworkers form DB, checking roles for this operation
    /// </summary>
    var result = $http.get('/api/socialworkers/all').success(function (data) {
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

    // Update list 
    $scope.updateFilteredList = function () {
        $scope.filteredList = $filter("filter")($scope.originalList, $scope.query);
    };

    // Modal window for confirmation Delete SocialWorker
    $scope.openModal = function (_socialWorker) {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'ModalOrganization.html',
            controller: 'InstanceControllerWorkers',
            backdrop: true,
            scope: $scope, // send scope values to modal window
            resolve: {
                socialWorker: function () {
                    return _socialWorker;  // send data about social worker to modal window
                }
            }
        });
        // Update list after SocialWorker was deleted 
        ModalInstance.result.then(function (ListDefinition, newQuery) {
            $scope.originalList = ListDefinition;
            $scope.filteredList = ListDefinition;
            $scope.query = newQuery;
        });
    };
});

// Service for sharing data for other windows, pages
AngularModule.service('srvShareSocialWorkerData', function ($window) {
    var KEY = 'App.SelectedValue';
    var mydata =
          {
              Id: '',
              Longitude: '',
              Latitude: ''
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

AngularModule.controller('InstanceControllerWorkers', function ($http, $scope, $uibModalInstance, $filter, socialWorker) {

    $scope.socialWorker = socialWorker;

    // Delete SocialWorker from DB by Id, refresh list after SocialWorker was deleted
    $scope.ok = function (Id) {
        var index = -1;
        var comArr = eval($scope.originalList);
        for (var i = 0; i < comArr.length; i++) {
            if (comArr[i].Id == socialWorker.Id) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            alert("Something gone wrong");
        } else {
            $http({
                method: 'DELETE',
                url: '/api/SocialWorker/' + socialWorker.Id,
            })
      .then(function (response) {
          console.log('Social worker was deleted succesfully');
      }, function (rejection) {
          console.log('Social worker was not deleted');
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

AngularModule.controller("UpdateSocialWorkerController", function ($scope, $http, $httpParamSerializer, ApiCall, $filter, $uibModal, $location, authService, srvShareSocialWorkerData) {

    $scope.prop = {
        inProgress: false,
        NoValid: false,
        upload: false,
        isEdit: false,
        spheres: [],
    }

    // Get SocialWorker after sharing data
    $scope.sharedData = srvShareSocialWorkerData.getData();

    if ($scope.sharedData != null && $scope.sharedData.Id != null) {
        $scope.prop.upload = false;
        $http.get('/api/SocialWorker/' + $scope.sharedData.Id).then(function (response) {
            $scope.Worker = response.data;
            $scope.prop.isEdit = true;

            if ($scope.Worker.Sphere.length != 0) {
                for (var i = 0; i < $scope.Worker.Sphere.length; i++) {
                    $scope.prop.spheres.push(String($scope.Worker.Sphere[i].Type.Id));
                }
            }

            $scope.prop.upload = true;
        });
    }
    else {
        $scope.prop.upload = true;
        $scope.prop.isEdit = false;
    };

    $scope.checkIsAdmin = function () {
        authService.getUserRolesNoAuthorizen().then(function (data) {
            if (!data.includes("Admin")) {
                $location.path('error');
            }
        });
    };

    $scope.checkIsAdmin();

    // Get coordinates by addrress
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), {
        types: ['geocode']
    });

    $scope.Worker =
    {
        Name: '',
        Description: '',
        Rating: '',
        Email: '',
        PhoneNumber: '',
        ImageLink: '',
        Address: '',
        Gender: ''
    }

    // Add a new SocialWorker, preparing SocialWorker model for passing to WEB API
    $scope.addWorker = function () {
        $scope.prop.inProgress = true;
        $scope.prop.NoValid = true;
        var place = autocomplete.getPlace();
        var spherList = [];
        spherList.Type = {};
        for (var i = 0; i < $scope.prop.spheres.length; i++) {
            spherList.push({ Type: { Id: $scope.prop.spheres[i] } });
        };

        $http({
            method: 'POST',
            url: 'api/SocialWorkers/Add',
            data: $.param({
                Name: $scope.Worker.Name,
                Gender: $scope.Worker.Gender,
                Description: $scope.Worker.Description,
                Rating: $scope.Worker.Rating,
                Email: $scope.Worker.Email,
                Address: $("#autocomplete").val(),
                PhoneNumber: $scope.Worker.PhoneNumber,
                ImageLink: $scope.Worker.ImageLink,
                Longitude: (place === undefined) ? $scope.sharedData.Longitude : place.geometry.location.lng(),
                Latitude: (place === undefined) ? $scope.sharedData.Latitude : place.geometry.location.lat(),
                Sphere: spherList,

            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).
           success(function (data) {
               window.location.href = "/socialWorkers";
           }).
           error(function (data) {
               alert(data.Message);
               $scope.prop.inProgress = false;
           });
    };

    // updateWorker a SocialWorker, preparing SocialWorker model for passing to WEB API
    $scope.updateWorker = function () {
        $scope.prop.inProgress = true;
        $scope.prop.NoValid = true;
        var place = autocomplete.getPlace();
        var spheres = [];
        spheres.Type = {};
        for (var i = 0; i < $scope.prop.spheres.length; i++) {
            spheres.push({ Type: { Id: $scope.prop.spheres[i] } });
        };

        $http({
            method: 'POST',
            url: 'api/SocialWorkers/Update',
            data: $.param({
                Id: $scope.Worker.Id,
                Name: $scope.Worker.Name,
                Gender: $scope.Worker.Gender,
                Description: $scope.Worker.Description,
                Rating: $scope.Worker.Rating,
                Email: $scope.Worker.Email,
                Address: $("#autocomplete").val(),
                PhoneNumber: $scope.Worker.PhoneNumber,
                ImageLink: $scope.Worker.ImageLink,
                Longitude: (place === undefined) ? $scope.sharedData.Longitude : place.geometry.location.lng(),
                Latitude: (place === undefined) ? $scope.sharedData.Latitude : place.geometry.location.lat(),
                Sphere: spheres,

            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).
           success(function (data) {
               window.location.href = "/socialWorkers";
           }).
           error(function (data) {
               alert(data.Message);
               $scope.prop.inProgress = false;
           });
    };

    $scope.backToWorkerList = function () {
        window.location.href = "/socialWorkers";
    };
});
