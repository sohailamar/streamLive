/*
 |--------------------------------------------------------------------------
 | FormSubmit js Handels all form submitions through ajax calls
 |--------------------------------------------------------------------------       
 |
 */

/**
 * postGroupRequest for creating new group request on home page partial
 *
 * @var string
 */
function postGroupRequest() {
    $('.my_ldr').show();
    $("#groupRequestForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                window.location.href = site_url + "group";
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}
/**
 * postPackageRequest for creating new group request on home page partial
 *
 * @var string
 */
function postPackageRequest() {
    $('.my_ldr').show();
    $('.fade.in').css('display', 'none')
    $("#packageRequestForm").ajaxSubmit({
        success: function (data) {
            if (data.success == true) {
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                $('#packagez').hide();
                $('.modal-backdrop').hide();
                $('#main_body').removeClass('modal-open');
                $("[data-dismiss=modal]").trigger({type: "click"});
                $('.my_ldr').hide();
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + ' .', 'error');
                $('.my_ldr').hide();
                $('.fade.in').css('display', 'block')
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}

/**
 * postVegasRequest for creating new vegas request on home page partial
 *
 * @var string
 */
function postVegasRequest() {
    $('.my_ldr').show();
    var check_in = new Date($('#check_in_vegas').val());
    var check_out = new Date($('#check_out_vegas').val());

    if (check_in > check_out) {
        cosyAlert('<strong>Error!</strong> Check Out Time must be on OR after ' + $('#check_in_vegas').val() + ' .', 'error');
        $('.my_ldr').hide();
        return false;
    }
    $("#vegasRequestForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                $('.tab-pane').removeClass('active');
                $('#Vegas').addClass('active');
                $('.vegas_li').removeClass('active');
                $('#li_hotel').addClass('active');
                window.location.href = site_url + "vegas";
                
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}
/**
 * postVegasRequest for creating new vegas request on home page partial
 *
 * @var string
 */
function postVegasRequestVegas() {
    $('.my_ldr').show();
    var check_in = new Date($('#vegas_checkin').val());
    var check_out = new Date($('#vegas_checkout').val());

    if (check_in > check_out) {
        cosyAlert('<strong>Error!</strong> Check Out Time must be on OR after ' + $('#vegas_checkin').val() + ' .', 'error');
        $('.my_ldr').hide();
        return false;
    }
    $("#vegasRequestForm").ajaxSubmit({
        success: function (data) {
            if (data.success == true) {
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                $('.tab-pane').removeClass('active');
                $('#Groupz').addClass('active');
                $('.vegas_li').removeClass('active');
                $('#li_hotel').addClass('active');
                getVegasHotelListings(1);
                $('#summry_name').html($('#vegas_name').val()+ ' ' +$('#vegas_last_name').val());
                $('#summry_email').html($('#vegas_email').val());
                $('#summry_phone').html($('#vegas_phone').val());
                $('#summry_date').html($('#vegas_checkin').val() + ' To ' + $('#vegas_checkout').val());
                $('#current_user').val(data.data.userRequest.user_request_id);
                $('#user_request_id').val(data.data.userRequest.user_request_id);
                $('#vegas_request_id').val(data.data.userRequest.vegas_request_id);
                $('#current_vegas_id').val(data.data.userRequest.vegas_request_id);
                $('#current_user_request_id_club').val(data.data.userRequest.user_request_id);
                $('.my_ldr').hide();

            } else {
                $('.my_ldr').hide();
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');

            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}
/**
 * postHotelRequest for creating new vegas request on hotel page partial
 *
 * @var string
 */
function postHotelRequest() {
    $('.my_ldr').show();
    var check_in = new Date($('#check_in').val());
    var check_out = new Date($('#check_out').val());
    var rooms = $('#rooms').val();
    var guests = $('#guests').val();
//    if (check_in > check_out) {
//        cosyAlert('<strong>Error!</strong> Check Out Time must be on OR after ' +$('#check_in').val()+ ' .', 'error');
//        $('.my_ldr').hide();
//        return false;
//    }

    $("#hotelRequestForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                $('.Submited').show();
                $('#hotel_btn').hide();
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}
/**
 * addHotelToSummary for creating new vegas request on hotel page partial
 *
 * @var id
 */
function addHotelToSummary(id, name) {
    $('.my_ldr').show();
    $('#hotel_id').val(id);
    $('#current_hotel_name').val(name);
    $("#hotelSummaryForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                getVegasSummary();
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}
/**
 * addClubToSummary for creating new vegas request on hotel page partial
 *
 * @var string
 */
function addClubToSummary(id, name) {
    $('.my_ldr').show();
    $('#club_id').val(id);
    $('#current_club_name').val(name);
    var service_id = $('#service_id').val();
    $('#club_name').val(name);
    if (service_id == '') {
        $('.my_ldr').hide();
        cosyAlert('<strong>Error!</strong> Select Club Service First.', 'error');
        return false;
    }
    $("#clubSummaryForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                getVegasSummary();
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}

/**
 * editUserRequest for creating new vegas request on hotel page partial
 *
 * @var string
 */
function editUserRequest() {
    $('.my_ldr').show();
    var current_user = $('#current_user').val();
    var hotelRequestStatus = $('#hotelRequestStatus').val();
    var clubRequestStatus = $('#clubRequestStatus').val();
    var comment = $.trim($('#comment').val());
    if (current_user == '') {
        cosyAlert('<strong>Error!</strong> Add some hotels and clubs first .', 'error');
        $('.my_ldr').hide();
        return false;
    }

//    if (comment == '') {
//        cosyAlert('<strong>Error!</strong> Add Comment first .', 'error');
//        $('.my_ldr').hide();
//        return false;
//    }
    if (hotelRequestStatus == 0 && clubRequestStatus == 0) {
        cosyAlert('<strong>Error!</strong> Add Hotel Or Club First .', 'error');
        $('.my_ldr').hide();
        return false;
    }
    $("#editUserRequestForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                getVegasSummary();
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                $('#current_user').val('');
                $('#user_request_id').val('');
                $('#vegas_request_id').val('');
                $('#current_vegas_id').val('');
                $('#current_user_request_id_club').val('');
                $('#user_request_id').val('');
                $('#vegas_request_id').val('');
                $('#vegas_checkin').val('');
                $('#vegas_checkout').val('');
                window.setTimeout(function () {
                    window.location.href = site_url + "vegas";
                }, 3000)
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}

/**
 * postContactForm for creating new vegas request on hotel page partial
 *
 * @var string
 */
function postContactForm() {
    $('.my_ldr').show();
    $("#contactForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                $('#name').val('');
                $('#emails').val('');
                $('#msg').val('');
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}
/**
 * postNewsLetter for creating new vegas request on hotel page partial
 *
 * @var string
 */
function postNewsLetter() {
    $('.my_ldr').show();
    $("#newsletterForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                $('#name').val('');
                $('#emails').val('');
                $('#msg').val('');
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}

/**
 * signup for creating new group request on home page partial
 *
 * @var string
 */
function signup() {
    $('.my_ldr').show();
    $("#signupForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                $('#registerPopup').hide();
                $('.modal-backdrop').hide();
                $('#main_body').removeClass('modal-open');
                $("[data-dismiss=modal]").trigger({type: "click"});
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}

/**
 * signin for creating new group request on home page partial
 *
 * @var string
 */
function signin() {
    $('.my_ldr').show();
    $("#signinForm").ajaxSubmit({
        success: function (data) {
            $('.my_ldr').hide();
            if (data.success == true) {
                cosyAlert('<strong>Success!</strong> ' + data.message + ' .', 'success');
                $('#Sign_IN').hide();
                $('.modal-backdrop').hide();
                $('#main_body').removeClass('modal-open');
                $("[data-dismiss=modal]").trigger({type: "click"});
                 window.setTimeout(function () {
                    location.reload()
                }, 2000)
            } else {
                cosyAlert('<strong>Error!</strong> ' + data.message + '.', 'error');
            }
        },
        error: function (data) {
            $('.my_ldr').hide();
            console.log(data);
        }
    });
}