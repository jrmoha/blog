// Modals
$(document).ready(function () {
    $("#myBtn").click(function () {
        topFunction();
    });

    $("#messagesmodal").click(function () {
        $(".modal-comments").toggle();
    });
    $(".modal-comments").click(function () {
        $(".modal-comments").toggle();
    });



    $("#friendsmodal").click(function () {
        $(".modal-friends").toggle();
    });
    $(".modal-friends").click(function () {
        $(".modal-friends").toggle();
    });


    $("#profilemodal").click(function () {
        $(".modal-profile").toggle();
    });
    $(".modal-profile").click(function () {
        $(".modal-profile").toggle();
    });


    // $("#navicon").click(function () {
    //     $(".mobilemenu").fadeIn();
    // });
    // $(".all").click(function () {
    //     $(".mobilemenu").fadeOut();
    // });
});


window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}
function topFunction() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}