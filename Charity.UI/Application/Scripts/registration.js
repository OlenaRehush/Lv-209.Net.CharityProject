
$(document).ready(function () {
    //Default to close second_step
    $("#second_step").toggle();
    $("#Next").text("Наступний крок")
    var switched = false;
    // Event when you click on the button
    $("#Next").click(function () {

        if ($("#Password").val() != $("#ConfirmPassword").val()) {
            alert("Паролі не збігаються");
        }
        else {
            if ($("#UserName").val() &&
                $("#Email").val() &&
                $("#Password").val() &&
                $("#ConfirmPassword").val()) {
                switched = !switched;
                if (!switched) {
                    $("#second_step").toggle(200);
                    $("#first_step").toggle(200);
                    $("#Next").text("Наступний крок")
                }
                else {

                    $("#first_step").toggle(200);
                    $("#second_step").toggle(200);

                    $("#Next").text("Попередній крок");
                }
            }
        }
    });
});

/*
$("#Textbox").rules("add", { regex: "^[a-zA-Z'.\\s]{1,40}$" })

$.validator.addMethod(
        "regex",
        function (value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        },
        "Please check your input."
);*/