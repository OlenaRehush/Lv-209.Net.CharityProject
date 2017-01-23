function cookieFromCheckbox() {
    var ch = [];
    $("input:checkbox").each(function () {
        var $el = $(this);
        if ($el.prop("checked"))
            ch.push($el.attr("id"));
    });

    $.cookie("checkboxCookie", ch.join(','));
}

function checkboxFromCookie() {
    if ($.cookie("checkboxCookie") == null)
        return;
    var chMap = $.cookie("checkboxCookie").split(',');
    for (var i in chMap)
        $('#' + chMap[i]).prop("checked", true);
}

function clearCookie() {
    $.cookie("checkboxCookie", null);
}

var checkboxCookie = $.cookie("checkboxCookie");
if (checkboxCookie == null) {
    cookieFromCheckbox();
    checkboxCookie = $.cookie("checkboxCookie");
}
else
    checkboxFromCookie();

$("input:checkbox").change(function () {
    cookieFromCheckbox();
});