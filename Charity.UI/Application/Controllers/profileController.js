AngularModule.controller('profilePageController', profilePageController);

profilePageController.$inject = ['$scope', '$http', 'ApiCall', '$routeParams', 'authService'];

function profilePageController($scope, $http, ApiCall, $routeParams, authService) {
    $scope.prop = {
        isUser : false,
        isOrg : false,
        isComp: false,
        isAdmin: false,
        message : '',
        inProgress : false,
        openEditForm: false,
        page: 1,
        Change : false,
        inProgress: false,
        NoValid: false,
        isEditNeed: false,
        isReady: false,
        error: false,
    };

    $scope.user = {
        FullName: '',
        Birthday: '',
        Description: '',
        PhotoURL: '',
        PhoneNumber: '',
        Address: '',
        WebSite: '',
        IsHiden: ''
    };
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), {
        types: ['geocode']
    });

    $scope.Redirect = {}

    $scope.Redirect.Need = function (id) {
        window.location.href = "/need/" + id;
    };

    $scope.getRoles = function () {
        authService.getUserRolesNoAuthorizen().then(function (data) {
            if (data.includes("Admin")) $scope.prop.isAdmin = true;
            if (data.includes("User")) $scope.prop.isUser = true;
            if (data.includes("Organization")) $scope.prop.isOrg = true;
            if (data.includes("Company")) $scope.prop.isComp = true;
        })
    };

    $scope.getRoles();

    $scope.GetUserInfo = $http.get('api/Account/UserInfo').then(function (response) {
        $scope.prop.isReady = true;
        $scope.user = response.data;
        $scope.list = $scope.user.Needs;
        $scope.user.Birthday.Day = $scope.user.Birthday.Day < 9 ? '0' + $scope.user.Birthday.Day : $scope.user.Birthday.Day;
        $scope.user.Birthday.Month = $scope.user.Birthday.Month < 9 ? '0' + $scope.user.Birthday.Month : $scope.user.Birthday.Month;

    }, function (responseData) {
        $scope.prop.message = responseData.data;
    });

    $scope.GetUserInfo;

    $scope.cancel = function () {
        window.location.href = "/profile";
    };

    $scope.edit = function () {
        window.location.href = "/editProfile";
    };
    //When user click on 'Зберегти', save new data if input of file is filled upload this file on server and set as user photo
    $scope.update = function () {
        $scope.prop.inProgress = true;
        if (Files[0] != undefined && $scope.FileUploaded == true) {
            $http({
                method: 'POST',
                async: false,
                url: '/api/upload',
                processData: false,
                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("User", $scope.form.image);
                    formData.append("Id", $scope.user.Id + '.jpg');
                    return formData;
                },
                data: $scope.form,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function successCallback(response) {
                $scope.user.PhotoURL = response.data;
                UpdateUserInfo();
                return;
            }, function errorCallback(response) {
                return;
            });
        }
        else {
            UpdateUserInfo();
        }
    };

    function UpdateUserInfo()
    {
        $http({
            method: 'PUT',
            async: true,
            url: 'api/Account/Update',
            data: $.param({             
                FullName: $scope.user.FullName,
                PhoneNumber: $scope.user.PhoneNumber,
                Address: $scope.user.Address,
                Birthday: $("#DateOfBirth").val(),
                WebSite: $scope.user.WebSite,
                Description: $scope.user.Description,
                PhotoURL: $scope.user.PhotoURL
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).
               success(function (data) {
                   console.log('Дані профілю успішно оновлені'); window.location.href = "/profile";
               }).
               error(function (data) {
                   console.log('Дані профілю не було оновлено');
                   $scope.prop.message = responseData.data;
                   $scope.prop.inProgress = false;
               });
    }


    // Company methods

    $scope.Resource = {}

    $scope.Resource.Model = {
        Name: '',
        Description: '',
        ImageLink: ''
    };

    $scope.Resource.modelToChange = {};

    $scope.Resource.Add = function () {
        $scope.prop.inProgress = true;
        $http({
            method: 'PUT',
            url: 'api/Company/AddResource',
            data: $.param($scope.Resource.Model),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).
           success(function (data) {
               $scope.prop.openEditForm = false; window.location.href = "/profile";
           }).
           error(function (data) {
               $scope.message = responseData.data;
               $scope.prop.inProgress = false;
           });
    };

    $scope.Resource.Edit = function (model) {
        $scope.prop.openEditForm = true;
        $scope.prop.Change = true;
        $scope.Resource.modelToChange = model;
        
        $scope.Resource.Model.Name = $scope.Resource.modelToChange.Name;
        $scope.Resource.Model.Description = $scope.Resource.modelToChange.Description;
        $scope.Resource.Model.ImageLink = $scope.Resource.modelToChange.ImageLink;
    };

    $scope.Resource.Edit.PendingChanges = function () {
        $scope.Resource.modelToChange.Name = $scope.Resource.Model.Name;
        $scope.Resource.modelToChange.Description = $scope.Resource.Model.Description;
        $scope.Resource.modelToChange.ImageLink = $scope.Resource.Model.ImageLink;

        $http({
            method: 'PUT',
            url: 'api/Company/EditResource',
            data: $.param($scope.Resource.modelToChange),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            $scope.prop.openEditForm = false;
            $scope.prop.Change = false;
            $scope.Resource.CleanForm();

        }).error(function (data) {
            $scope.prop.message = responseData.data;
            $scope.prop.inProgress = false;
        });
    };

    $scope.Resource.Delete = function () {
        $http({
            method: 'PUT',
            url: 'api/Company/DeleteResource',
            params: { Id: $scope.Resource.modelToChange.Id },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            $scope.prop.openEditForm = false;
            $scope.prop.Change = false; window.location.href = "/profile";
        }).error(function (data) {
            $scope.prop.message = responseData.data;
            $scope.prop.inProgress = false;
        });
    };

    $scope.Resource.CleanForm = function () {
        $scope.Resource.Model = {
            Name: '',
            Description: '',
            ImageLink: ''
        };
        $scope.prop.NoValid = false;
        $scope.prop.Change = false;
    };

    //Organization methods

    $scope.Need = {}
    
    $scope.Need.Model = {
        Name: '',
        DateCreated: '',
        DateEnd: '',
        TypeOfNeed: { Id: 0},
        ImageLink: '',
        Description: ''
    };
    $scope.prop = {};
    $scope.prop.stateItem = {};

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

    $scope.Feedback = {
        NeedId: 0,
        VolunteerId: 0,
        Photos: {
            Type: 0,
            Data: '',
        },
        Video: {
            Type: 1,
            Data: '',
        },
        Feedback: {
            Type: 2,
            Data: '',
        },
        Grade: 1,
    };

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

    $scope.Need.NeedModelToChange = {};

    $scope.Need.Add = function () {
        $scope.prop.inProgress = true;
        $http({
            method: 'PUT',
            url: 'api/Organization/AddNeed',
            data: $.param($scope.Need.Model),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).
           success(function (data) {
               window.location.href = "/profile";
           }).
           error(function (data) {
               $scope.message = responseData.data;
               $scope.prop.inProgress = false;
           });
    };

    $scope.Need.Edit = function (model) {

        $scope.prop.isEditNeed = true;
        $scope.prop.Change = true;
        $scope.Need.Model.State = 0;
        $scope.Need.Model = $scope.Need.Refresh($scope.Need.Model);
    };

    $scope.Need.Edit.PendingChanges = function () {
        var newModel = $scope.Need.Model;
        newModel.NeedRequests = {};
        $http({
            method: 'PUT',
            url: 'api/Organization/EditNeed',
            data: $.param($scope.Need.Model),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            $scope.prop.Change = false;
            $scope.prop.inProgress = false;
            $scope.Need.CleanForm(); window.location.href = "/profile";

        }).error(function (responseData) {
            $scope.prop.message = responseData.Message;
            $scope.prop.inProgress = false;
        });
    };

    $scope.Need.Cancel = function () {
        $scope.prop.inProgress = true;
        $scope.Need.Model.State = 2;
        $scope.Need.Model = $scope.Need.Refresh($scope.Need.Model);
        $scope.Need.Edit.PendingChanges();
    };

    $scope.Need.CleanForm = function () {
        $scope.Need.Model = {
            Name: '',
            DateCreated: '',
            DateEnd: '',
            DateEnd: '',
            TypeOfNeed: {},
            Description: '',
            ImageLink: '',
            NeedRequest: {},
        };
        
    };

    $scope.KeepModel = function (model) {
        if (model.State != 2) {
            $scope.prop.page = 1;
            $scope.Need.Model = model;

            if (model.State == 0) {
                $scope.Need.Edit(model);
            }
            else {
                $scope.prop.NoValid = false;
                $scope.prop.Change = false;
                $scope.prop.isEditNeed = false;
            }
        }
    };

    $scope.Need.Refresh = function (model) {
        var newModel = {}
        newModel.TypeOfNeed = {}
        newModel.Name = model.Name;
        newModel.DateCreated = model.DateCreated;
        newModel.TypeOfNeed.Id = model.TypeOfNeed.Id;
        newModel.ImageLink = model.ImageLink;
        newModel.Description = model.Description;
        newModel.State = model.State;
        newModel.Id = model.Id;
        newModel.NeedRequests = model.NeedRequests;
        return newModel;
    };

    $scope.Need.ChooseUser = function (request) {
        if($scope.Need.Model.State == 0)
        {
            $scope.prop.inProgress = true;
            var newReq = {
                Id: request.Id,
                Status: true,
                Date: request.Date,
                Phone: request.Phone,
                IsAnonymous: request.IsAnonymous,
                Description: request.Description,
            };
            $http({
                method: 'PUT',
                url: 'api/NeedRequest/Update',
                data: $.param(newReq),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).
           success(function (data) {
               window.location.href = "/profile";
           }).
           error(function (data) {
               $scope.message = responseData.data;
               $scope.prop.inProgress = false;
           });
        }
    };

    $scope.Need.CancelChoose = function (request) {
        if ($scope.Need.Model.State == 3 && request.Status == true) {
            $scope.prop.inProgress = true;
            var cancelReq = {
                Id: request.Id,
                Status: false,
                Date: request.Date,
                Phone: request.Phone,
                IsAnonymous: request.IsAnonymous,
                Description: request.Description,
            };
            $http({
                method: 'PUT',
                url: 'api/NeedRequest/Update',
                data: $.param(cancelReq),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).
           success(function (data) {
               window.location.href = "/profile";
           }).
           error(function (data) {
               $scope.message = responseData.data;
               $scope.prop.inProgress = false;
           });
        }
    };

    $scope.Need.Confirm = function () {
        var request = {};
        for (var i = 0; i < $scope.Need.Model.NeedRequests.length; i++) {
            if ($scope.Need.Model.NeedRequests[i].Status == true)
                request = $scope.Need.Model.NeedRequests[i];
        }
        if (request != null) {
            //Forming feedback
            $scope.Feedback.NeedId = $scope.Need.Model.Id;
            $scope.Feedback.VolunteerId = request.User.Id;

            if ($scope.Need.Model.State == 3 && request.Status == true) {
                $scope.prop.inProgress = true;

                $http({
                    method: 'PUT',
                    url: 'api/Organization/ConfirmNeed',
                    data: $.param($scope.Feedback),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).
               success(function (data) {
                   window.location.href = "/profile";
               }).
               error(function (data) {
                   $scope.message = responseData.data;
                   $scope.prop.inProgress = false;
               });
            }
        }
        else
        {
            alert('Не вдалось знайти волонтера що виконує цю потребу');
        }
    };
    $scope.form = [];
    $scope.files = [];
    $scope.FileUploaded = false;
    //Upload on form user image
    $scope.uploadImage = function () {
        if (Files[0] != undefined)
            $scope.FileUploaded = true;
        else {
            $scope.FileUploaded = false;
            return;
            }
        if (Files[0].size > 2000000)
        {
            alert("Файл занадто великий");
            return;
        }
        $scope.form.image = Files[0];
        var reader = new FileReader();

        reader.onload = function (event) {
            $scope.image_source = event.target.result
            $scope.$apply(function ($scope) {
                $scope.files = Files;
            });
        }
        reader.readAsDataURL(Files[0]);
    }
    //Upload Need Image on Server
    $scope.uploadNeedImageAdd = function () {
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
            $scope.image_source_needAdd = event.target.result
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
            $scope.Need.Model.ImageLink = response.data;
            $scope.image_source_needAdd = null;
            return;
        }, function errorCallback(response) {
            return;
        })
    }
    //Change need image resource
    $scope.uploadNeedImageEdit = function () {
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
            $scope.image_source_needEdit = event.target.result
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
            $scope.Need.Model.ImageLink = response.data;
            $scope.image_source_needEdit = null;
            return;
        }, function errorCallback(response) {
            return;
        })
    }
    //Upload image of resource
    $scope.uploadResourceImage = function () {
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
            $scope.image_source_resource = event.target.result
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
                formData.append("Resource", $scope.form.image);
                return formData;
            },
            data: $scope.form,
            headers: {
                'Content-Type': undefined
            }
        }).then(function successCallback(response) {
            $scope.Resource.Model.ImageLink = response.data;
            $scope.image_source_resource = null;
            return;
        }, function errorCallback(response) {
            return;
        })
    }
    //Upload image report of need
    $scope.uploadReportImage = function () {
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
            $scope.image_source_report = event.target.result
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
                formData.append("NeedReport", $scope.form.image);
                return formData;
            },
            data: $scope.form,
            headers: {
                'Content-Type': undefined
            }
        }).then(function successCallback(response) {
            $scope.Feedback.Photos.Data = response.data;
            $scope.image_source_report = null;
            return;
        }, function errorCallback(response) {
            return;
        })
    }
};