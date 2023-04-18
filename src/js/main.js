$(document).ready(function () {
    window.onload = function () {
        $('#preloader').delay(3000).fadeOut(500);
    }
    var nav = responsiveNav(".nav-collapse");
    //scroll down
    $("#js-scroll").click(function (e) {
        e.preventDefault();
        $("html, body").animate({
            scrollTop: $('#our-works').offset().top
        }, 'slow');
    });

    //Animate cover down
    $(".js-cover").click(function (e) {
        e.preventDefault();
        $("html, body").animate({
            scrollTop: $('#our-works').offset().top
        }, 'slow');
    });
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // mobile
    } else {
        var wa = $(".js-share__item--wa").hide();
    }
    //toggle credit
    $('#js-credits').click(function () {
        $('#js-credits-content').slideToggle("slow");
    });
});