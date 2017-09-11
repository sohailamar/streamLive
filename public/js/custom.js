/***************** Nav Transformicon ******************/
$(".OnClickBTN").click(function () {
    $(".Fix_directn").slideToggle();
});
$(document).on("click", ".closs", function () {
    $(".popHold").hide();
});
$(document).on("click", ".clozeBox", function () {
    $(".Fix_directn").hide();
});


$(".mobiList").click(function () {
    $(this).children("ul").slideToggle();

});


$(".nav-toggle").click(function () {
    $(this).toggleClass("active");
    $(".overlay-b").toggleClass("open");
});

$(".overlay ul li a").click(function () {
    $(".nav-toggle").toggleClass("active");
    $(".overlay-b").toggleClass("open");
});

$(".overlay").click(function () {
    $(".nav-toggle").toggleClass("active");
    $(".overlay-b").toggleClass("open");
});

/****** Select box Initializer *****/
$("select").selecter();

/*********** Search Result Div *************/
$(document).on("click", ".cSearch", function () {
    $("html, body").animate({scrollTop: 0}, "fast");
    $(".Search_Holder").show();
});
$(document).on("click", "#CROSS", function () {
    $(".Search_Holder").hide();
});


/****** Custome owl Carousel *****/
var owl = $('.owl-carousel_01');
owl.owlCarousel({
    loop: true,
    items: 1,
    autoplay: false,
    responsiveClass: true,
    singleItem: true,
});

var owl = $('.owl-carousel_02');
owl.owlCarousel({
    loop: true,
    items: 6,
    autoplay: true,
    singleItem: true,
    margin: 15,
    responsiveClass: true,
    responsive: {
        0: {
            items: 1
        },
        500: {
            items: 2
        },
        600: {
            items: 3
        },
        768: {
            items: 4
        },
        1023: {
            items: 5
        },
        1100: {
            items: 6
        }
    }

});

var owl = $('.owl-carousel_03');
owl.owlCarousel({
    loop: true,
    items: 2,
    autoplay: false,
    singleItem: true,
    navigation:true,
    responsiveClass: true,
    responsive: {
        0: {
            items: 1
        },
        500: {
            items: 1
        },
        600: {
            items: 1
        },
        768: {
            items: 2
        },
        1023: {
            items: 2
        },
        1100: {
            items: 2
        }
    }

});

var owl = $('.owl-carousel_04');
owl.owlCarousel({
    loop: true,
    items: 5,
    autoplay: false,
    singleItem: true,
    responsiveClass: true,
    responsive: {
        0: {
            items: 1
        },
        500: {
            items: 1
        },
        600: {
            items: 2
        },
        768: {
            items: 3
        },
        1023: {
            items: 4
        },
        1100: {
            items: 5
        }
    }

});

/********* Plus Minus tabs *********/
$('.btn-number1').click(function (e) {
    e.preventDefault();

    fieldName = $(this).attr('data-field');
    type = $(this).attr('data-type');
    var input = $("input[name='" + fieldName + "']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if (type == 'minus') {

            if (currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            }
            if (parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if (type == 'plus') {

            if (currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if (parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
});
$('.no_of_rooms').focusin(function () {
    $(this).data('oldValue', $(this).val());
});
$('.no_of_rooms').change(function () {

    minValue = parseInt($(this).attr('min'));
    maxValue = parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());

    name = $(this).attr('name');
    if (valueCurrent >= minValue) {
        $(".btn-number1[data-type='minus'][data-field='" + name + "']").removeAttr('disabled')
    } else {
        alert('Sorry, the minimum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    if (valueCurrent <= maxValue) {
        $(".btn-number1[data-type='plus'][data-field='" + name + "']").removeAttr('disabled')
    } else {
        alert('Sorry, the maximum value was reached');
        $(this).val($(this).data('oldValue'));
    }


});
$(".no_of_rooms").keydown(function (e) {
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
            // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                            (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });




//MOUSE MOVE, INVERT BACKGROUND POSITION
jQuery('.z_Content').mousemove(function (move) {
    var moveMouse = (move.pageX * -.2 / 3);
    jQuery('.z_Content .Join_Deals').css({
        'background-position-x': moveMouse + 'px'
    });
});
//MOUSE LEAVE, ANIMATE BACKGROUND TO START POSITION
jQuery('.z_Content').mouseleave(function () {
    jQuery('.z_Content .Join_Deals').animate({
        'background-position-x': '0'
    });
});


$('input[type="file"]').each(function () {
    var label = $(this).parents('.form-group').find('label').text();
    label = (label) ? label : 'Upload File';
    $(this).wrap('<div class="input-file"></div>');
    $(this).before('<span class="btn">' + label + '</span>');
    $(this).before('<span class="file-selected"></span>');
    $(this).change(function (e) {
        var val = $(this).val();
        var filename = val.replace(/^.*[\\\/]/, '');
        $(this).siblings('.file-selected').text(filename);
    });
});
$('.input-file .btn').click(function () {
    $(this).siblings('input[type="file"]').trigger('click');
});

$(window).on('load',function () {
    $("body").removeClass("preload");
});
