;
(function ($, window) {
    "use strict";

    var guid = 0,
            userAgent = (window.navigator.userAgent || window.navigator.vendor || window.opera),
            isFirefox = /Firefox/i.test(userAgent),
            isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(userAgent),
            isFirefoxMobile = (isFirefox && isMobile),
            $body = null;

    /**
     * @options
     * @param callback [function] <$.noop> "Select item callback"
     * @param cover [boolean] <false> "Cover handle with option set"
     * @param customClass [string] <''> "Class applied to instance"
     * @param label [string] <''> "Label displayed before selection"
     * @param external [boolean] <false> "Open options as links in new window"
     * @param links [boolean] <false> "Open options as links in same window"
     * @param mobile [boolean] <false> "Force desktop interaction on mobile"
     * @param trim [int] <0> "Trim options to specified length; 0 to disable”
     */
    var options = {
        callback: $.noop,
        cover: false,
        customClass: "",
        label: "",
        external: false,
        links: false,
        mobile: false,
        trim: 0
    };

    var pub = {
        /**
         * @method
         * @name defaults
         * @description Sets default plugin options
         * @param opts [object] <{}> "Options object"
         * @example $.selecter("defaults", opts);
         */
        defaults: function (opts) {
            options = $.extend(options, opts || {});
            return $(this);
        },
        /**
         * @method
         * @name disable
         * @description Disables target instance or option
         * @param option [string] <null> "Target option value"
         * @example $(".target").selecter("disable", "1");
         */
        disable: function (option) {
            return $(this).each(function (i, input) {
                var data = $(input).parent(".selecter").data("selecter");

                if (data) {
                    if (typeof option !== "undefined") {
                        var index = data.$items.index(data.$items.filter("[data-value=" + option + "]"));

                        data.$items.eq(index).addClass("disabled");
                        data.$options.eq(index).prop("disabled", true);
                    } else {
                        if (data.$selecter.hasClass("open")) {
                            data.$selecter.find(".selecter-selected").trigger("click.selecter");
                        }

                        data.$selecter.addClass("disabled");
                        data.$select.prop("disabled", true);
                    }
                }
            });
        },
        /**
         * @method
         * @name destroy
         * @description Removes instance of plugin
         * @example $(".target").selecter("destroy");
         */
        destroy: function () {
            return $(this).each(function (i, input) {
                var data = $(input).parent(".selecter").data("selecter");

                if (data) {
                    if (data.$selecter.hasClass("open")) {
                        data.$selecter.find(".selecter-selected").trigger("click.selecter");
                    }

                    // Scroller support
                    if ($.fn.scroller !== undefined) {
                        data.$selecter.find(".selecter-options").scroller("destroy");
                    }

                    data.$select[0].tabIndex = data.tabIndex;

                    data.$select.find(".selecter-placeholder").remove();
                    data.$selected.remove();
                    data.$itemsWrapper.remove();

                    data.$selecter.off(".selecter");

                    data.$select.off(".selecter")
                            .removeClass("selecter-element")
                            .show()
                            .unwrap();
                }
            });
        },
        /**
         * @method
         * @name enable
         * @description Enables target instance or option
         * @param option [string] <null> "Target option value"
         * @example $(".target").selecter("enable", "1");
         */
        enable: function (option) {
            return $(this).each(function (i, input) {
                var data = $(input).parent(".selecter").data("selecter");

                if (data) {
                    if (typeof option !== "undefined") {
                        var index = data.$items.index(data.$items.filter("[data-value=" + option + "]"));
                        data.$items.eq(index).removeClass("disabled");
                        data.$options.eq(index).prop("disabled", false);
                    } else {
                        data.$selecter.removeClass("disabled");
                        data.$select.prop("disabled", false);
                    }
                }
            });
        },
        /**
         * @method private
         * @name refresh
         * @description DEPRECATED - Updates instance base on target options
         * @example $(".target").selecter("refresh");
         */
        refresh: function () {
            return pub.update.apply($(this));
        },
        /**
         * @method
         * @name update
         * @description Updates instance base on target options
         * @example $(".target").selecter("update");
         */
        update: function () {
            return $(this).each(function (i, input) {
                var data = $(input).parent(".selecter").data("selecter");

                if (data) {
                    var index = data.index;

                    data.$allOptions = data.$select.find("option, optgroup");
                    data.$options = data.$allOptions.filter("option");
                    data.index = -1;

                    index = data.$options.index(data.$options.filter(":selected"));

                    _buildOptions(data);

                    if (!data.multiple) {
                        _update(index, data);
                    }
                }
            });
        }
    };

    /**
     * @method private
     * @name _init
     * @description Initializes plugin
     * @param opts [object] "Initialization options"
     */
    function _init(opts) {
        // Local options
        opts = $.extend({}, options, opts || {});

        // Check for Body
        if ($body === null) {
            $body = $("body");
        }

        // Apply to each element
        var $items = $(this);
        for (var i = 0, count = $items.length; i < count; i++) {
            _build($items.eq(i), opts);
        }
        return $items;
    }

    /**
     * @method private
     * @name _build
     * @description Builds each instance
     * @param $select [jQuery object] "Target jQuery object"
     * @param opts [object] <{}> "Options object"
     */
    function _build($select, opts) {
        if (!$select.hasClass("selecter-element")) {
            // EXTEND OPTIONS
            opts = $.extend({}, opts, $select.data("selecter-options"));

            opts.multiple = $select.prop("multiple");
            opts.disabled = $select.is(":disabled");

            if (opts.external) {
                opts.links = true;
            }

            // Test for selected option in case we need to override the custom label
            var $originalOption = $select.find(":selected");
            if (!opts.multiple && opts.label !== "") {
                $select.prepend('<option value="" class="selecter-placeholder" selected>' + opts.label + '</option>');
            } else {
                opts.label = "";
            }

            // Build options array
            var $allOptions = $select.find("option, optgroup"),
                    $options = $allOptions.filter("option");

            // update original in case we needed a custom label placeholder
            $originalOption = $options.filter(":selected");

            var originalIndex = ($originalOption.length > 0) ? $options.index($originalOption) : 0,
                    originalLabel = (opts.label !== "") ? opts.label : $originalOption.text(),
                    wrapperTag = "div";
            //wrapperTag = (opts.links) ? "nav" : "div"; // nav's usage still up for debate...

            // Swap tab index, no more interacting with the actual select!
            opts.tabIndex = $select[0].tabIndex;
            $select[0].tabIndex = -1;

            // Build HTML
            var inner = "",
                    wrapper = "";

            // Build wrapper
            wrapper += '<' + wrapperTag + ' class="selecter ' + opts.customClass;
            // Special case classes
            if (isMobile) {
                wrapper += ' mobile';
            } else if (opts.cover) {
                wrapper += ' cover';
            }
            if (opts.multiple) {
                wrapper += ' multiple';
            } else {
                wrapper += ' closed';
            }
            if (opts.disabled) {
                wrapper += ' disabled';
            }
            wrapper += '" tabindex="' + opts.tabIndex + '">';
            wrapper += '</' + wrapperTag + '>';

            // Build inner
            if (!opts.multiple) {
                inner += '<span class="selecter-selected">';
                // inner += $('<span></span>').text( _trim((($originalOption.text() !== "") ? $originalOption.text() : opts.label), opts.trim) ).html();
                inner += $('<span></span>').text(_trim(originalLabel, opts.trim)).html();
                inner += '</span>';
            }
            inner += '<div class="selecter-options">';
            inner += '</div>';

            // Modify DOM
            $select.addClass("selecter-element")
                    .wrap(wrapper)
                    .after(inner);

            // Store plugin data
            var $selecter = $select.parent(".selecter"),
                    data = $.extend({
                        $select: $select,
                        $allOptions: $allOptions,
                        $options: $options,
                        $selecter: $selecter,
                        $selected: $selecter.find(".selecter-selected"),
                        $itemsWrapper: $selecter.find(".selecter-options"),
                        index: -1,
                        guid: guid++
                    }, opts);

            _buildOptions(data);

            if (!data.multiple) {
                _update(originalIndex, data);
            }

            // Scroller support
            if ($.fn.scroller !== undefined) {
                data.$itemsWrapper.scroller();
            }

            // Bind click events
            data.$selecter.on("touchstart.selecter", ".selecter-selected", data, _onTouchStart)
                    .on("click.selecter", ".selecter-selected", data, _onClick)
                    .on("click.selecter", ".selecter-item", data, _onSelect)
                    .on("close.selecter", data, _onClose)
                    .data("selecter", data);

            // Bind Blur/focus events
            //if ((!data.links && !isMobile) || isMobile) {
            data.$select.on("change.selecter", data, _onChange);

            if (!isMobile) {
                data.$selecter.on("focus.selecter", data, _onFocus)
                        .on("blur.selecter", data, _onBlur);

                // handle clicks to associated labels - not on mobile
                data.$select.on("focus.selecter", data, function (e) {
                    e.data.$selecter.trigger("focus");
                });
            }

            //} else {
            // Disable browser focus/blur for jump links
            //data.$select.hide();
            //}
        }
    }

    /**
     * @method private
     * @name _buildOptions
     * @description Builds instance's option set
     * @param data [object] "Instance data"
     */
    function _buildOptions(data) {
        var html = '',
                itemTag = (data.links) ? "a" : "span",
                j = 0;

        for (var i = 0, count = data.$allOptions.length; i < count; i++) {
            var $op = data.$allOptions.eq(i);

            // Option group
            if ($op[0].tagName === "OPTGROUP") {
                html += '<span class="selecter-group';
                // Disabled groups
                if ($op.is(":disabled")) {
                    html += ' disabled';
                }
                html += '">' + $op.attr("label") + '</span>';
            } else {
                var opVal = $op.val();

                if (!$op.attr("value")) {
                    $op.attr("value", opVal);
                }

                html += '<' + itemTag + ' class="selecter-item';
                if ($op.hasClass('selecter-placeholder')) {
                    html += ' placeholder';
                }
                // Default selected value - now handles multi's thanks to @kuilkoff
                if ($op.is(':selected')) {
                    html += ' selected';
                }
                // Disabled options
                if ($op.is(":disabled")) {
                    html += ' disabled';
                }
                html += '" ';
                if (data.links) {
                    html += 'href="' + opVal + '"';
                } else {
                    html += 'data-value="' + opVal + '"';
                }
                html += '>' + $("<span></span>").text(_trim($op.text(), data.trim)).html() + '</' + itemTag + '>';
                j++;
            }
        }

        data.$itemsWrapper.html(html);
        data.$items = data.$selecter.find(".selecter-item");
    }

    /**
     * @method private
     * @name _onTouchStart
     * @description Handles touchstart to selected item
     * @param e [object] "Event data"
     */
    function _onTouchStart(e) {
        e.stopPropagation();

        var data = e.data,
                oe = e.originalEvent;

        _clearTimer(data.timer);

        data.touchStartX = oe.touches[0].clientX;
        data.touchStartY = oe.touches[0].clientY;

        data.$selecter.on("touchmove.selecter", ".selecter-selected", data, _onTouchMove)
                .on("touchend.selecter", ".selecter-selected", data, _onTouchEnd);
    }

    /**
     * @method private
     * @name _onTouchMove
     * @description Handles touchmove to selected item
     * @param e [object] "Event data"
     */
    function _onTouchMove(e) {
        var data = e.data,
                oe = e.originalEvent;

        if (Math.abs(oe.touches[0].clientX - data.touchStartX) > 10 || Math.abs(oe.touches[0].clientY - data.touchStartY) > 10) {
            data.$selecter.off("touchmove.selecter touchend.selecter");
        }
    }

    /**
     * @method private
     * @name _onTouchEnd
     * @description Handles touchend to selected item
     * @param e [object] "Event data"
     */
    function _onTouchEnd(e) {
        var data = e.data;

        data.$selecter.off("touchmove.selecter touchend.selecter click.selecter");

        // prevent ghosty clicks
        data.timer = _startTimer(data.timer, 1000, function () {
            data.$selecter.on("click.selecter", ".selecter-selected", data, _onClick)
                    .on("click.selecter", ".selecter-item", data, _onSelect);
        });

        _onClick(e);
    }

    /**
     * @method private
     * @name _onClick
     * @description Handles click to selected item
     * @param e [object] "Event data"
     */
    function _onClick(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;

        if (!data.$select.is(":disabled")) {
            $(".selecter").not(data.$selecter).trigger("close.selecter", [data]);

            // Handle mobile, but not Firefox, unless desktop forced
            if (!data.mobile && isMobile && !isFirefoxMobile) {
                var el = data.$select[0];
                if (window.document.createEvent) { // All
                    var evt = window.document.createEvent("MouseEvents");
                    evt.initMouseEvent("mousedown", false, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    el.dispatchEvent(evt);
                } else if (el.fireEvent) { // IE
                    el.fireEvent("onmousedown");
                }
            } else {
                // Delegate intent
                if (data.$selecter.hasClass("closed")) {
                    _onOpen(e);
                } else if (data.$selecter.hasClass("open")) {
                    _onClose(e);
                }
            }
        }
    }

    /**
     * @method private
     * @name _onOpen
     * @description Opens option set
     * @param e [object] "Event data"
     */
    function _onOpen(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;

        // Make sure it's not alerady open
        if (!data.$selecter.hasClass("open")) {
            var offset = data.$selecter.offset(),
                    bodyHeight = $body.outerHeight(),
                    optionsHeight = data.$itemsWrapper.outerHeight(true),
                    selectedOffset = (data.index >= 0) ? data.$items.eq(data.index).position() : {left: 0, top: 0};

            // Calculate bottom of document
            if (offset.top + optionsHeight > bodyHeight) {
                data.$selecter.addClass("bottom");
            }

            data.$itemsWrapper.show();

            // Bind Events
            data.$selecter.removeClass("closed")
                    .addClass("open");
            $body.on("click.selecter-" + data.guid, ":not(.selecter-options)", data, _onCloseHelper);

            _scrollOptions(data);
        }
    }

    /**
     * @method private
     * @name _onCloseHelper
     * @description Determines if event target is outside instance before closing
     * @param e [object] "Event data"
     */
    function _onCloseHelper(e) {
        e.preventDefault();
        e.stopPropagation();

        if ($(e.currentTarget).parents(".selecter").length === 0) {
            _onClose(e);
        }
    }

    /**
     * @method private
     * @name _onClose
     * @description Closes option set
     * @param e [object] "Event data"
     */
    function _onClose(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;

        // Make sure it's actually open
        if (data.$selecter.hasClass("open")) {
            data.$itemsWrapper.hide();
            data.$selecter.removeClass("open bottom")
                    .addClass("closed");

            $body.off(".selecter-" + data.guid);
        }
    }

    /**
     * @method private
     * @name _onSelect
     * @description Handles option select
     * @param e [object] "Event data"
     */
    function _onSelect(e) {
        e.preventDefault();
        e.stopPropagation();

        var $target = $(this),
                data = e.data;

        if (!data.$select.is(":disabled")) {
            if (data.$itemsWrapper.is(":visible")) {
                // Update
                var index = data.$items.index($target);

                if (index !== data.index) {
                    _update(index, data);
                    _handleChange(data);
                }
            }

            if (!data.multiple) {
                // Clean up
                _onClose(e);
            }
        }
    }

    /**
     * @method private
     * @name _onChange
     * @description Handles external changes
     * @param e [object] "Event data"
     */
    function _onChange(e, internal) {
        var $target = $(this),
                data = e.data;

        if (!internal && !data.multiple) {
            var index = data.$options.index(data.$options.filter("[value='" + _escape($target.val()) + "']"));

            _update(index, data);
            _handleChange(data);
        }
    }

    /**
     * @method private
     * @name _onFocus
     * @description Handles instance focus
     * @param e [object] "Event data"
     */
    function _onFocus(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;

        if (!data.$select.is(":disabled") && !data.multiple) {
            data.$selecter.addClass("focus")
                    .on("keydown.selecter-" + data.guid, data, _onKeypress);

            $(".selecter").not(data.$selecter)
                    .trigger("close.selecter", [data]);
        }
    }

    /**
     * @method private
     * @name _onBlur
     * @description Handles instance focus
     * @param e [object] "Event data"
     */
    function _onBlur(e, internal, two) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;

        data.$selecter.removeClass("focus")
                .off("keydown.selecter-" + data.guid);

        $(".selecter").not(data.$selecter)
                .trigger("close.selecter", [data]);
    }

    /**
     * @method private
     * @name _onKeypress
     * @description Handles instance keypress, once focused
     * @param e [object] "Event data"
     */
    function _onKeypress(e) {
        var data = e.data;

        if (e.keyCode === 13) {
            if (data.$selecter.hasClass("open")) {
                _onClose(e);
                _update(data.index, data);
            }
            _handleChange(data);
        } else if (e.keyCode !== 9 && (!e.metaKey && !e.altKey && !e.ctrlKey && !e.shiftKey)) {
            // Ignore modifiers & tabs
            e.preventDefault();
            e.stopPropagation();

            var total = data.$items.length - 1,
                    index = (data.index < 0) ? 0 : data.index;

            // Firefox left/right support thanks to Kylemade
            if ($.inArray(e.keyCode, (isFirefox) ? [38, 40, 37, 39] : [38, 40]) > -1) {
                // Increment / decrement using the arrow keys
                index = index + ((e.keyCode === 38 || (isFirefox && e.keyCode === 37)) ? -1 : 1);

                if (index < 0) {
                    index = 0;
                }
                if (index > total) {
                    index = total;
                }
            } else {
                var input = String.fromCharCode(e.keyCode).toUpperCase(),
                        letter,
                        i;

                // Search for input from original index
                for (i = data.index + 1; i <= total; i++) {
                    letter = data.$options.eq(i).text().charAt(0).toUpperCase();
                    if (letter === input) {
                        index = i;
                        break;
                    }
                }

                // If not, start from the beginning
                if (index < 0 || index === data.index) {
                    for (i = 0; i <= total; i++) {
                        letter = data.$options.eq(i).text().charAt(0).toUpperCase();
                        if (letter === input) {
                            index = i;
                            break;
                        }
                    }
                }
            }

            // Update
            if (index >= 0) {
                _update(index, data);
                _scrollOptions(data);
            }
        }
    }

    /**
     * @method private
     * @name _update
     * @description Updates instance based on new target index
     * @param index [int] "Selected option index"
     * @param data [object] "instance data"
     */
    function _update(index, data) {
        var $item = data.$items.eq(index),
                isSelected = $item.hasClass("selected"),
                isDisabled = $item.hasClass("disabled");

        // Check for disabled options
        if (!isDisabled) {
            if (data.multiple) {
                if (isSelected) {
                    data.$options.eq(index).prop("selected", null);
                    $item.removeClass("selected");
                } else {
                    data.$options.eq(index).prop("selected", true);
                    $item.addClass("selected");
                }
            } else if (index > -1 && index < data.$items.length) {
                var newLabel = $item.html(),
                        newValue = $item.data("value");

                data.$selected.html(newLabel)
                        .removeClass('placeholder');

                data.$items.filter(".selected")
                        .removeClass("selected");

                data.$select[0].selectedIndex = index;

                $item.addClass("selected");
                data.index = index;
            } else if (data.label !== "") {
                data.$selected.html(data.label);
            }
        }
    }

    /**
     * @method private
     * @name _scrollOptions
     * @description Scrolls options wrapper to specific option
     * @param data [object] "Instance data"
     */
    function _scrollOptions(data) {
        var $selected = data.$items.eq(data.index),
                selectedOffset = (data.index >= 0 && !$selected.hasClass("placeholder")) ? $selected.position() : {left: 0, top: 0};

        if ($.fn.scroller !== undefined) {
            data.$itemsWrapper.scroller("scroll", (data.$itemsWrapper.find(".scroller-content").scrollTop() + selectedOffset.top), 0)
                    .scroller("reset");
        } else {
            data.$itemsWrapper.scrollTop(data.$itemsWrapper.scrollTop() + selectedOffset.top);
        }
    }

    /**
     * @method private
     * @name _handleChange
     * @description Handles change events
     * @param data [object] "Instance data"
     */
    function _handleChange(data) {
        if (data.links) {
            _launch(data);
        } else {
            data.callback.call(data.$selecter, data.$select.val(), data.index);
            data.$select.trigger("change", [true]);
        }
    }

    /**
     * @method private
     * @name _launch
     * @description Launches link
     * @param data [object] "Instance data"
     */
    function _launch(data) {
        //var url = (isMobile) ? data.$select.val() : data.$options.filter(":selected").attr("href");
        var url = data.$select.val();

        if (data.external) {
            // Open link in a new tab/window
            window.open(url);
        } else {
            // Open link in same tab/window
            window.location.href = url;
        }
    }

    /**
     * @method private
     * @name _trim
     * @description Trims text, if specified length is greater then 0
     * @param length [int] "Length to trim at"
     * @param text [string] "Text to trim"
     * @return [string] "Trimmed string"
     */
    function _trim(text, length) {
        if (length === 0) {
            return text;
        } else {
            if (text.length > length) {
                return text.substring(0, length) + "...";
            } else {
                return text;
            }
        }
    }

    /**
     * @method private
     * @name _escape
     * @description Escapes text
     * @param text [string] "Text to escape"
     */
    function _escape(text) {
        return (typeof text === "string") ? text.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1') : text;
    }

    /**
     * @method private
     * @name _startTimer
     * @description Starts an internal timer
     * @param timer [int] "Timer ID"
     * @param time [int] "Time until execution"
     * @param callback [int] "Function to execute"
     * @param interval [boolean] "Flag for recurring interval"
     */
    function _startTimer(timer, time, func, interval) {
        _clearTimer(timer, interval);
        if (interval === true) {
            return setInterval(func, time);
        } else {
            return setTimeout(func, time);
        }
    }

    /**
     * @method private
     * @name _clearTimer
     * @description Clears an internal timer
     * @param timer [int] "Timer ID"
     */
    function _clearTimer(timer) {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    }

    $.fn.selecter = function (method) {
        if (pub[method]) {
            return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return _init.apply(this, arguments);
        }
        return this;
    };

    $.selecter = function (method) {
        if (method === "defaults") {
            pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    };
})(jQuery, window);

/************** Date picker Jquery *****************/
/**
 * @preserve jQuery DateTimePicker plugin v2.4.1
 * @homepage http://xdsoft.net/jqplugins/datetimepicker/
 * (c) 2014, Chupurnov Valeriy.
 */
/*global document,window,jQuery,setTimeout,clearTimeout*/
(function ($) {
    'use strict';
    var default_options = {
        i18n: {
            ar: {// Arabic
                months: [
                    "كانون الثاني", "شباط", "آذار", "نيسان", "مايو", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
                ],
                dayOfWeek: [
                    "ن", "ث", "ع", "خ", "ج", "س", "ح"
                ]
            },
            ro: {// Romanian
                months: [
                    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
                ],
                dayOfWeek: [
                    "l", "ma", "mi", "j", "v", "s", "d"
                ]
            },
            id: {// Indonesian
                months: [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ],
                dayOfWeek: [
                    "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"
                ]
            },
            bg: {// Bulgarian
                months: [
                    "Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
                ],
                dayOfWeek: [
                    "Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            fa: {// Persian/Farsi
                months: [
                    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
                ],
                dayOfWeek: [
                    'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
                ]
            },
            ru: {// Russian
                months: [
                    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                ],
                dayOfWeek: [
                    "Вск", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            uk: {// Ukrainian
                months: [
                    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
                ],
                dayOfWeek: [
                    "Ндл", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"
                ]
            },
            en: {// English
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            el: {// Ελληνικά
                months: [
                    "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"
                ],
                dayOfWeek: [
                    "Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"
                ]
            },
            de: {// German
                months: [
                    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
                ],
                dayOfWeek: [
                    "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"
                ]
            },
            nl: {// Dutch
                months: [
                    "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"
                ],
                dayOfWeek: [
                    "zo", "ma", "di", "wo", "do", "vr", "za"
                ]
            },
            tr: {// Turkish
                months: [
                    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
                ],
                dayOfWeek: [
                    "Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"
                ]
            },
            fr: {//French
                months: [
                    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
                ],
                dayOfWeek: [
                    "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"
                ]
            },
            es: {// Spanish
                months: [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"
                ]
            },
            th: {// Thai
                months: [
                    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                ],
                dayOfWeek: [
                    'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
                ]
            },
            pl: {// Polish
                months: [
                    "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
                ],
                dayOfWeek: [
                    "nd", "pn", "wt", "śr", "cz", "pt", "sb"
                ]
            },
            pt: {// Portuguese
                months: [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ],
                dayOfWeek: [
                    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"
                ]
            },
            ch: {// Simplified Chinese
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            se: {// Swedish
                months: [
                    "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
                ]
            },
            kr: {// Korean
                months: [
                    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayOfWeek: [
                    "일", "월", "화", "수", "목", "금", "토"
                ]
            },
            it: {// Italian
                months: [
                    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"
                ]
            },
            da: {// Dansk
                months: [
                    "January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
                ]
            },
            no: {// Norwegian
                months: [
                    "Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"
                ],
                dayOfWeek: [
                    "Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
                ]
            },
            ja: {// Japanese
                months: [
                    "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
                ],
                dayOfWeek: [
                    "日", "月", "火", "水", "木", "金", "土"
                ]
            },
            vi: {// Vietnamese
                months: [
                    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                ],
                dayOfWeek: [
                    "CN", "T2", "T3", "T4", "T5", "T6", "T7"
                ]
            },
            sl: {// Slovenščina
                months: [
                    "Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"
                ]
            },
            cs: {// Čeština
                months: [
                    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
                ],
                dayOfWeek: [
                    "Ne", "Po", "Út", "St", "Čt", "Pá", "So"
                ]
            },
            hu: {// Hungarian
                months: [
                    "Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"
                ],
                dayOfWeek: [
                    "Va", "Hé", "Ke", "Sze", "Cs", "Pé", "Szo"
                ]
            },
            az: {//Azerbaijanian (Azeri)
                months: [
                    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
                ],
                dayOfWeek: [
                    "B", "Be", "Ça", "Ç", "Ca", "C", "Ş"
                ]
            },
            bs: {//Bosanski
                months: [
                    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
                ]
            },
            ca: {//Català
                months: [
                    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
                ],
                dayOfWeek: [
                    "Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds"
                ]
            },
            'en-GB': {//English (British)
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            et: {//"Eesti"
                months: [
                    "Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"
                ],
                dayOfWeek: [
                    "P", "E", "T", "K", "N", "R", "L"
                ]
            },
            eu: {//Euskara
                months: [
                    "Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"
                ],
                dayOfWeek: [
                    "Ig.", "Al.", "Ar.", "Az.", "Og.", "Or.", "La."
                ]
            },
            fi: {//Finnish (Suomi)
                months: [
                    "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"
                ],
                dayOfWeek: [
                    "Su", "Ma", "Ti", "Ke", "To", "Pe", "La"
                ]
            },
            gl: {//Galego
                months: [
                    "Xan", "Feb", "Maz", "Abr", "Mai", "Xun", "Xul", "Ago", "Set", "Out", "Nov", "Dec"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mer", "Xov", "Ven", "Sab"
                ]
            },
            hr: {//Hrvatski
                months: [
                    "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
                ]
            },
            ko: {//Korean (한국어)
                months: [
                    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayOfWeek: [
                    "일", "월", "화", "수", "목", "금", "토"
                ]
            },
            lt: {//Lithuanian (lietuvių)
                months: [
                    "Sausio", "Vasario", "Kovo", "Balandžio", "Gegužės", "Birželio", "Liepos", "Rugpjūčio", "Rugsėjo", "Spalio", "Lapkričio", "Gruodžio"
                ],
                dayOfWeek: [
                    "Sek", "Pir", "Ant", "Tre", "Ket", "Pen", "Šeš"
                ]
            },
            lv: {//Latvian (Latviešu)
                months: [
                    "Janvāris", "Februāris", "Marts", "Aprīlis ", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"
                ],
                dayOfWeek: [
                    "Sv", "Pr", "Ot", "Tr", "Ct", "Pk", "St"
                ]
            },
            mk: {//Macedonian (Македонски)
                months: [
                    "јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"
                ],
                dayOfWeek: [
                    "нед", "пон", "вто", "сре", "чет", "пет", "саб"
                ]
            },
            mn: {//Mongolian (Монгол)
                months: [
                    "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"
                ],
                dayOfWeek: [
                    "Дав", "Мяг", "Лха", "Пүр", "Бсн", "Бям", "Ням"
                ]
            },
            'pt-BR': {//Português(Brasil)
                months: [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ],
                dayOfWeek: [
                    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
                ]
            },
            sk: {//Slovenčina
                months: [
                    "Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"
                ],
                dayOfWeek: [
                    "Ne", "Po", "Ut", "St", "Št", "Pi", "So"
                ]
            },
            sq: {//Albanian (Shqip)
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            'sr-YU': {//Serbian (Srpski)
                months: [
                    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sre", "čet", "Pet", "Sub"
                ]
            },
            sr: {//Serbian Cyrillic (Српски)
                months: [
                    "јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"
                ],
                dayOfWeek: [
                    "нед", "пон", "уто", "сре", "чет", "пет", "суб"
                ]
            },
            sv: {//Svenska
                months: [
                    "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
                ]
            },
            'zh-TW': {//Traditional Chinese (繁體中文)
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            zh: {//Simplified Chinese (简体中文)
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            he: {//Hebrew (עברית)
                months: [
                    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
                ],
                dayOfWeek: [
                    'א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'שבת'
                ]
            },
            hy: {// Armenian
                months: [
                    "Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս", "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր"
                ],
                dayOfWeek: [
                    "Կի", "Երկ", "Երք", "Չոր", "Հնգ", "Ուրբ", "Շբթ"
                ]
            },
            kg: {// Kyrgyz
                months: [
                    'Үчтүн айы', 'Бирдин айы', 'Жалган Куран', 'Чын Куран', 'Бугу', 'Кулжа', 'Теке', 'Баш Оона', 'Аяк Оона', 'Тогуздун айы', 'Жетинин айы', 'Бештин айы'
                ],
                dayOfWeek: [
                    "Жек", "Дүй", "Шей", "Шар", "Бей", "Жум", "Ише"
                ]
            }
        },
        value: '',
        lang: 'en',
        format: 'Y/m/d H:i',
        formatTime: 'H:i',
        formatDate: 'Y/m/d',
        startDate: false, // new Date(), '1986/12/08', '-1970/01/05','-1970/01/05',
        step: 60,
        monthChangeSpinner: true,
        closeOnDateSelect: false,
        closeOnTimeSelect: false,
        closeOnWithoutClick: true,
        closeOnInputClick: true,
        timepicker: true,
        datepicker: true,
        weeks: false,
        defaultTime: false, // use formatTime format (ex. '10:00' for formatTime:	'H:i')
        defaultDate: false, // use formatDate format (ex new Date() or '1986/12/08' or '-1970/01/05' or '-1970/01/05')

        minDate: false,
        maxDate: false,
        minTime: false,
        maxTime: false,
        allowTimes: [],
        opened: false,
        initTime: true,
        inline: false,
        theme: '',
        onSelectDate: function () {
        },
        onSelectTime: function () {
        },
        onChangeMonth: function () {
        },
        onChangeYear: function () {
        },
        onChangeDateTime: function () {
        },
        onShow: function () {
        },
        onClose: function () {
        },
        onGenerate: function () {
        },
        withoutCopyright: true,
        inverseButton: false,
        hours12: false,
        next: 'xdsoft_next',
        prev: 'xdsoft_prev',
        dayOfWeekStart: 0,
        parentID: 'body',
        timeHeightInTimePicker: 25,
        timepickerScrollbar: true,
        todayButton: true,
        prevButton: true,
        nextButton: true,
        defaultSelect: true,
        scrollMonth: true,
        scrollTime: true,
        scrollInput: true,
        lazyInit: false,
        mask: false,
        validateOnBlur: true,
        allowBlank: true,
        yearStart: 1950,
        yearEnd: 2050,
        monthStart: 0,
        monthEnd: 11,
        style: '',
        id: '',
        fixed: false,
        roundTime: 'round', // ceil, floor
        className: '',
        weekends: [],
        disabledDates: [],
        yearOffset: 0,
        beforeShowDay: null,
        enterLikeTab: true,
        showApplyButton: false
    };
    // fix for ie8
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            var i, j;
            for (i = (start || 0), j = this.length; i < j; i += 1) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        };
    }
    Date.prototype.countDaysInMonth = function () {
        return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
    };
    $.fn.xdsoftScroller = function (percent) {
        return this.each(function () {
            var timeboxparent = $(this),
                    pointerEventToXY = function (e) {
                        var out = {x: 0, y: 0},
                        touch;
                        if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
                            touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                            out.x = touch.clientX;
                            out.y = touch.clientY;
                        } else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave') {
                            out.x = e.clientX;
                            out.y = e.clientY;
                        }
                        return out;
                    },
                    move = 0,
                    timebox,
                    parentHeight,
                    height,
                    scrollbar,
                    scroller,
                    maximumOffset = 100,
                    start = false,
                    startY = 0,
                    startTop = 0,
                    h1 = 0,
                    touchStart = false,
                    startTopScroll = 0,
                    calcOffset = function () {
                    };
            if (percent === 'hide') {
                timeboxparent.find('.xdsoft_scrollbar').hide();
                return;
            }
            if (!$(this).hasClass('xdsoft_scroller_box')) {
                timebox = timeboxparent.children().eq(0);
                parentHeight = timeboxparent[0].clientHeight;
                height = timebox[0].offsetHeight;
                scrollbar = $('<div class="xdsoft_scrollbar"></div>');
                scroller = $('<div class="xdsoft_scroller"></div>');
                scrollbar.append(scroller);

                timeboxparent.addClass('xdsoft_scroller_box').append(scrollbar);
                calcOffset = function calcOffset(event) {
                    var offset = pointerEventToXY(event).y - startY + startTopScroll;
                    if (offset < 0) {
                        offset = 0;
                    }
                    if (offset + scroller[0].offsetHeight > h1) {
                        offset = h1 - scroller[0].offsetHeight;
                    }
                    timeboxparent.trigger('scroll_element.xdsoft_scroller', [maximumOffset ? offset / maximumOffset : 0]);
                };

                scroller
                        .on('touchstart.xdsoft_scroller mousedown.xdsoft_scroller', function (event) {
                            if (!parentHeight) {
                                timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
                            }

                            startY = pointerEventToXY(event).y;
                            startTopScroll = parseInt(scroller.css('margin-top'), 10);
                            h1 = scrollbar[0].offsetHeight;

                            if (event.type === 'mousedown') {
                                if (document) {
                                    $(document.body).addClass('xdsoft_noselect');
                                }
                                $([document.body, window]).on('mouseup.xdsoft_scroller', function arguments_callee() {
                                    $([document.body, window]).off('mouseup.xdsoft_scroller', arguments_callee)
                                            .off('mousemove.xdsoft_scroller', calcOffset)
                                            .removeClass('xdsoft_noselect');
                                });
                                $(document.body).on('mousemove.xdsoft_scroller', calcOffset);
                            } else {
                                touchStart = true;
                                event.stopPropagation();
                                event.preventDefault();
                            }
                        })
                        .on('touchmove', function (event) {
                            if (touchStart) {
                                event.preventDefault();
                                calcOffset(event);
                            }
                        })
                        .on('touchend touchcancel', function (event) {
                            touchStart = false;
                            startTopScroll = 0;
                        });

                timeboxparent
                        .on('scroll_element.xdsoft_scroller', function (event, percentage) {
                            if (!parentHeight) {
                                timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percentage, true]);
                            }
                            percentage = percentage > 1 ? 1 : (percentage < 0 || isNaN(percentage)) ? 0 : percentage;

                            scroller.css('margin-top', maximumOffset * percentage);

                            setTimeout(function () {
                                timebox.css('marginTop', -parseInt((timebox[0].offsetHeight - parentHeight) * percentage, 10));
                            }, 10);
                        })
                        .on('resize_scroll.xdsoft_scroller', function (event, percentage, noTriggerScroll) {
                            var percent, sh;
                            parentHeight = timeboxparent[0].clientHeight;
                            height = timebox[0].offsetHeight;
                            percent = parentHeight / height;
                            sh = percent * scrollbar[0].offsetHeight;
                            if (percent > 1) {
                                scroller.hide();
                            } else {
                                scroller.show();
                                scroller.css('height', parseInt(sh > 10 ? sh : 10, 10));
                                maximumOffset = scrollbar[0].offsetHeight - scroller[0].offsetHeight;
                                if (noTriggerScroll !== true) {
                                    timeboxparent.trigger('scroll_element.xdsoft_scroller', [percentage || Math.abs(parseInt(timebox.css('marginTop'), 10)) / (height - parentHeight)]);
                                }
                            }
                        });

                timeboxparent.on('mousewheel', function (event) {
                    var top = Math.abs(parseInt(timebox.css('marginTop'), 10));

                    top = top - (event.deltaY * 20);
                    if (top < 0) {
                        top = 0;
                    }

                    timeboxparent.trigger('scroll_element.xdsoft_scroller', [top / (height - parentHeight)]);
                    event.stopPropagation();
                    return false;
                });

                timeboxparent.on('touchstart', function (event) {
                    start = pointerEventToXY(event);
                    startTop = Math.abs(parseInt(timebox.css('marginTop'), 10));
                });

                timeboxparent.on('touchmove', function (event) {
                    if (start) {
                        event.preventDefault();
                        var coord = pointerEventToXY(event);
                        timeboxparent.trigger('scroll_element.xdsoft_scroller', [(startTop - (coord.y - start.y)) / (height - parentHeight)]);
                    }
                });

                timeboxparent.on('touchend touchcancel', function (event) {
                    start = false;
                    startTop = 0;
                });
            }
            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
        });
    };

    $.fn.datetimepicker = function (opt) {
        var KEY0 = 48,
                KEY9 = 57,
                _KEY0 = 96,
                _KEY9 = 105,
                CTRLKEY = 17,
                DEL = 46,
                ENTER = 13,
                ESC = 27,
                BACKSPACE = 8,
                ARROWLEFT = 37,
                ARROWUP = 38,
                ARROWRIGHT = 39,
                ARROWDOWN = 40,
                TAB = 9,
                F5 = 116,
                AKEY = 65,
                CKEY = 67,
                VKEY = 86,
                ZKEY = 90,
                YKEY = 89,
                ctrlDown = false,
                options = ($.isPlainObject(opt) || !opt) ? $.extend(true, {}, default_options, opt) : $.extend(true, {}, default_options),
                lazyInitTimer = 0,
                createDateTimePicker,
                destroyDateTimePicker,
                lazyInit = function (input) {
                    input
                            .on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function initOnActionCallback(event) {
                                if (input.is(':disabled') || input.data('xdsoft_datetimepicker')) {
                                    return;
                                }
                                clearTimeout(lazyInitTimer);
                                lazyInitTimer = setTimeout(function () {

                                    if (!input.data('xdsoft_datetimepicker')) {
                                        createDateTimePicker(input);
                                    }
                                    input
                                            .off('open.xdsoft focusin.xdsoft mousedown.xdsoft', initOnActionCallback)
                                            .trigger('open.xdsoft');
                                }, 100);
                            });
                };

        createDateTimePicker = function (input) {
            var datetimepicker = $('<div ' + (options.id ? 'id="' + options.id + '"' : '') + ' ' + (options.style ? 'style="' + options.style + '"' : '') + ' class="xdsoft_datetimepicker xdsoft_' + options.theme + ' xdsoft_noselect ' + (options.weeks ? ' xdsoft_showweeks' : '') + options.className + '"></div>'),
                    xdsoft_copyright = $('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'),
                    datepicker = $('<div class="xdsoft_datepicker active"></div>'),
                    mounth_picker = $('<div class="xdsoft_mounthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button>' +
                            '<div class="xdsoft_label xdsoft_month"><span></span><i></i></div>' +
                            '<div class="xdsoft_label xdsoft_year"><span></span><i></i></div>' +
                            '<button type="button" class="xdsoft_next"></button></div>'),
                    calendar = $('<div class="xdsoft_calendar"></div>'),
                    timepicker = $('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'),
                    timeboxparent = timepicker.find('.xdsoft_time_box').eq(0),
                    timebox = $('<div class="xdsoft_time_variant"></div>'),
                    applyButton = $('<button class="xdsoft_save_selected blue-gradient-button">Save Selected</button>'),
                    /*scrollbar = $('<div class="xdsoft_scrollbar"></div>'),
                     scroller = $('<div class="xdsoft_scroller"></div>'),*/
                    monthselect = $('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'),
                    yearselect = $('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'),
                    triggerAfterOpen = false,
                    XDSoft_datetime,
                    //scroll_element,
                    xchangeTimer,
                    timerclick,
                    current_time_index,
                    setPos,
                    timer = 0,
                    timer1 = 0,
                    _xdsoft_datetime;

            mounth_picker
                    .find('.xdsoft_month span')
                    .after(monthselect);
            mounth_picker
                    .find('.xdsoft_year span')
                    .after(yearselect);

            mounth_picker
                    .find('.xdsoft_month,.xdsoft_year')
                    .on('mousedown.xdsoft', function (event) {
                        var select = $(this).find('.xdsoft_select').eq(0),
                                val = 0,
                                top = 0,
                                visible = select.is(':visible'),
                                items,
                                i;

                        mounth_picker
                                .find('.xdsoft_select')
                                .hide();
                        if (_xdsoft_datetime.currentTime) {
                            val = _xdsoft_datetime.currentTime[$(this).hasClass('xdsoft_month') ? 'getMonth' : 'getFullYear']();
                        }

                        select[visible ? 'hide' : 'show']();
                        for (items = select.find('div.xdsoft_option'), i = 0; i < items.length; i += 1) {
                            if (items.eq(i).data('value') === val) {
                                break;
                            } else {
                                top += items[0].offsetHeight;
                            }
                        }

                        select.xdsoftScroller(top / (select.children()[0].offsetHeight - (select[0].clientHeight)));
                        event.stopPropagation();
                        return false;
                    });

            mounth_picker
                    .find('.xdsoft_select')
                    .xdsoftScroller()
                    .on('mousedown.xdsoft', function (event) {
                        event.stopPropagation();
                        event.preventDefault();
                    })
                    .on('mousedown.xdsoft', '.xdsoft_option', function (event) {

                        if (_xdsoft_datetime.currentTime === undefined || _xdsoft_datetime.currentTime === null) {
                            _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                        }

                        var year = _xdsoft_datetime.currentTime.getFullYear();
                        if (_xdsoft_datetime && _xdsoft_datetime.currentTime) {
                            _xdsoft_datetime.currentTime[$(this).parent().parent().hasClass('xdsoft_monthselect') ? 'setMonth' : 'setFullYear']($(this).data('value'));
                        }

                        $(this).parent().parent().hide();

                        datetimepicker.trigger('xchange.xdsoft');
                        if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                            options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                        }

                        if (year !== _xdsoft_datetime.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
                            options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                        }
                    });

            datetimepicker.setOptions = function (_options) {
                options = $.extend(true, {}, options, _options);

                if (_options.allowTimes && $.isArray(_options.allowTimes) && _options.allowTimes.length) {
                    options.allowTimes = $.extend(true, [], _options.allowTimes);
                }

                if (_options.weekends && $.isArray(_options.weekends) && _options.weekends.length) {
                    options.weekends = $.extend(true, [], _options.weekends);
                }

                if (_options.disabledDates && $.isArray(_options.disabledDates) && _options.disabledDates.length) {
                    options.disabledDates = $.extend(true, [], _options.disabledDates);
                }

                if ((options.open || options.opened) && (!options.inline)) {
                    input.trigger('open.xdsoft');
                }

                if (options.inline) {
                    triggerAfterOpen = true;
                    datetimepicker.addClass('xdsoft_inline');
                    input.after(datetimepicker).hide();
                }

                if (options.inverseButton) {
                    options.next = 'xdsoft_prev';
                    options.prev = 'xdsoft_next';
                }

                if (options.datepicker) {
                    datepicker.addClass('active');
                } else {
                    datepicker.removeClass('active');
                }

                if (options.timepicker) {
                    timepicker.addClass('active');
                } else {
                    timepicker.removeClass('active');
                }

                if (options.value) {
                    if (input && input.val) {
                        input.val(options.value);
                    }
                    _xdsoft_datetime.setCurrentTime(options.value);
                }

                if (isNaN(options.dayOfWeekStart)) {
                    options.dayOfWeekStart = 0;
                } else {
                    options.dayOfWeekStart = parseInt(options.dayOfWeekStart, 10) % 7;
                }

                if (!options.timepickerScrollbar) {
                    timeboxparent.xdsoftScroller('hide');
                }

                if (options.minDate && /^-(.*)$/.test(options.minDate)) {
                    options.minDate = _xdsoft_datetime.strToDateTime(options.minDate).dateFormat(options.formatDate);
                }

                if (options.maxDate && /^\+(.*)$/.test(options.maxDate)) {
                    options.maxDate = _xdsoft_datetime.strToDateTime(options.maxDate).dateFormat(options.formatDate);
                }

                applyButton.toggle(options.showApplyButton);

                mounth_picker
                        .find('.xdsoft_today_button')
                        .css('visibility', !options.todayButton ? 'hidden' : 'visible');

                mounth_picker
                        .find('.' + options.prev)
                        .css('visibility', !options.prevButton ? 'hidden' : 'visible');

                mounth_picker
                        .find('.' + options.next)
                        .css('visibility', !options.nextButton ? 'hidden' : 'visible');

                if (options.mask) {
                    var e,
                            getCaretPos = function (input) {
                                try {
                                    if (document.selection && document.selection.createRange) {
                                        var range = document.selection.createRange();
                                        return range.getBookmark().charCodeAt(2) - 2;
                                    }
                                    if (input.setSelectionRange) {
                                        return input.selectionStart;
                                    }
                                } catch (e) {
                                    return 0;
                                }
                            },
                            setCaretPos = function (node, pos) {
                                node = (typeof node === "string" || node instanceof String) ? document.getElementById(node) : node;
                                if (!node) {
                                    return false;
                                }
                                if (node.createTextRange) {
                                    var textRange = node.createTextRange();
                                    textRange.collapse(true);
                                    textRange.moveEnd('character', pos);
                                    textRange.moveStart('character', pos);
                                    textRange.select();
                                    return true;
                                }
                                if (node.setSelectionRange) {
                                    node.setSelectionRange(pos, pos);
                                    return true;
                                }
                                return false;
                            },
                            isValidValue = function (mask, value) {
                                var reg = mask
                                        .replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g, '\\$1')
                                        .replace(/_/g, '{digit+}')
                                        .replace(/([0-9]{1})/g, '{digit$1}')
                                        .replace(/\{digit([0-9]{1})\}/g, '[0-$1_]{1}')
                                        .replace(/\{digit[\+]\}/g, '[0-9_]{1}');
                                return (new RegExp(reg)).test(value);
                            };
                    input.off('keydown.xdsoft');

                    if (options.mask === true) {
                        options.mask = options.format
                                .replace(/Y/g, '9999')
                                .replace(/F/g, '9999')
                                .replace(/m/g, '19')
                                .replace(/d/g, '39')
                                .replace(/H/g, '29')
                                .replace(/i/g, '59')
                                .replace(/s/g, '59');
                    }

                    if ($.type(options.mask) === 'string') {
                        if (!isValidValue(options.mask, input.val())) {
                            input.val(options.mask.replace(/[0-9]/g, '_'));
                        }

                        input.on('keydown.xdsoft', function (event) {
                            var val = this.value,
                                    key = event.which,
                                    pos,
                                    digit;

                            if (((key >= KEY0 && key <= KEY9) || (key >= _KEY0 && key <= _KEY9)) || (key === BACKSPACE || key === DEL)) {
                                pos = getCaretPos(this);
                                digit = (key !== BACKSPACE && key !== DEL) ? String.fromCharCode((_KEY0 <= key && key <= _KEY9) ? key - KEY0 : key) : '_';

                                if ((key === BACKSPACE || key === DEL) && pos) {
                                    pos -= 1;
                                    digit = '_';
                                }

                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
                                    pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
                                }

                                val = val.substr(0, pos) + digit + val.substr(pos + 1);
                                if ($.trim(val) === '') {
                                    val = options.mask.replace(/[0-9]/g, '_');
                                } else {
                                    if (pos === options.mask.length) {
                                        event.preventDefault();
                                        return false;
                                    }
                                }

                                pos += (key === BACKSPACE || key === DEL) ? 0 : 1;
                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
                                    pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
                                }

                                if (isValidValue(options.mask, val)) {
                                    this.value = val;
                                    setCaretPos(this, pos);
                                } else if ($.trim(val) === '') {
                                    this.value = options.mask.replace(/[0-9]/g, '_');
                                } else {
                                    input.trigger('error_input.xdsoft');
                                }
                            } else {
                                if (([AKEY, CKEY, VKEY, ZKEY, YKEY].indexOf(key) !== -1 && ctrlDown) || [ESC, ARROWUP, ARROWDOWN, ARROWLEFT, ARROWRIGHT, F5, CTRLKEY, TAB, ENTER].indexOf(key) !== -1) {
                                    return true;
                                }
                            }

                            event.preventDefault();
                            return false;
                        });
                    }
                }
                if (options.validateOnBlur) {
                    input
                            .off('blur.xdsoft')
                            .on('blur.xdsoft', function () {
                                if (options.allowBlank && !$.trim($(this).val()).length) {
                                    $(this).val(null);
                                    datetimepicker.data('xdsoft_datetime').empty();
                                } else if (!Date.parseDate($(this).val(), options.format)) {
                                    var splittedHours = +([$(this).val()[0], $(this).val()[1]].join('')),
                                            splittedMinutes = +([$(this).val()[2], $(this).val()[3]].join(''));

                                    // parse the numbers as 0312 => 03:12
                                    if (!options.datepicker && options.timepicker && splittedHours >= 0 && splittedHours < 24 && splittedMinutes >= 0 && splittedMinutes < 60) {
                                        $(this).val([splittedHours, splittedMinutes].map(function (item) {
                                            return item > 9 ? item : '0' + item
                                        }).join(':'));
                                    } else {
                                        $(this).val((_xdsoft_datetime.now()).dateFormat(options.format));
                                    }

                                    datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                                } else {
                                    datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                                }

                                datetimepicker.trigger('changedatetime.xdsoft');
                            });
                }
                options.dayOfWeekStartPrev = (options.dayOfWeekStart === 0) ? 6 : options.dayOfWeekStart - 1;

                datetimepicker
                        .trigger('xchange.xdsoft')
                        .trigger('afterOpen.xdsoft');
            };

            datetimepicker
                    .data('options', options)
                    .on('mousedown.xdsoft', function (event) {
                        event.stopPropagation();
                        event.preventDefault();
                        yearselect.hide();
                        monthselect.hide();
                        return false;
                    });

            //scroll_element = timepicker.find('.xdsoft_time_box');
            timeboxparent.append(timebox);
            timeboxparent.xdsoftScroller();

            datetimepicker.on('afterOpen.xdsoft', function () {
                timeboxparent.xdsoftScroller();
            });

            datetimepicker
                    .append(datepicker)
                    .append(timepicker);

            if (options.withoutCopyright !== true) {
                datetimepicker
                        .append(xdsoft_copyright);
            }

            datepicker
                    .append(mounth_picker)
                    .append(calendar)
                    .append(applyButton);

            $(options.parentID)
                    .append(datetimepicker);

            XDSoft_datetime = function () {
                var _this = this;
                _this.now = function (norecursion) {
                    var d = new Date(),
                            date,
                            time;

                    if (!norecursion && options.defaultDate) {
                        date = _this.strToDate(options.defaultDate);
                        d.setFullYear(date.getFullYear());
                        d.setMonth(date.getMonth());
                        d.setDate(date.getDate());
                    }

                    if (options.yearOffset) {
                        d.setFullYear(d.getFullYear() + options.yearOffset);
                    }

                    if (!norecursion && options.defaultTime) {
                        time = _this.strtotime(options.defaultTime);
                        d.setHours(time.getHours());
                        d.setMinutes(time.getMinutes());
                    }

                    return d;
                };

                _this.isValidDate = function (d) {
                    if (Object.prototype.toString.call(d) !== "[object Date]") {
                        return false;
                    }
                    return !isNaN(d.getTime());
                };

                _this.setCurrentTime = function (dTime) {
                    _this.currentTime = (typeof dTime === 'string') ? _this.strToDateTime(dTime) : _this.isValidDate(dTime) ? dTime : _this.now();
                    datetimepicker.trigger('xchange.xdsoft');
                };

                _this.empty = function () {
                    _this.currentTime = null;
                };

                _this.getCurrentTime = function (dTime) {
                    return _this.currentTime;
                };

                _this.nextMonth = function () {

                    if (_this.currentTime === undefined || _this.currentTime === null) {
                        _this.currentTime = _this.now();
                    }

                    var month = _this.currentTime.getMonth() + 1,
                            year;
                    if (month === 12) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() + 1);
                        month = 0;
                    }

                    year = _this.currentTime.getFullYear();

                    _this.currentTime.setDate(
                            Math.min(
                                    new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
                                    _this.currentTime.getDate()
                                    )
                            );
                    _this.currentTime.setMonth(month);

                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    if (year !== _this.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
                        options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    datetimepicker.trigger('xchange.xdsoft');
                    return month;
                };

                _this.prevMonth = function () {

                    if (_this.currentTime === undefined || _this.currentTime === null) {
                        _this.currentTime = _this.now();
                    }

                    var month = _this.currentTime.getMonth() - 1;
                    if (month === -1) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() - 1);
                        month = 11;
                    }
                    _this.currentTime.setDate(
                            Math.min(
                                    new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
                                    _this.currentTime.getDate()
                                    )
                            );
                    _this.currentTime.setMonth(month);
                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                    datetimepicker.trigger('xchange.xdsoft');
                    return month;
                };

                _this.getWeekOfYear = function (datetime) {
                    var onejan = new Date(datetime.getFullYear(), 0, 1);
                    return Math.ceil((((datetime - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                };

                _this.strToDateTime = function (sDateTime) {
                    var tmpDate = [], timeOffset, currentTime;

                    if (sDateTime && sDateTime instanceof Date && _this.isValidDate(sDateTime)) {
                        return sDateTime;
                    }

                    tmpDate = /^(\+|\-)(.*)$/.exec(sDateTime);
                    if (tmpDate) {
                        tmpDate[2] = Date.parseDate(tmpDate[2], options.formatDate);
                    }
                    if (tmpDate && tmpDate[2]) {
                        timeOffset = tmpDate[2].getTime() - (tmpDate[2].getTimezoneOffset()) * 60000;
                        currentTime = new Date((_xdsoft_datetime.now()).getTime() + parseInt(tmpDate[1] + '1', 10) * timeOffset);
                    } else {
                        currentTime = sDateTime ? Date.parseDate(sDateTime, options.format) : _this.now();
                    }

                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now();
                    }

                    return currentTime;
                };

                _this.strToDate = function (sDate) {
                    if (sDate && sDate instanceof Date && _this.isValidDate(sDate)) {
                        return sDate;
                    }

                    var currentTime = sDate ? Date.parseDate(sDate, options.formatDate) : _this.now(true);
                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now(true);
                    }
                    return currentTime;
                };

                _this.strtotime = function (sTime) {
                    if (sTime && sTime instanceof Date && _this.isValidDate(sTime)) {
                        return sTime;
                    }
                    var currentTime = sTime ? Date.parseDate(sTime, options.formatTime) : _this.now(true);
                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now(true);
                    }
                    return currentTime;
                };

                _this.str = function () {
                    return _this.currentTime.dateFormat(options.format);
                };
                _this.currentTime = this.now();
            };

            _xdsoft_datetime = new XDSoft_datetime();

            applyButton.on('click', function (e) {//pathbrite
                e.preventDefault();
                datetimepicker.data('changed', true);
                _xdsoft_datetime.setCurrentTime(getCurrentValue());
                input.val(_xdsoft_datetime.str());
                datetimepicker.trigger('close.xdsoft');
            });
            mounth_picker
                    .find('.xdsoft_today_button')
                    .on('mousedown.xdsoft', function () {
                        datetimepicker.data('changed', true);
                        _xdsoft_datetime.setCurrentTime(0);
                        datetimepicker.trigger('afterOpen.xdsoft');
                    }).on('dblclick.xdsoft', function () {
                input.val(_xdsoft_datetime.str());
                datetimepicker.trigger('close.xdsoft');
            });
            mounth_picker
                    .find('.xdsoft_prev,.xdsoft_next')
                    .on('mousedown.xdsoft', function () {
                        var $this = $(this),
                                timer = 0,
                                stop = false;

                        (function arguments_callee1(v) {
                            if ($this.hasClass(options.next)) {
                                _xdsoft_datetime.nextMonth();
                            } else if ($this.hasClass(options.prev)) {
                                _xdsoft_datetime.prevMonth();
                            }
                            if (options.monthChangeSpinner) {
                                if (!stop) {
                                    timer = setTimeout(arguments_callee1, v || 100);
                                }
                            }
                        }(500));

                        $([document.body, window]).on('mouseup.xdsoft', function arguments_callee2() {
                            clearTimeout(timer);
                            stop = true;
                            $([document.body, window]).off('mouseup.xdsoft', arguments_callee2);
                        });
                    });

            timepicker
                    .find('.xdsoft_prev,.xdsoft_next')
                    .on('mousedown.xdsoft', function () {
                        var $this = $(this),
                                timer = 0,
                                stop = false,
                                period = 110;
                        (function arguments_callee4(v) {
                            var pheight = timeboxparent[0].clientHeight,
                                    height = timebox[0].offsetHeight,
                                    top = Math.abs(parseInt(timebox.css('marginTop'), 10));
                            if ($this.hasClass(options.next) && (height - pheight) - options.timeHeightInTimePicker >= top) {
                                timebox.css('marginTop', '-' + (top + options.timeHeightInTimePicker) + 'px');
                            } else if ($this.hasClass(options.prev) && top - options.timeHeightInTimePicker >= 0) {
                                timebox.css('marginTop', '-' + (top - options.timeHeightInTimePicker) + 'px');
                            }
                            timeboxparent.trigger('scroll_element.xdsoft_scroller', [Math.abs(parseInt(timebox.css('marginTop'), 10) / (height - pheight))]);
                            period = (period > 10) ? 10 : period - 10;
                            if (!stop) {
                                timer = setTimeout(arguments_callee4, v || period);
                            }
                        }(500));
                        $([document.body, window]).on('mouseup.xdsoft', function arguments_callee5() {
                            clearTimeout(timer);
                            stop = true;
                            $([document.body, window])
                                    .off('mouseup.xdsoft', arguments_callee5);
                        });
                    });

            xchangeTimer = 0;
            // base handler - generating a calendar and timepicker
            datetimepicker
                    .on('xchange.xdsoft', function (event) {
                        clearTimeout(xchangeTimer);
                        xchangeTimer = setTimeout(function () {

                            if (_xdsoft_datetime.currentTime === undefined || _xdsoft_datetime.currentTime === null) {
                                _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                            }

                            var table = '',
                                    start = new Date(_xdsoft_datetime.currentTime.getFullYear(), _xdsoft_datetime.currentTime.getMonth(), 1, 12, 0, 0),
                                    i = 0,
                                    j,
                                    today = _xdsoft_datetime.now(),
                                    maxDate = false,
                                    minDate = false,
                                    d,
                                    y,
                                    m,
                                    w,
                                    classes = [],
                                    customDateSettings,
                                    newRow = true,
                                    time = '',
                                    h = '',
                                    line_time;

                            while (start.getDay() !== options.dayOfWeekStart) {
                                start.setDate(start.getDate() - 1);
                            }

                            table += '<table><thead><tr>';

                            if (options.weeks) {
                                table += '<th></th>';
                            }

                            for (j = 0; j < 7; j += 1) {
                                table += '<th>' + options.i18n[options.lang].dayOfWeek[(j + options.dayOfWeekStart) % 7] + '</th>';
                            }

                            table += '</tr></thead>';
                            table += '<tbody>';

                            if (options.maxDate !== false) {
                                maxDate = _xdsoft_datetime.strToDate(options.maxDate);
                                maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999);
                            }

                            if (options.minDate !== false) {
                                minDate = _xdsoft_datetime.strToDate(options.minDate);
                                minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                            }

                            while (i < _xdsoft_datetime.currentTime.countDaysInMonth() || start.getDay() !== options.dayOfWeekStart || _xdsoft_datetime.currentTime.getMonth() === start.getMonth()) {
                                classes = [];
                                i += 1;

                                d = start.getDate();
                                y = start.getFullYear();
                                m = start.getMonth();
                                w = _xdsoft_datetime.getWeekOfYear(start);

                                classes.push('xdsoft_date');

                                if (options.beforeShowDay && $.isFunction(options.beforeShowDay.call)) {
                                    customDateSettings = options.beforeShowDay.call(datetimepicker, start);
                                } else {
                                    customDateSettings = null;
                                }

                                if ((maxDate !== false && start > maxDate) || (minDate !== false && start < minDate) || (customDateSettings && customDateSettings[0] === false)) {
                                    classes.push('xdsoft_disabled');
                                } else if (options.disabledDates.indexOf(start.dateFormat(options.formatDate)) !== -1) {
                                    classes.push('xdsoft_disabled');
                                }

                                if (customDateSettings && customDateSettings[1] !== "") {
                                    classes.push(customDateSettings[1]);
                                }

                                if (_xdsoft_datetime.currentTime.getMonth() !== m) {
                                    classes.push('xdsoft_other_month');
                                }

                                if ((options.defaultSelect || datetimepicker.data('changed')) && _xdsoft_datetime.currentTime.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
                                    classes.push('xdsoft_current');
                                }

                                if (today.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
                                    classes.push('xdsoft_today');
                                }

                                if (start.getDay() === 0 || start.getDay() === 6 || ~options.weekends.indexOf(start.dateFormat(options.formatDate))) {
                                    classes.push('xdsoft_weekend');
                                }

                                if (options.beforeShowDay && $.isFunction(options.beforeShowDay)) {
                                    classes.push(options.beforeShowDay(start));
                                }

                                if (newRow) {
                                    table += '<tr>';
                                    newRow = false;
                                    if (options.weeks) {
                                        table += '<th>' + w + '</th>';
                                    }
                                }

                                table += '<td data-date="' + d + '" data-month="' + m + '" data-year="' + y + '"' + ' class="xdsoft_date xdsoft_day_of_week' + start.getDay() + ' ' + classes.join(' ') + '">' +
                                        '<div>' + d + '</div>' +
                                        '</td>';

                                if (start.getDay() === options.dayOfWeekStartPrev) {
                                    table += '</tr>';
                                    newRow = true;
                                }

                                start.setDate(d + 1);
                            }
                            table += '</tbody></table>';

                            calendar.html(table);

                            mounth_picker.find('.xdsoft_label span').eq(0).text(options.i18n[options.lang].months[_xdsoft_datetime.currentTime.getMonth()]);
                            mounth_picker.find('.xdsoft_label span').eq(1).text(_xdsoft_datetime.currentTime.getFullYear());

                            // generate timebox
                            time = '';
                            h = '';
                            m = '';
                            line_time = function line_time(h, m) {
                                var now = _xdsoft_datetime.now();
                                now.setHours(h);
                                h = parseInt(now.getHours(), 10);
                                now.setMinutes(m);
                                m = parseInt(now.getMinutes(), 10);
                                var optionDateTime = new Date(_xdsoft_datetime.currentTime);
                                optionDateTime.setHours(h);
                                optionDateTime.setMinutes(m);
                                classes = [];
                                if ((options.minDateTime !== false && options.minDateTime > optionDateTime) || (options.maxTime !== false && _xdsoft_datetime.strtotime(options.maxTime).getTime() < now.getTime()) || (options.minTime !== false && _xdsoft_datetime.strtotime(options.minTime).getTime() > now.getTime())) {
                                    classes.push('xdsoft_disabled');
                                }

                                var current_time = new Date(_xdsoft_datetime.currentTime);
                                current_time.setHours(parseInt(_xdsoft_datetime.currentTime.getHours(), 10));
                                current_time.setMinutes(Math[options.roundTime](_xdsoft_datetime.currentTime.getMinutes() / options.step) * options.step);

                                if ((options.initTime || options.defaultSelect || datetimepicker.data('changed')) && current_time.getHours() === parseInt(h, 10) && (options.step > 59 || current_time.getMinutes() === parseInt(m, 10))) {
                                    if (options.defaultSelect || datetimepicker.data('changed')) {
                                        classes.push('xdsoft_current');
                                    } else if (options.initTime) {
                                        classes.push('xdsoft_init_time');
                                    }
                                }
                                if (parseInt(today.getHours(), 10) === parseInt(h, 10) && parseInt(today.getMinutes(), 10) === parseInt(m, 10)) {
                                    classes.push('xdsoft_today');
                                }
                                time += '<div class="xdsoft_time ' + classes.join(' ') + '" data-hour="' + h + '" data-minute="' + m + '">' + now.dateFormat(options.formatTime) + '</div>';
                            };

                            if (!options.allowTimes || !$.isArray(options.allowTimes) || !options.allowTimes.length) {
                                for (i = 0, j = 0; i < (options.hours12 ? 12 : 24); i += 1) {
                                    for (j = 0; j < 60; j += options.step) {
                                        h = (i < 10 ? '0' : '') + i;
                                        m = (j < 10 ? '0' : '') + j;
                                        line_time(h, m);
                                    }
                                }
                            } else {
                                for (i = 0; i < options.allowTimes.length; i += 1) {
                                    h = _xdsoft_datetime.strtotime(options.allowTimes[i]).getHours();
                                    m = _xdsoft_datetime.strtotime(options.allowTimes[i]).getMinutes();
                                    line_time(h, m);
                                }
                            }

                            timebox.html(time);

                            opt = '';
                            i = 0;

                            for (i = parseInt(options.yearStart, 10) + options.yearOffset; i <= parseInt(options.yearEnd, 10) + options.yearOffset; i += 1) {
                                opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getFullYear() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + i + '</div>';
                            }
                            yearselect.children().eq(0)
                                    .html(opt);

                            for (i = parseInt(options.monthStart), opt = ''; i <= parseInt(options.monthEnd); i += 1) {
                                opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getMonth() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + options.i18n[options.lang].months[i] + '</div>';
                            }
                            monthselect.children().eq(0).html(opt);
                            $(datetimepicker)
                                    .trigger('generate.xdsoft');
                        }, 10);
                        event.stopPropagation();
                    })
                    .on('afterOpen.xdsoft', function () {
                        if (options.timepicker) {
                            var classType, pheight, height, top;
                            if (timebox.find('.xdsoft_current').length) {
                                classType = '.xdsoft_current';
                            } else if (timebox.find('.xdsoft_init_time').length) {
                                classType = '.xdsoft_init_time';
                            }
                            if (classType) {
                                pheight = timeboxparent[0].clientHeight;
                                height = timebox[0].offsetHeight;
                                top = timebox.find(classType).index() * options.timeHeightInTimePicker + 1;
                                if ((height - pheight) < top) {
                                    top = height - pheight;
                                }
                                timeboxparent.trigger('scroll_element.xdsoft_scroller', [parseInt(top, 10) / (height - pheight)]);
                            } else {
                                timeboxparent.trigger('scroll_element.xdsoft_scroller', [0]);
                            }
                        }
                    });

            timerclick = 0;
            calendar
                    .on('click.xdsoft', 'td', function (xdevent) {
                        xdevent.stopPropagation();  // Prevents closing of Pop-ups, Modals and Flyouts in Bootstrap
                        timerclick += 1;
                        var $this = $(this),
                                currentTime = _xdsoft_datetime.currentTime;

                        if (currentTime === undefined || currentTime === null) {
                            _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                            currentTime = _xdsoft_datetime.currentTime;
                        }

                        if ($this.hasClass('xdsoft_disabled')) {
                            return false;
                        }

                        currentTime.setDate(1);
                        currentTime.setFullYear($this.data('year'));
                        currentTime.setMonth($this.data('month'));
                        currentTime.setDate($this.data('date'));

                        datetimepicker.trigger('select.xdsoft', [currentTime]);

                        input.val(_xdsoft_datetime.str());
                        if ((timerclick > 1 || (options.closeOnDateSelect === true || (options.closeOnDateSelect === 0 && !options.timepicker))) && !options.inline) {
                            datetimepicker.trigger('close.xdsoft');
                        }

                        if (options.onSelectDate && $.isFunction(options.onSelectDate)) {
                            options.onSelectDate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
                        }

                        datetimepicker.data('changed', true);
                        datetimepicker.trigger('xchange.xdsoft');
                        datetimepicker.trigger('changedatetime.xdsoft');
                        setTimeout(function () {
                            timerclick = 0;
                        }, 200);
                    });

            timebox
                    .on('click.xdsoft', 'div', function (xdevent) {
                        xdevent.stopPropagation();
                        var $this = $(this),
                                currentTime = _xdsoft_datetime.currentTime;

                        if (currentTime === undefined || currentTime === null) {
                            _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                            currentTime = _xdsoft_datetime.currentTime;
                        }

                        if ($this.hasClass('xdsoft_disabled')) {
                            return false;
                        }
                        currentTime.setHours($this.data('hour'));
                        currentTime.setMinutes($this.data('minute'));
                        datetimepicker.trigger('select.xdsoft', [currentTime]);

                        datetimepicker.data('input').val(_xdsoft_datetime.str());

                        if (options.inline !== true && options.closeOnTimeSelect === true) {
                            datetimepicker.trigger('close.xdsoft');
                        }

                        if (options.onSelectTime && $.isFunction(options.onSelectTime)) {
                            options.onSelectTime.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
                        }
                        datetimepicker.data('changed', true);
                        datetimepicker.trigger('xchange.xdsoft');
                        datetimepicker.trigger('changedatetime.xdsoft');
                    });


            datepicker
                    .on('mousewheel.xdsoft', function (event) {
                        if (!options.scrollMonth) {
                            return true;
                        }
                        if (event.deltaY < 0) {
                            _xdsoft_datetime.nextMonth();
                        } else {
                            _xdsoft_datetime.prevMonth();
                        }
                        return false;
                    });

            input
                    .on('mousewheel.xdsoft', function (event) {
                        if (!options.scrollInput) {
                            return true;
                        }
                        if (!options.datepicker && options.timepicker) {
                            current_time_index = timebox.find('.xdsoft_current').length ? timebox.find('.xdsoft_current').eq(0).index() : 0;
                            if (current_time_index + event.deltaY >= 0 && current_time_index + event.deltaY < timebox.children().length) {
                                current_time_index += event.deltaY;
                            }
                            if (timebox.children().eq(current_time_index).length) {
                                timebox.children().eq(current_time_index).trigger('mousedown');
                            }
                            return false;
                        }
                        if (options.datepicker && !options.timepicker) {
                            datepicker.trigger(event, [event.deltaY, event.deltaX, event.deltaY]);
                            if (input.val) {
                                input.val(_xdsoft_datetime.str());
                            }
                            datetimepicker.trigger('changedatetime.xdsoft');
                            return false;
                        }
                    });

            datetimepicker
                    .on('changedatetime.xdsoft', function (event) {
                        if (options.onChangeDateTime && $.isFunction(options.onChangeDateTime)) {
                            var $input = datetimepicker.data('input');
                            options.onChangeDateTime.call(datetimepicker, _xdsoft_datetime.currentTime, $input, event);
                            delete options.value;
                            $input.trigger('change');
                        }
                    })
                    .on('generate.xdsoft', function () {
                        if (options.onGenerate && $.isFunction(options.onGenerate)) {
                            options.onGenerate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                        }
                        if (triggerAfterOpen) {
                            datetimepicker.trigger('afterOpen.xdsoft');
                            triggerAfterOpen = false;
                        }
                    })
                    .on('click.xdsoft', function (xdevent) {
                        xdevent.stopPropagation();
                    });

            current_time_index = 0;

            setPos = function () {
                var offset = datetimepicker.data('input').offset(), top = offset.top + datetimepicker.data('input')[0].offsetHeight - 1, left = offset.left, position = "absolute";
                if (options.fixed) {
                    top -= $(window).scrollTop();
                    left -= $(window).scrollLeft();
                    position = "fixed";
                } else {
                    if (top + datetimepicker[0].offsetHeight > $(window).height() + $(window).scrollTop()) {
                        top = offset.top - datetimepicker[0].offsetHeight + 1;
                    }
                    if (top < 0) {
                        top = 0;
                    }
                    if (left + datetimepicker[0].offsetWidth > $(window).width()) {
                        left = $(window).width() - datetimepicker[0].offsetWidth;
                    }
                }
                datetimepicker.css({
                    left: left,
                    top: top,
                    position: position
                });
            };
            datetimepicker
                    .on('open.xdsoft', function (event) {
                        var onShow = true;
                        if (options.onShow && $.isFunction(options.onShow)) {
                            onShow = options.onShow.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
                        }
                        if (onShow !== false) {
                            datetimepicker.show();
                            setPos();
                            $(window)
                                    .off('resize.xdsoft', setPos)
                                    .on('resize.xdsoft', setPos);

                            if (options.closeOnWithoutClick) {
                                $([document.body, window]).on('mousedown.xdsoft', function arguments_callee6() {
                                    datetimepicker.trigger('close.xdsoft');
                                    $([document.body, window]).off('mousedown.xdsoft', arguments_callee6);
                                });
                            }
                        }
                    })
                    .on('close.xdsoft', function (event) {
                        var onClose = true;
                        mounth_picker
                                .find('.xdsoft_month,.xdsoft_year')
                                .find('.xdsoft_select')
                                .hide();
                        if (options.onClose && $.isFunction(options.onClose)) {
                            onClose = options.onClose.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
                        }
                        if (onClose !== false && !options.opened && !options.inline) {
                            datetimepicker.hide();
                        }
                        event.stopPropagation();
                    })
                    .on('toggle.xdsoft', function (event) {
                        if (datetimepicker.is(':visible')) {
                            datetimepicker.trigger('close.xdsoft');
                        } else {
                            datetimepicker.trigger('open.xdsoft');
                        }
                    })
                    .data('input', input);

            timer = 0;
            timer1 = 0;

            datetimepicker.data('xdsoft_datetime', _xdsoft_datetime);
            datetimepicker.setOptions(options);

            function getCurrentValue() {

                var ct = false, time;

                if (options.startDate) {
                    ct = _xdsoft_datetime.strToDate(options.startDate);
                } else {
                    ct = options.value || ((input && input.val && input.val()) ? input.val() : '');
                    if (ct) {
                        ct = _xdsoft_datetime.strToDateTime(ct);
                    } else if (options.defaultDate) {
                        ct = _xdsoft_datetime.strToDate(options.defaultDate);
                        if (options.defaultTime) {
                            time = _xdsoft_datetime.strtotime(options.defaultTime);
                            ct.setHours(time.getHours());
                            ct.setMinutes(time.getMinutes());
                        }
                    }
                }

                if (ct && _xdsoft_datetime.isValidDate(ct)) {
                    datetimepicker.data('changed', true);
                } else {
                    ct = '';
                }

                return ct || 0;
            }

            _xdsoft_datetime.setCurrentTime(getCurrentValue());

            input
                    .data('xdsoft_datetimepicker', datetimepicker)
                    .on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function (event) {
                        if (input.is(':disabled') || (input.data('xdsoft_datetimepicker').is(':visible') && options.closeOnInputClick)) {
                            return;
                        }
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            if (input.is(':disabled')) {
                                return;
                            }

                            triggerAfterOpen = true;
                            _xdsoft_datetime.setCurrentTime(getCurrentValue());

                            datetimepicker.trigger('open.xdsoft');
                        }, 100);
                    })
                    .on('keydown.xdsoft', function (event) {
                        var val = this.value, elementSelector,
                                key = event.which;
                        if ([ENTER].indexOf(key) !== -1 && options.enterLikeTab) {
                            elementSelector = $("input:visible,textarea:visible");
                            datetimepicker.trigger('close.xdsoft');
                            elementSelector.eq(elementSelector.index(this) + 1).focus();
                            return false;
                        }
                        if ([TAB].indexOf(key) !== -1) {
                            datetimepicker.trigger('close.xdsoft');
                            return true;
                        }
                    });
        };
        destroyDateTimePicker = function (input) {
            var datetimepicker = input.data('xdsoft_datetimepicker');
            if (datetimepicker) {
                datetimepicker.data('xdsoft_datetime', null);
                datetimepicker.remove();
                input
                        .data('xdsoft_datetimepicker', null)
                        .off('.xdsoft');
                $(window).off('resize.xdsoft');
                $([window, document.body]).off('mousedown.xdsoft');
                if (input.unmousewheel) {
                    input.unmousewheel();
                }
            }
        };
        $(document)
                .off('keydown.xdsoftctrl keyup.xdsoftctrl')
                .on('keydown.xdsoftctrl', function (e) {
                    if (e.keyCode === CTRLKEY) {
                        ctrlDown = true;
                    }
                })
                .on('keyup.xdsoftctrl', function (e) {
                    if (e.keyCode === CTRLKEY) {
                        ctrlDown = false;
                    }
                });
        return this.each(function () {
            var datetimepicker = $(this).data('xdsoft_datetimepicker');
            if (datetimepicker) {
                if ($.type(opt) === 'string') {
                    switch (opt) {
                        case 'show':
                            $(this).select().focus();
                            datetimepicker.trigger('open.xdsoft');
                            break;
                        case 'hide':
                            datetimepicker.trigger('close.xdsoft');
                            break;
                        case 'toggle':
                            datetimepicker.trigger('toggle.xdsoft');
                            break;
                        case 'destroy':
                            destroyDateTimePicker($(this));
                            break;
                        case 'reset':
                            this.value = this.defaultValue;
                            if (!this.value || !datetimepicker.data('xdsoft_datetime').isValidDate(Date.parseDate(this.value, options.format))) {
                                datetimepicker.data('changed', false);
                            }
                            datetimepicker.data('xdsoft_datetime').setCurrentTime(this.value);
                            break;
                        case 'validate':
                            var $input = datetimepicker.data('input');
                            $input.trigger('blur.xdsoft');
                            break;
                    }
                } else {
                    datetimepicker
                            .setOptions(opt);
                }
                return 0;
            }
            if ($.type(opt) !== 'string') {
                if (!options.lazyInit || options.open || options.inline) {
                    createDateTimePicker($(this));
                } else {
                    lazyInit($(this));
                }
            }
        });
    };
    $.fn.datetimepicker.defaults = default_options;
}(jQuery));
(function () {

    /*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
     * Licensed under the MIT License (LICENSE.txt).
     *
     * Version: 3.1.12
     *
     * Requires: jQuery 1.2.2+
     */
    !function (a) {
        "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? module.exports = a : a(jQuery)
    }(function (a) {
        function b(b) {
            var g = b || window.event, h = i.call(arguments, 1), j = 0, l = 0, m = 0, n = 0, o = 0, p = 0;
            if (b = a.event.fix(g), b.type = "mousewheel", "detail"in g && (m = -1 * g.detail), "wheelDelta"in g && (m = g.wheelDelta), "wheelDeltaY"in g && (m = g.wheelDeltaY), "wheelDeltaX"in g && (l = -1 * g.wheelDeltaX), "axis"in g && g.axis === g.HORIZONTAL_AXIS && (l = -1 * m, m = 0), j = 0 === m ? l : m, "deltaY"in g && (m = -1 * g.deltaY, j = m), "deltaX"in g && (l = g.deltaX, 0 === m && (j = -1 * l)), 0 !== m || 0 !== l) {
                if (1 === g.deltaMode) {
                    var q = a.data(this, "mousewheel-line-height");
                    j *= q, m *= q, l *= q
                } else if (2 === g.deltaMode) {
                    var r = a.data(this, "mousewheel-page-height");
                    j *= r, m *= r, l *= r
                }
                if (n = Math.max(Math.abs(m), Math.abs(l)), (!f || f > n) && (f = n, d(g, n) && (f /= 40)), d(g, n) && (j /= 40, l /= 40, m /= 40), j = Math[j >= 1 ? "floor" : "ceil"](j / f), l = Math[l >= 1 ? "floor" : "ceil"](l / f), m = Math[m >= 1 ? "floor" : "ceil"](m / f), k.settings.normalizeOffset && this.getBoundingClientRect) {
                    var s = this.getBoundingClientRect();
                    o = b.clientX - s.left, p = b.clientY - s.top
                }
                return b.deltaX = l, b.deltaY = m, b.deltaFactor = f, b.offsetX = o, b.offsetY = p, b.deltaMode = 0, h.unshift(b, j, l, m), e && clearTimeout(e), e = setTimeout(c, 200), (a.event.dispatch || a.event.handle).apply(this, h)
            }
        }
        function c() {
            f = null
        }
        function d(a, b) {
            return k.settings.adjustOldDeltas && "mousewheel" === a.type && b % 120 === 0
        }
        var e, f, g = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"], h = "onwheel"in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"], i = Array.prototype.slice;
        if (a.event.fixHooks)
            for (var j = g.length; j; )
                a.event.fixHooks[g[--j]] = a.event.mouseHooks;
        var k = a.event.special.mousewheel = {version: "3.1.12", setup: function () {
                if (this.addEventListener)
                    for (var c = h.length; c; )
                        this.addEventListener(h[--c], b, !1);
                else
                    this.onmousewheel = b;
                a.data(this, "mousewheel-line-height", k.getLineHeight(this)), a.data(this, "mousewheel-page-height", k.getPageHeight(this))
            }, teardown: function () {
                if (this.removeEventListener)
                    for (var c = h.length; c; )
                        this.removeEventListener(h[--c], b, !1);
                else
                    this.onmousewheel = null;
                a.removeData(this, "mousewheel-line-height"), a.removeData(this, "mousewheel-page-height")
            }, getLineHeight: function (b) {
                var c = a(b), d = c["offsetParent"in a.fn ? "offsetParent" : "parent"]();
                return d.length || (d = a("body")), parseInt(d.css("fontSize"), 10) || parseInt(c.css("fontSize"), 10) || 16
            }, getPageHeight: function (b) {
                return a(b).height()
            }, settings: {adjustOldDeltas: !0, normalizeOffset: !0}};
        a.fn.extend({mousewheel: function (a) {
                return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
            }, unmousewheel: function (a) {
                return this.unbind("mousewheel", a)
            }})
    });

// Parse and Format Library
//http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/
    /*
     * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
     *
     * This program is free software; you can redistribute it and/or modify it
     * under the terms of the GNU Lesser General Public License as published by the
     * Free Software Foundation, version 2.1.
     */
    Date.parseFunctions = {count: 0};
    Date.parseRegexes = [];
    Date.formatFunctions = {count: 0};
    Date.prototype.dateFormat = function (b) {
        if (b == "unixtime") {
            return parseInt(this.getTime() / 1000);
        }
        if (Date.formatFunctions[b] == null) {
            Date.createNewFormat(b);
        }
        var a = Date.formatFunctions[b];
        return this[a]();
    };
    Date.createNewFormat = function (format) {
        var funcName = "format" + Date.formatFunctions.count++;
        Date.formatFunctions[format] = funcName;
        var codePrefix = "Date.prototype." + funcName + " = function() {return ";
        var code = "";
        var special = false;
        var ch = "";
        for (var i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else {
                if (special) {
                    special = false;
                    code += "'" + String.escape(ch) + "' + ";
                } else {
                    code += Date.getFormatCode(ch);
                }
            }
        }
        if (code.length == 0) {
            code = "\"\"";
        } else {
            code = code.substring(0, code.length - 3);
        }
        eval(codePrefix + code + ";}");
    };
    Date.getFormatCode = function (a) {
        switch (a) {
            case"d":
                return"String.leftPad(this.getDate(), 2, '0') + ";
            case"D":
                return"Date.dayNames[this.getDay()].substring(0, 3) + ";
            case"j":
                return"this.getDate() + ";
            case"l":
                return"Date.dayNames[this.getDay()] + ";
            case"S":
                return"this.getSuffix() + ";
            case"w":
                return"this.getDay() + ";
            case"z":
                return"this.getDayOfYear() + ";
            case"W":
                return"this.getWeekOfYear() + ";
            case"F":
                return"Date.monthNames[this.getMonth()] + ";
            case"m":
                return"String.leftPad(this.getMonth() + 1, 2, '0') + ";
            case"M":
                return"Date.monthNames[this.getMonth()].substring(0, 3) + ";
            case"n":
                return"(this.getMonth() + 1) + ";
            case"t":
                return"this.getDaysInMonth() + ";
            case"L":
                return"(this.isLeapYear() ? 1 : 0) + ";
            case"Y":
                return"this.getFullYear() + ";
            case"y":
                return"('' + this.getFullYear()).substring(2, 4) + ";
            case"a":
                return"(this.getHours() < 12 ? 'am' : 'pm') + ";
            case"A":
                return"(this.getHours() < 12 ? 'AM' : 'PM') + ";
            case"g":
                return"((this.getHours() %12) ? this.getHours() % 12 : 12) + ";
            case"G":
                return"this.getHours() + ";
            case"h":
                return"String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";
            case"H":
                return"String.leftPad(this.getHours(), 2, '0') + ";
            case"i":
                return"String.leftPad(this.getMinutes(), 2, '0') + ";
            case"s":
                return"String.leftPad(this.getSeconds(), 2, '0') + ";
            case"O":
                return"this.getGMTOffset() + ";
            case"T":
                return"this.getTimezone() + ";
            case"Z":
                return"(this.getTimezoneOffset() * -60) + ";
            default:
                return"'" + String.escape(a) + "' + ";
            }
    };
    Date.parseDate = function (a, c) {
        if (c == "unixtime") {
            return new Date(!isNaN(parseInt(a)) ? parseInt(a) * 1000 : 0);
        }
        if (Date.parseFunctions[c] == null) {
            Date.createParser(c);
        }
        var b = Date.parseFunctions[c];
        return Date[b](a);
    };
    Date.createParser = function (format) {
        var funcName = "parse" + Date.parseFunctions.count++;
        var regexNum = Date.parseRegexes.length;
        var currentGroup = 1;
        Date.parseFunctions[format] = funcName;
        var code = "Date." + funcName + " = function(input) {\nvar y = -1, m = -1, d = -1, h = -1, i = -1, s = -1, z = -1;\nvar d = new Date();\ny = d.getFullYear();\nm = d.getMonth();\nd = d.getDate();\nvar results = input.match(Date.parseRegexes[" + regexNum + "]);\nif (results && results.length > 0) {";
        var regex = "";
        var special = false;
        var ch = "";
        for (var i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else {
                if (special) {
                    special = false;
                    regex += String.escape(ch);
                } else {
                    obj = Date.formatCodeToRegex(ch, currentGroup);
                    currentGroup += obj.g;
                    regex += obj.s;
                    if (obj.g && obj.c) {
                        code += obj.c;
                    }
                }
            }
        }
        code += "if (y > 0 && z > 0){\nvar doyDate = new Date(y,0);\ndoyDate.setDate(z);\nm = doyDate.getMonth();\nd = doyDate.getDate();\n}";
        code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n{return new Date(y, m, d, h, i, s);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n{return new Date(y, m, d, h, i);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0)\n{return new Date(y, m, d, h);}\nelse if (y > 0 && m >= 0 && d > 0)\n{return new Date(y, m, d);}\nelse if (y > 0 && m >= 0)\n{return new Date(y, m);}\nelse if (y > 0)\n{return new Date(y);}\n}return null;}";
        Date.parseRegexes[regexNum] = new RegExp("^" + regex + "$", 'i');
        eval(code);
    };
    Date.formatCodeToRegex = function (b, a) {
        switch (b) {
            case"D":
                return{g: 0, c: null, s: "(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"};
            case"j":
            case"d":
                return{g: 1, c: "d = parseInt(results[" + a + "], 10);\n", s: "(\\d{1,2})"};
            case"l":
                return{g: 0, c: null, s: "(?:" + Date.dayNames.join("|") + ")"};
            case"S":
                return{g: 0, c: null, s: "(?:st|nd|rd|th)"};
            case"w":
                return{g: 0, c: null, s: "\\d"};
            case"z":
                return{g: 1, c: "z = parseInt(results[" + a + "], 10);\n", s: "(\\d{1,3})"};
            case"W":
                return{g: 0, c: null, s: "(?:\\d{2})"};
            case"F":
                return{g: 1, c: "m = parseInt(Date.monthNumbers[results[" + a + "].substring(0, 3)], 10);\n", s: "(" + Date.monthNames.join("|") + ")"};
            case"M":
                return{g: 1, c: "m = parseInt(Date.monthNumbers[results[" + a + "]], 10);\n", s: "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"};
            case"n":
            case"m":
                return{g: 1, c: "m = parseInt(results[" + a + "], 10) - 1;\n", s: "(\\d{1,2})"};
            case"t":
                return{g: 0, c: null, s: "\\d{1,2}"};
            case"L":
                return{g: 0, c: null, s: "(?:1|0)"};
            case"Y":
                return{g: 1, c: "y = parseInt(results[" + a + "], 10);\n", s: "(\\d{4})"};
            case"y":
                return{g: 1, c: "var ty = parseInt(results[" + a + "], 10);\ny = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n", s: "(\\d{1,2})"};
            case"a":
                return{g: 1, c: "if (results[" + a + "] == 'am') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}", s: "(am|pm)"};
            case"A":
                return{g: 1, c: "if (results[" + a + "] == 'AM') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}", s: "(AM|PM)"};
            case"g":
            case"G":
            case"h":
            case"H":
                return{g: 1, c: "h = parseInt(results[" + a + "], 10);\n", s: "(\\d{1,2})"};
            case"i":
                return{g: 1, c: "i = parseInt(results[" + a + "], 10);\n", s: "(\\d{2})"};
            case"s":
                return{g: 1, c: "s = parseInt(results[" + a + "], 10);\n", s: "(\\d{2})"};
            case"O":
                return{g: 0, c: null, s: "[+-]\\d{4}"};
            case"T":
                return{g: 0, c: null, s: "[A-Z]{3}"};
            case"Z":
                return{g: 0, c: null, s: "[+-]\\d{1,5}"};
            default:
                return{g: 0, c: null, s: String.escape(b)};
            }
    };
    Date.prototype.getTimezone = function () {
        return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3");
    };
    Date.prototype.getGMTOffset = function () {
        return(this.getTimezoneOffset() > 0 ? "-" : "+") + String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset()) / 60), 2, "0") + String.leftPad(Math.abs(this.getTimezoneOffset()) % 60, 2, "0");
    };
    Date.prototype.getDayOfYear = function () {
        var a = 0;
        Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
        for (var b = 0; b < this.getMonth(); ++b) {
            a += Date.daysInMonth[b];
        }
        return a + this.getDate();
    };
    Date.prototype.getWeekOfYear = function () {
        var b = this.getDayOfYear() + (4 - this.getDay());
        var a = new Date(this.getFullYear(), 0, 1);
        var c = (7 - a.getDay() + 4);
        return String.leftPad(Math.ceil((b - c) / 7) + 1, 2, "0");
    };
    Date.prototype.isLeapYear = function () {
        var a = this.getFullYear();
        return((a & 3) == 0 && (a % 100 || (a % 400 == 0 && a)));
    };
    Date.prototype.getFirstDayOfMonth = function () {
        var a = (this.getDay() - (this.getDate() - 1)) % 7;
        return(a < 0) ? (a + 7) : a;
    };
    Date.prototype.getLastDayOfMonth = function () {
        var a = (this.getDay() + (Date.daysInMonth[this.getMonth()] - this.getDate())) % 7;
        return(a < 0) ? (a + 7) : a;
    };
    Date.prototype.getDaysInMonth = function () {
        Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
        return Date.daysInMonth[this.getMonth()];
    };
    Date.prototype.getSuffix = function () {
        switch (this.getDate()) {
            case 1:
            case 21:
            case 31:
                return"st";
            case 2:
            case 22:
                return"nd";
            case 3:
            case 23:
                return"rd";
            default:
                return"th";
            }
    };
    String.escape = function (a) {
        return a.replace(/('|\\)/g, "\\$1");
    };
    String.leftPad = function (d, b, c) {
        var a = new String(d);
        if (c == null) {
            c = " ";
        }
        while (a.length < b) {
            a = c + a;
        }
        return a;
    };
    Date.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    Date.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    Date.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    Date.y2kYear = 50;
    Date.monthNumbers = {Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11};
    Date.patterns = {ISO8601LongPattern: "Y-m-d H:i:s", ISO8601ShortPattern: "Y-m-d", ShortDatePattern: "n/j/Y", LongDatePattern: "l, F d, Y", FullDateTimePattern: "l, F d, Y g:i:s A", MonthDayPattern: "F d", ShortTimePattern: "g:i A", LongTimePattern: "g:i:s A", SortableDateTimePattern: "Y-m-d\\TH:i:s", UniversalSortableDateTimePattern: "Y-m-d H:i:sO", YearMonthPattern: "F, Y"};
}());


jQuery('.datetimepicker').datetimepicker({
    timepicker: false,
    format: 'm/d/Y',
    autoclose: true
}).on('change', function () {
    $('.xdsoft_datetimepicker').hide();
});