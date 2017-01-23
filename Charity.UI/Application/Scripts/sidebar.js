$(document).ready(function () {
    //Default to close all
    $(".panel-body").toggle();

    // Event when you click on the button
    $(".panel-heading").click(function () {
        $(this).nextAll().toggle(250);
    });
});