// Modals
$(document).ready(function () {
    $("#myBtn").click(function () {
        topFunction();
    });

    $("#messagesmodal").hover(function () {
        $(".modal-comments").toggle();
    });
    $(".modal-comments").hover(function () {
        $(".modal-comments").toggle();
    });



    $("#friendsmodal").hover(function () {
        $(".modal-friends").toggle();
    });
    $(".modal-friends").hover(function () {
        $(".modal-friends").toggle();
    });


    $("#profilemodal").hover(function () {
        $(".modal-profile").toggle();
    });
    $(".modal-profile").hover(function () {
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