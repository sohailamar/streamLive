


// click function for changing background banner for home page tabs
$(".clickBanner").click(function () {
    var id = $("a", this).attr('href');
    $('.allBanner').hide();
    $('' + id + '_banner').show();
});



//$("#plus_minus_popup").focusout(function () {
//   clickRoomsGuests();
//});

$(document).on('click', function (evt) {
    if (evt.target.className != '') {
        if (evt.target.id != '') {
            if ($('#' + evt.target.id).attr('class').toLowerCase().indexOf("naps") >= 0 || evt.target.id == 'room_and_guest') {
                if (evt.target.id == 'room_and_guest') {
                    $(".plus_Minus").toggle();
                    if ($(".plus_Minus").is(":hidden")) {
                        clickRoomsGuests();
                    }
                } else {
                    $(".plus_Minus").show();
                }
            } else {
                clickRoomsGuests();
            }
        } else {
            clickRoomsGuests();
        }
    }
});


function clickRoomsGuests() {
    $(".plus_Minus").hide();
    if ($(".plus_Minus").is(":hidden")) {
        var rooms = $('#rooms').val();
        var guests = $('#guests').val();
        var room_text = 'room';
        if (rooms > 1) {
            var room_text = 'rooms';
        }
        var guest_text = 'guest';
        if (guests > 1) {
            var guest_text = 'guests';
        }
        $('#room_and_guest').val(rooms + ' ' + room_text + ' , ' + guests + ' ' + guest_text);
    }
}



$('.btn-number2').click(function (e) {
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
$('.no_of_guests').focusin(function () {
    $(this).data('oldValue', $(this).val());
});
$('.no_of_guests').change(function () {

    minValue = parseInt($(this).attr('min'));
    maxValue = parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());

    name = $(this).attr('name');
    if (valueCurrent >= minValue) {
        $(".btn-number2[data-type='minus'][data-field='" + name + "']").removeAttr('disabled')
    } else {
        alert('Sorry, the minimum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    if (valueCurrent <= maxValue) {
        $(".btn-number2[data-type='plus'][data-field='" + name + "']").removeAttr('disabled')
    } else {
        alert('Sorry, the maximum value was reached');
        $(this).val($(this).data('oldValue'));
    }


});
$(".no_of_guests").keydown(function (e) {
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


// ajax call for clicking on hotels and clubs on vegas page.
function getVegasHotelListings(page) {
//    var vegas_request_id = $('#vegas_request_id').val();
//    var curent_user_id = $('#current_user').val();
    $('.my_ldr').show();
    $.ajax({
        type: "POST",
        data: {},
        url: site_url + "getVegasHotelListings?page=" + page,
        success: function (data) {
            $('#Groupz').html(data);
            $('.my_ldr').hide();
        }
    });
}
// ajax call for clicking on hotels and clubs on vegas page.
function getVegasClubListings(page, id) {
    if (typeof id === 'undefined' || id == '') {
        id = $('#service_id').val();
    }
    $('#current_service_name').val($('#service_id').find(':selected').attr('data-name'));
    $('.my_ldr').show();
    $.ajax({
        type: "POST",
        data: {},
        url: site_url + "getVegasClubListings?page=" + page + "&service_id=" + id,
        success: function (data) {
            $('#clubListing').html(data);
            if (page > 1) {
                $('html, body').animate({
                    'scrollTop': $("#li_club").offset().top
                }, 1000);
            }
            $('.my_ldr').hide();
        }
    });
}

// pagination click function for club
$(document).ready(function () {
    $(document).on('click', '.club_pagination a', function (e) {
        getVegasClubListings($(this).attr('href').split('page=')[1]);
        e.preventDefault();
    });
});

// pagination click function for Hotels
$(document).ready(function () {
    $(document).on('click', '.hotel_pagination a', function (e) {
        getVegasHotelListings($(this).attr('href').split('page=')[1]);
        e.preventDefault();
    });
});

// Call for adding hotels and clubs into cart
function addSummary(peram, id, name) {
    var current_user = $('#current_user').val();
    if (current_user == '') {
        cosyAlert('<strong>Error!</strong> Submit User Information First.', 'error');
        $('.tab-pane').removeClass('active');
        $('#vegasDetailz').addClass('active');
        $('.vegas_li').removeClass('active');
        $('#li_detail').addClass('active');
    } else {
        if (peram == 'hotel') {
            addHotelToSummary(id, name);
        } else {
            addClubToSummary(id, name);
        }
    }


}
function getVegasSummary() {
    var user_request_id = $('#user_request_id').val();
    var vegas_request_id = $('#vegas_request_id').val();
    if (user_request_id > 0) {
        $('.my_ldr').show();
        $.ajax({
            type: "POST",
            data: {user_request_id: user_request_id, vegas_request_id: vegas_request_id},
            url: site_url + "getVegasSummary",
            success: function (data) {
                $('.vgasRit').html(data);
                $('.my_ldr').hide();
            }
        });
        getVegasHotelListings(1);
        getVegasClubListings(1);
    }
}
// For Autoload Summary and user details
$(document).ready(function () {
    getVegasSummary();
});
// Delete Vegas Summary
function deleteVegasSummary(id, peram) {
    $('.my_ldr').show();
    $.ajax({
        type: "POST",
        data: {id: id, peram: peram},
        url: site_url + "deleteVegasSummary",
        success: function (data) {
            if (data.success == true) {
                getVegasSummary();
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
            $('.my_ldr').hide();
        }
    });
}

// empty hotel request form
function emptyHotelForm() {
    $('#name').val('');
    $('#email').val('');
    $('#check_in').val('');
    $('#check_out').val('');
    $('#room_and_guest').val('');
    $('#rooms').val('');
    $('#guests').val('');
    $('#autocomplete').val('');
    $('#country').val('');
    $('#lat').val('');
    $('#long').val('');
    $('#locality').val('');
    $('#administrative_area_level_1').val('');
    $('#postal_code').val('');
    $('.Submited').hide();
    $('#hotel_btn').show();

}

$(document).ready(function () {
//    $(".numeric").numeric();
    $(".numeric").mask("(999)-999-9999");
});

// Delete Vegas Summary
function packagePopup(packageId) {
    $('#first_name').val('');
    $('#last_name').val('');
    $('#email').val('');
    $('#phone').val('');
    $('#package_id').val(packageId);
}

// skipStep

function skipStep(packageId) {
    $('.tab-pane').removeClass('active');
    $('#Vegas').addClass('active');
    $('.vegas_li').removeClass('active');
    $('#li_club').addClass('active');
    getVegasClubListings(1);
    $('html, body').animate({
        'scrollTop': $("#li_club").offset().top
    }, 1000);
}



