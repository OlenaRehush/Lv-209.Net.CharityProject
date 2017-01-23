AngularModule.controller('needPageController', needPageController);

needPageController.$inject = ['$scope', '$http', 'ApiCall', '$routeParams'];
function needPageController($scope, $http, ApiCall, $routeParams, shareNeedData) {

    // get need by id 
    var result = ApiCall.GetApiCall('/api/needs/getneed?id=' + $routeParams.needId).success(function (data) {
        $scope.need = data;
    })
    .then(function () {
    // if state of need is Виконано, show block with media
        if ($scope.need.Status === "Виконано") {
            document.getElementById('mediaBlock').style.display = "block";
        }
    // send data to perform page
        $scope.performneed = function (myValue) {
            $scope.dataToShare = myValue;
            shareNeedData.addData($scope.dataToShare);
            window.location.href = "/perform";
        }

    });

    // photo slider
    jQuery(document).ready(function ($) {

        $('#checkbox').change(function () {
            setInterval(function () {
                moveRight();
            }, 3000);
        });

        var slideCount = $('#slider ul li').length;
        var slideWidth = $('#slider ul li').width();
        var slideHeight = $('#slider ul li').height();
        var sliderUlWidth = slideCount * slideWidth;

        $('#slider').css({ width: slideWidth, height: slideHeight });

        $('#slider ul').css({ width: sliderUlWidth, marginLeft: -slideWidth });

        $('#slider ul li:last-child').prependTo('#slider ul');

        function moveLeft() {
            $('#slider ul').animate({
                left: +slideWidth
            }, 200, function () {
                $('#slider ul li:last-child').prependTo('#slider ul');
                $('#slider ul').css('left', '');
            });
        };

        function moveRight() {
            $('#slider ul').animate({
                left: -slideWidth
            }, 200, function () {
                $('#slider ul li:first-child').appendTo('#slider ul');
                $('#slider ul').css('left', '');
            });
        };

        $('a.control_prev').click(function () {
            moveLeft();
        });

        $('a.control_next').click(function () {
            moveRight();
        });

    });

}