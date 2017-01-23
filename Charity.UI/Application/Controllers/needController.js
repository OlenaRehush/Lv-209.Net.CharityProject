// Sharing of data between need.html and editNeed.html
AngularModule.service('shareNeedData', function ($window) {
    var KEY = 'App.SelectedValue';
    var mydata = {};
// Adding of data in sessionStorage
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
// Getting of data from sessionStorage
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
// Controller that works woth need.html
AngularModule.controller('needController', function ($scope, $uibModal, $location, $http, ApiCall, shareNeedData) {
// Table column sorting 
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
       
    }
    $scope.AdminRole = false;
    $scope.UserRole = false;
    $scope.inProgress = true;
    $scope.all = true;
    $scope.search = {
        Material: 'Матеріальні',
        Dreams: 'Мрії',
        Voloteer: 'Волонтер'
    }
    $scope.all

    /// <summary>
    /// get all needs from repository through api controller
    /// </summary>
    var result = $http.get('/api/needs/allneeds').success(function (data) {
        $scope.list = data;
        $scope.inProgress = false;
        var userRoles = $http.get('/api/Account/UserRoles').then(function (roles) {
            if (roles.data.includes("Admin")) {
                $scope.AdminRole = true;
            }
            else if (roles.data.includes("User")) {
                $scope.UserRole = true;
            }
            else {
                $scope.message = "У вас не достатньо прав для доступу до цієї сторінки";
            }
        }, function (error) {
            $scope.message = error.data.Message;
        });
    })
    .then(function () {

        // fill status-combobox 
        $scope.stateOptions = {
            stores: [
                { id: 1, name: 'Виконано' },
                { id: 2, name: 'Не виконано' },
                { id: 3, name: 'Відмінено' },
                { id: 4, name: 'Виконується' },
                { id: 5, name: 'Всі статуси' }
            ]
        };

        // select item in combobox
        $scope.stateItem =
            $scope.stateOptions.stores[$scope.stateOptions.stores.length - 1];

        /// <summary>
        /// get all organizations from repository through api controller
        /// </summary>
        var resultOrg = $http.get('/api/organizations/allorganizations').success(function (data) {
            $scope.filterOptions = data;

            // create one more combobox item for all organizations
            var obj = {
                id: 0,
                Name: 'Всі організації'
            };
            $scope.filterOptions.push(obj);
            $scope.inProgress = false;
        })
            .then(function () {

                // select item in combobox(this is default filter)
                $scope.filterItem = {
                    store: $scope.filterOptions[$scope.filterOptions.length - 1]
                }
            });
    });
// After filling of table make sort by Status field
    $scope.reverse = false;  
    $scope.sort('Status');
 
// for saving value of search textbox after reloading
    window.onload = function () {
        var val = sessionStorage.getItem('value');
        document.getElementById("needsSearch").value = val;
        $scope.table = document.getElementById("needsSearch").value;
    }

    window.onbeforeunload = function () {
        sessionStorage.setItem('value', document.getElementById("needsSearch").value);
        $scope.table = document.getElementById("needsSearch").value;
    }

    $scope.dataToShare =
   {
       Id: '',
   };
// Sharing of data to edit page
    $scope.shareMyData = function (myValue) {
        $scope.dataToShare = myValue;
        shareNeedData.addData($scope.dataToShare);
        window.location.href = "/editNeeds";
    }
// Sharing of data to perform page
    $scope.performneed = function (myValue) {
        $scope.dataToShare = myValue;
        shareNeedData.addData($scope.dataToShare);
        window.location.href = "/perform";
    }


    /// <summary>
    /// filter for sorting by state of need
    /// </summary>
    $scope.stateFilter = function (list) {
        if (list.Status == $scope.stateItem.name) {
            return true;
        } else if ($scope.stateItem.name === 'Всі статуси') {
            return true;
        } else {
            return false;
        }
    }

    /// <summary>
    /// filter for sorting by organization of need
    /// </summary>
    $scope.customFilter = function (list) {
        if (list.Organization === $scope.filterItem.store.Name) {
            return true;
        } else if ($scope.filterItem.store.Name === 'Всі організації') {
            return true;
        } else {
            return false;
        }
    };
// Open modal window that confirm need delete status
    $scope.openModal = function (_need) {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'ModalNeeds.html',
            controller: 'InstanceControllerNeeds',
            backdrop: false,
            scope: $scope, // send scope values to modal window
            resolve: {
                need: function () {
                    return _need; // send need item to modal window
                }
            }
        });
// Result returned to basic need page (update of list)
        ModalInstance.result.then(function (ListDefinition) {
            $scope.list = ListDefinition;
        });


    };
});


