'use strict'
$(document).ready(function () {
    $("form[name=login_form]").submit(function (e) {
        e.preventDefault();
        let email = $("input[name=username]").val()
        let password = $("input[name=password]").val()
        var email_regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*.com$/g
        var password_regex = /\d{8,}/gm
        let errMsgs = []
        if (!email_regex.test(email)) {
            errMsgs.push("Please Enter Your Email In A Valid Form.")
        }
        if (!password_regex.test(password)) {
            errMsgs.push("Password Must Be More Than 8 Numbers.")
        }
        if (errMsgs.length > 0) {
            $("#err").removeClass('d-none');
            $("#err").addClass('d-block')
            $("#err").html(errMsgs.join('\n\n'))
        } else if (errMsgs.length === 0) {
            e.target.submit();
        }
    });
    $("input[name=username]").change(function () {
        let reg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*.com$/g
        let login_email = $("input[name=username]").val()
        if (reg.test(login_email)) {
            $("#login_email_check").removeClass('d-none')
            $("#login_email_check").addClass('d-block')
        } else {
            $("#login_email_check").removeClass('d-block')
            $("#login_email_check").addClass('d-none')
        }
    });
});