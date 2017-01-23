AngularModule.service('shareNeedData', function ($window) {
    var KEY = 'App.SelectedValue';
    var mydata =
          {
              Id: '',
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
AngularModule.controller("needsController", function ($scope, $http, ApiCall, $filter, $uibModal, $location, shareNeedData) {
    $scope.dataToShare =
       {
           Id: '',
       };

    $scope.shareMyData = function (myValue) {
        $scope.dataToShare = myValue;
        shareNeedData.addData($scope.dataToShare);
        window.location.href = "/editNeeds";
    }
    $scope.originalList = [];
    $scope.filteredList = $scope.originalList;
    $scope.successfully = "Deleted succesfully";
    $scope.errorDelete = "Delete error";


    var result = ApiCall.GetApiCall('/api/needs/allneeds').success(function (data) {
        $scope.originalList = data;
        $scope.filteredList = $scope.originalList;
    });
    $scope.config = {
        itemsPerPage: 5,
        maxPages: 5,
        fillLastPage: true
    }

    $scope.updateFilteredList = function () {
        $scope.filteredList = $filter("filter")($scope.originalList, $scope.query);
    };

    $scope.add = function () {
        $scope.originalList.push({ Latitude: $scope.ll.lat, Longitude: $scope.ll.lon });
        $scope.updateFilteredList();
    };
    
    $scope.createNewNeed = function () {
        alert("");
    };

    $scope.openModal = function (_organization) {
        var ModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'ModalNeeds.html',
            controller: 'InstanceControllerNeedsAdmin',
            backdrop: true,
            scope: $scope,
            resolve: {
                organization: function () {
                    return _organization;
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
AngularModule.controller('InstanceControllerNeedsAdmin', function ($http, $scope, $uibModalInstance, $filter, organization) {

    $scope.organization = organization;

    $scope.ok = function (Id) {
        var index = -1;
        var comArr = eval($scope.list);
        for (var i = 0; i < comArr.length; i++) {
            if (comArr[i].Id == organization.Id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            alert("Something gone wrong");
        }
        $http({
            method: 'DELETE',
            url: '/api/needs/' + organization.Id,
        })
       .then(function (response) {
           console.log('Need was deleted succesfully');
       }, function (rejection) {
           console.log('Need was not deleted');
       });

        $scope.list.splice(index, 1);
        $scope.query = "";
        $uibModalInstance.close($scope.list, $scope.query);
    };
    $scope.cancel = function () {        
        $uibModalInstance.dismiss('cancel');
    };
});