/// <summary>
/// filter for sorting by type of need
/// </summary>
AngularModule.filter('needType', function () {
    return function (needs, types) {
        var items = {
            types: types,
            out: []
        };
        angular.forEach(needs, function (value, key) {
            for (var prop in types) {
                if (types[prop] === value.TypeOfNeed) {
                    this.out.push(value);
                }
            }
        }, items);
        return items.out;
    };
});
// Delete modal window controller
AngularModule.controller('InstanceControllerNeeds', function ($http, $scope, $uibModalInstance, $filter, need) {

    $scope.need = need;
// search of item in list
    $scope.ok = function (Id) {
        var index = -1;
        var comArr = eval($scope.list);
        for (var i = 0; i < comArr.length; i++) {
            if (comArr[i].Id == need.Id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            alert("Something gone wrong");
        } else {
            $http({
                method: 'DELETE',
                url: '/api/needs/' + need.Id,
            })
        .then(function (response) {
            console.log('Need was deleted succesfully');
        }, function (rejection) {
            console.log('Need was not deleted');
        });

            $scope.list.splice(index, 1);
            $scope.query = "";
        }

        $uibModalInstance.close($scope.list, $scope.query);
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

AngularModule.controller("needControllerEdit", function ($scope, $http, $httpParamSerializer, ApiCall, $filter, $uibModal, shareNeedData, $location, authService) {

    $scope.prop = {        
        noValid: false,
        inProgress: false,
        isReady: false,
    };

    $scope.confirmation = false;
    $scope.checkIsAdmin = function () {
        authService.getUserRolesNoAuthorizen().then(function (data) {
            if (!data.includes("Admin")) {
                $location.path('error');
            }
        });
    };
    $scope.checkIsAdmin();
    $scope.animationsEnabled = true;

    $scope.sharedData =
       {
           Id: '',
       };
    $scope.sharedData = shareNeedData.getData();
    $scope.Need = {}



    $scope.options = [
      {
          name: 'Не виконано',
          code: 0
      },
      {
          name: 'Виконано',
          code: 1
      },
      {
          name: 'Відмінено',
          code: 2
      },
       {
           name: 'Виконується',
           code: 3
       }
    ];

    $http.get('api/neeD/' + $scope.sharedData.Id).then(function (response) {
        $scope.prop.isReady = true;
        $scope.Need = response.data
        console.log($scope.Need);
        angular.forEach($scope.options, function (value, key) {
            if (response.data.State == value.code) {

                $scope.selectedOption = value;

            }
        });
    });

    $scope.openModal = function () {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'ModalNeedConfirmation.html',
            controller: 'InstanceConfirmationController',
            backdrop: true,
            scope: $scope
        });

        ModalInstance.result.then(function (ConfirmationStatus) {
            $scope.confirmation = ConfirmationStatus;
            if ($scope.confirmation) {
                $scope.prop.inProgress = true;
                $http({
                    method: 'PUT',
                    url: '/api/needs/updates',
                    data: $.param({
                        Id: $scope.sharedData.Id,
                        Name: $scope.Need.Name,
                        State: $scope.selectedOption.code,
                        DateCreated: $scope.Need.DateCreated,
                        DateEnd: $scope.Need.DateEnd,
                        Description: $scope.Need.Description,
                        ImageLink: $scope.Need.ImageLink
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).
                  success(function (data) {
                      console.log('Needs table was updated succesfully'); window.location.href = "/need";
                      $scope.prop.inProgress = false;
                  }).
                  error(function (data) {
                      console.log('Organization table was NOT updated succesfully');
                      $scope.prop.inProgress = false;
                  });
            }
            else {
                console.log('Update of need was not confirmed');
            }
        });
    };
    $scope.backToNeedsList = function () {
        window.location.href = "/need";
    };
    $scope.form = [];
    $scope.files = [];
    $scope.FileUploaded = false;
    //Upload image on page "edit need" from admin
    $scope.uploadNeedImage = function () {
        if (Files[0] != undefined)
            $scope.FileUploaded = true;
        else {
            $scope.FileUploaded = false;
            return;
        }
        if (Files[0].size > 1000000) {
            alert("Файл занадто великий");
            return;
        }
        $scope.form.image = Files[0];
        var reader = new FileReader();

        reader.onload = function (event) {
            $scope.image_source_needPreview = event.target.result
            $scope.$apply(function ($scope) {
                $scope.files = Files;
            });
        }
        reader.readAsDataURL(Files[0]);
        $http({
            method: 'POST',
            async: false,
            url: '/api/upload',
            processData: false,
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("Need", $scope.form.image);
                return formData;
            },
            data: $scope.form,
            headers: {
                'Content-Type': undefined
            }
        }).then(function successCallback(response) {
            $scope.Need.ImageLink = response.data;
            $scope.image_source_needPreview = null;
            return;
        }, function errorCallback(response) {
            return;
        })
    }
});