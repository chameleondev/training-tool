/* GSK Master Template - Custom Functionality - Core */
/*  Core functionality                  */
/*  File version            1.x         */
/*  Last modified           17/07/13    */
/*  Last modified by        Andy Twine  */
/*                          Big Pink    */

var interactionEvent = (navigator.userAgent.match(/iPad/i)) ? "touchend" : "click";
var leaveEvent = (navigator.userAgent.match(/iPad/i)) ? "touchend" : "click";
var startEvent = (navigator.userAgent.match(/iPad/i)) ? "touchstart" : "mousedown";
var changeEvent = 'change focusout';
var dragging = false;
var shortcall = false;
var assetRoot = '';
var currentSceneAsset = '';
var currentSceneTrackingPath = '';
var vocPath = '';
var homePath = '';
var timers = [];
var presentationHasSitemap = false;
var shortCallTrackingPath = '';
var slidesIndex = 0;

function toggleActiveClass(element) {
    $(element).hasClass('touch_active') ? $(element).removeClass('touch_active') : $(element).addClass('touch_active')
}

/* Menu functionality */
function attachMenuFunctionality(shortcalltoggle, isFirstRun) {
    /* Populate the menu content from the manifest */
    var assetPathPrefix = '';
    var thumbnailPath = '';
    var iSlideCount = 0;
    currentScene = window.location.href;
    $.getJSON('assets/library/_manifest.html', function (data) {
        manifest = data;
        $('.body').data('presentation', data.presentation);
        $(data.presentation).each(function () {
            assetPathPrefix = this.assetPathPrefix;
            assetRoot = this.assetRoot;
            currentScene = assetRoot + currentScene.split(assetRoot).pop();
            thumbnailPath = this.thumbnailPath;
            vocPath = this.vocPath;
            shortCallName = this.shortCallName;
            presentationHasSitemap = this.showSiteMapButton;
            shortCallTrackingPath = this.shortCallTrackingPath;
            if (presentationHasSitemap == "false") presentationHasSitemap = false;

            $('#menu-items li').remove();
            slides = [];
            $(this.sections).each(function () {
                var sectionHTML = '<li class="nav_sectionHeading"><span>' + this.title + '</span>';
                var scenesHTML = '';
                var sectionHasCurrentScene = false;
                var addedToMenu = 0;
                $(this.scenes).each(function () {
                    if (shortcalltoggle) {
                        if (this.showInShortCall == "true") {
                            addedToMenu++;
                        } else {
                            return true;
                        }
                    }
                    if (this.name == 'voc') {
                        vocPath = this.assetPath;
                    }
                    if (this.isHome == 'true') {
                        homePath = this.assetPath;
                    }
                    slides[iSlideCount] = this;
                    var current = '';
                    if (iSlideCount == 0)
                        current = 'nav_currentSlide';
                    iSlideCount++;
                    scenesHTML += '<li class="nav_normalSlide hidden navigate ' + current + '" data-navtarget="' + this.name + '" ><img src="' + thumbnailPath + this.thumbnail + '" class="nav_thumbnailImage"/><span>' + this.title + '</span>'
                    $().appendTo('#menu-items');
                    var secondaryScenesHTML = '';
                    $(this.secondaryScenes).each(function () {
                        var currentSecondaryScene = '';
                        if (currentScene == this.assetPath) {
                            currentSecondaryScene = 'nav_currentSlide';
                            currentSceneTrackingPath = this.trackingPath;
                            sectionHasCurrentScene = true;
                        }
                        if (sectionHasCurrentScene) {
                            hidden = false;
                        }
                        secondaryScenesHTML += '<li class="nav_subNavigationSlide hidden navigate ' + currentSecondaryScene + '" data-navtarget="' + this.name + '"><span><img src="' + thumbnailPath + this.thumbnail + '" class="nav_thumbnailImage"/>' + this.title + '</span>';
                    })
                    scenesHTML += secondaryScenesHTML;
                })
                sectionHTML += scenesHTML;
                if (sectionHasCurrentScene) {
                    sectionHTML = sectionHTML.replace('nav_sectionHeading', 'nav_sectionHeading active');
                    sectionHTML = sectionHTML.replace(/nav_subNavigationSlide hidden/g, 'nav_subNavigationSlide');
                    sectionHTML = sectionHTML.replace(/nav_normalSlide hidden/g, 'nav_normalSlide');
                }
                if (!shortcalltoggle || addedToMenu > 0) {
                    $(sectionHTML).appendTo('#menu-items');
                }
            }
            )
            currentLiveScene = slides[0];
            slidesIndex = 0;
            if (isFirstRun)
                loadInitialSlides();
            if (!isFirstRun || shortcalltoggle)
                navigateToSlide(assetPathPrefix + slides[0].assetPath);
        })
    });
    showHideNavThumbs(false);

    if (isFirstRun) {
        $(document).on(startEvent, '.mood-indicator-positive, .mood-indicator-negative, .showMenu, .hideMenu, li#PI, li#home, li#sitemap, li#savecall, li#startcall', function (e) {
            e.preventDefault();
            toggleActiveClass(this);
        });

        $(document).on(interactionEvent, '.navigate', function () {
            if (!dragging && !$(this).data('dragged')) {
                $('.navigate').removeClass('nav_currentSlide touch_active');
                $(this).addClass('nav_currentSlide');
            }
        });

        $(document).on('touchmove', '.navigate', function () {
            $(this).data('dragged', true);
        });

        /* Menu touch events */
        $(document).on(interactionEvent, '.nav_thumbnailSwitch', function (e) {
            showHideNavThumbs(true);
        });

        function showHideNavThumbs(blnToggle) {
            var nav_thumbnailsOn = (localStorage.getItem('nav_thumbnailsOn') || false);
            if (nav_thumbnailsOn == 'true') {
                if (blnToggle) {
                    blnShow = false;
                } else {
                    blnShow = true;
                }
            } else {
                if (blnToggle) {
                    blnShow = true;
                } else {
                    blnShow = false;
                }
            }
            if (blnShow) {
                $('.nav_normalSlide, .nav_subNavigationSlide').addClass('nav_thumbnail');
                $('.nav_thumbnailSwitch_off').addClass('nav_thumbnailSwitch_on');
            } else {
                $('.nav_normalSlide, .nav_subNavigationSlide').removeClass('nav_thumbnail');
                $('.nav_thumbnailSwitch_off').removeClass('nav_thumbnailSwitch_on');
            }
            localStorage.setItem('nav_thumbnailsOn', '' + blnShow);
        }
        $(document).on(interactionEvent, '.showMenu, .hideMenu', function (e) {
            e.preventDefault();
            var $body = $('.body');
            var opened = !!$body.data('opened');
            if (!opened) {
                showHideMenu(true, 2)
            } else {
                showHideMenu(false, 2)
            }
            $body.data('opened', !opened);
            $(this).removeClass('touch_active');
        });
        $(document.body).on(leaveEvent, '.nav_sectionHeading', function (e) {
            if (!dragging) {
                showHideSection($(this).next());
                $(this).toggleClass("active");
            } else {
                dragging = false;
            }
        });
        $(document).on(interactionEvent, '.exit-presentation', function () {
            $('.nav_escape_off').addClass('nav_escape_on');
            try {
                Framework_exitPresentation();
            } catch (e) {
                alert(e);
            }

        });
        $(document).on(interactionEvent, '.open-presentationLibrary', function () {
            $('.nav_presLibrary_off').addClass('nav_presLibrary_on');
            try {
                Framework_track('PresentationLibrary');
                Framework_exitPresentation();
            } catch (e) {
                alert(e);
            }
        });

        $(document).on(interactionEvent, '.change-presentation', function () {
            $(this).hasClass('nav_shortCall_on') ? $(this).removeClass('nav_shortCall_on') : $(this).addClass('nav_shortCall_on')
            $(this).hasClass('nav_shortCall_off') ? $(this).removeClass('nav_shortCall_off') : $(this).addClass('nav_shortCall_off')
            if ($(this).hasClass('nav_shortCall_on')) {
                shortcall = true;
                Framework_track('ShortCallOn');
            } else {
                shortcall = false;
                Framework_track('ShortCallOff');
            }
            attachMenuFunctionality(shortcall);
        });

        $(document).on(interactionEvent, '.open-voc', function () {
            $('.nav_VOC_off').addClass('nav_VOC_on');
            setTimeout(function () {
                $('.nav_VOC_off').removeClass('nav_VOC_on');
                navigateToSlide(assetPathPrefix + vocPath);
                setTimeout(function () {
                    showHideMenu(false, 4)
                }, 500);
            }, 150);
        });
        $(document).on(interactionEvent, '.open-associatedPDFs', function (e) {
            e.preventDefault();
            if (!$('.nav_associatedPDFs_off').hasClass('nav_associatedPDFs_on')) {
                Framework_track("Documents");
                $('.nav_bibliography_off').removeClass('nav_bibliography_on');
                $('.supportingPDFs').show();
                $('.body-parent,.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transition-duration', '0.2s');
                $('.body-parent,.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transform', 'translate3d(1026px,0px,0px)');
                $('.nav_associatedPDFs_off').addClass('nav_associatedPDFs_on');
            } else {
                $('.body-parent,.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transition-duration', '0.2s');
                $('.body-parent,.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transform', 'translate3d(340px,0px,0px)');
                $('.nav_associatedPDFs_off').removeClass('nav_associatedPDFs_on');
                $('.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transition-duration', '0s');
                setTimeout(function () { $('.supportingPDFs').hide(); }, 200);
            }
        });
    }
}

function showHideSection(element) {
    if (element.hasClass('navigate') || element.hasClass('nav_subNavigationSlide') || element.hasClass('nav_currentSlide')) {
        if (element.hasClass('hidden')) {
            element.slideDown('fast');
            element.removeClass('hidden');
        } else {
            element.slideUp('fast');
            element.addClass('hidden');
        }
        showHideSection(element.next());
        toggleActiveClass(this);
    }
}

function updateActiveMenuItem() {
    if (currentLiveSecondaryScene)
        var activeItem = $('#menu-items').find('li[data-navtarget=' + currentLiveSecondaryScene.name + ']');
    else
        var activeItem = $('#menu-items').find('li[data-navtarget=' + currentLiveScene.name + ']');
    var activeItemSectionHeader = $(activeItem.prevAll('.nav_sectionHeading')[0]);
    $('#menu-items').find('li.nav_sectionHeading').each(function (index, element) {
        $(this).removeClass('active');
    });
    $('#menu-items').find('li.navigate').each(function (index, element) {
        var menuItem = $(this);
        menuItem.addClass('hidden');
        menuItem.removeClass('nav_currentSlide');
        menuItem.attr('style', '');
    });
    $('#menu-items').find('li.nav_subNavigationSlide').each(function (index, element) {
        $(this).addClass('hidden');
        $(this).attr('style', '');
    });
    activeItemSectionHeader.addClass('active');
    var finished = false;
    var item = activeItemSectionHeader.next();
    var counter = 0;
    do {
        item.removeClass('hidden');
        item = item.next();
        if (item.hasClass('nav_sectionHeading'))
            finished = true;
        if (counter > 30)
            finished = true;
        counter++;
    } while (!finished)
    activeItem.addClass('nav_currentSlide');

}

/* Mood indicators */
function attachMoodIndicatorsShowFunctionality() {
    /* Populate the mood indicators if values exist */
    /* NOTE : Using expiry of 30 minutes, in case the mood indicators
	aren't cleared for any reason on the VOC slide, start or save call. */
    var sceneName = '';
    if (currentLiveSecondaryScene) { sceneName = currentLiveSecondaryScene.name; } else { sceneName = currentLiveScene.name; }
    var moodIndicatorExpiry = localStorage.getItem('mood-expiry-' + sceneName) || '';
    if (moodIndicatorExpiry != '') {
        if (new Date().getTime() > new Date(moodIndicatorExpiry)) {
            localStorage.clear();
        } else {
            var currentMoodIndicatorState = localStorage.getItem('mood-' + sceneName) || '';
            if (currentMoodIndicatorState != '') {
                $('.mood-indicator-positive').removeClass('mood-positive-selected');
                $('.mood-indicator-negative').removeClass('mood-indicator-negative');
                $('.mood-indicator-positive').removeClass('mood-indicator-positive');
                $('.mood-indicator-negative').removeClass('mood-negative-selected');
                if (currentMoodIndicatorState == 'negative') {
                    $('.mood-indicator-negative-blocked').addClass('mood-negative-selected');
                    $('.mood-indicator-positive-blocked').removeClass('mood-positive-selected');

                } else if (currentMoodIndicatorState == 'positive') {
                    $('.mood-indicator-positive-blocked').addClass('mood-positive-selected');
                    $('.mood-indicator-negative-blocked').removeClass('mood-negative-selected');
                }
            }
        }
    } else {
        $('.mood-indicator-negative-blocked').removeClass('mood-negative-selected');
        $('.mood-indicator-negative-blocked').addClass('mood-indicator-negative');
        $('.mood-indicator-positive-blocked').removeClass('mood-positive-selected');
        $('.mood-indicator-positive-blocked').addClass('mood-indicator-positive');
    }

}

function attachMoodIndicatorsClickFunctionality() {
    var trackingPath = '';
    var sceneName = '';
    if (currentLiveSecondaryScene) {
        trackingPath = currentLiveSecondaryScene.trackingPath;
        sceneName = currentLiveSecondaryScene.name;
    } else {
        trackingPath = currentLiveScene.trackingPath;
        sceneName = currentLiveScene.name;
    }
    if (currentLiveScene.name != 'voc' && slidesIndex > 0) {
        $('#top_nav').css('display', 'block');
        $(document).off(interactionEvent, '.mood-indicator-negative').on(interactionEvent, '.mood-indicator-negative', function () {
            $(this).addClass('mood-negative-selected');
            $('.mood-indicator-negative').removeClass('mood-indicator-negative');
            $('.mood-indicator-positive').removeClass('mood-indicator-positive');
            localStorage.setItem('mood-' + sceneName, 'negative');
            localStorage.setItem('mood-expiry-' + sceneName, new Date().getTime() + 30 * 60000);
            Framework_track(trackingPath + '/empty_circle_negative');
            toggleActiveClass(this);
        });
        $(document).off(interactionEvent, '.mood-indicator-positive').on(interactionEvent, '.mood-indicator-positive', function () {
            $(this).addClass('mood-positive-selected');
            $('.mood-indicator-negative').removeClass('mood-indicator-negative');
            $('.mood-indicator-positive').removeClass('mood-indicator-positive');
            localStorage.setItem('mood-' + sceneName, 'positive');
            localStorage.setItem('mood-expiry-' + sceneName, new Date().getTime() + 30 * 60000);
            Framework_track(trackingPath + '/full_circle_positive');
            toggleActiveClass(this);
        });
    } else {
        $('#top_nav').css('display', 'none');
    }
}

/* Swipe functionality */
function attachSwipeFunctionality(selector) {
    $(selector + ' .swipe').each(function () {
        window.mySwipe = new Swipe(document.getElementById($(this).attr('id')), {
            speed: 800,
            continuous: false
        });
    });
}

function attachSwipeNextPrevFunctionality() {
    $(document).on(interactionEvent, '.swipe-next', function () {
        mySwipe.next();
    });
    $(document).on(interactionEvent, '.swipe-prev', function () {
        mySwipe.prev();
    });
}

/* Navigation functionality */
function attachNavigationFunctionality(selector) {
    $(document).on(leaveEvent, '.navigate', function () {
        if (!dragging) {
            var navtarget = $(this).data('navtarget');
            if (currentLiveSecondaryScene)
                var current = currentLiveSecondaryScene.name;
            else
                var current = currentLiveScene.name;
            if (navtarget != current) {
                $($('.body').data('presentation')).each(function () {
                    assetPathPrefix = this.assetPathPrefix;
                    $(this.sections).each(function () {
                        $(this.scenes).each(function () {
                            if (this.name == navtarget) {
                                navigateToSlide(assetPathPrefix + this.assetPath);
                                setTimeout(function () {
                                    showHideMenu(false, 4)
                                }, 500);
                            }
                            $(this.secondaryScenes).each(function () {
                                if (this.name == navtarget) {
                                    navigateToSlide(assetPathPrefix + this.assetPath);
                                    setTimeout(function () {
                                        showHideMenu(false, 4)
                                    }, 500);
                                }
                            });
                        });
                    });
                });
            } else {
                setTimeout(function () {
                    showHideMenu(false, 4)
                }, 50);
            }
        } else {
            dragging = false;
        }
    });
    $(document).on(interactionEvent, '.navigateHref', function () {
        var self = $(this);
        var navigateToPath = self.data('navtarget');
        try { window.location.href = navigateToPath } catch (e) { };
    });
    $(document).on(interactionEvent, '#home', function () {
        $($('.body').data('presentation')).each(function () {
            assetPathPrefix = this.assetPathPrefix;
            $(this.sections).each(function () {
                $(this.scenes).each(function () {
                    if (this.isHome) {
                        navigateToSlide(assetPathPrefix + this.assetPath);
                        setTimeout(function () {
                            showHideMenu(false, 4)
                        }, 500);
                    }
                })
            })
        })
        toggleActiveClass(this);
    });
    $(document).on(interactionEvent, '#startcall', function () {
        Framework_track('StartCall');
        localStorage.clear();
        if (shortcall) {
            Framework_track('ShortCallOn');
        }
        Framework_track(currentLiveScene.trackingPath);
        $(this).removeClass('touch_active');
    });
    $(document).on(interactionEvent, '#savecall', function () {
        Framework_track('SaveCall');
        localStorage.clear();
        $(this).removeClass('touch_active');
    });
    $('#nav').css('visibility', 'visible');
}

function navigateToSlide(path) {
    var viewPorts = $('.body-content');
    var left = $(viewPorts[0]);
    var center = $(viewPorts[1]);
    var right = $(viewPorts[2]);
    var page1;
    var page2;
    var page3;

    if (!animating) {
        currentLiveSecondaryScene = false;
        stopAllAudioAndVideo(center.attr('id'));
        animating = true;
        divIdBeingLoaded = right.attr('id').replace('-', '_').replace('#', '');
        right.load(path);
        $('.body').data('#' + right.attr('id') + 'currentSecondaryscene', 0);
        center.css({ '-webkit-transform': 'translate3d(-2049px,0,0)' });
        right.css({ '-webkit-transform': 'translate3d(-1025px,0,0)' });

        setTimeout(function () {
            var slideIndex = 0;
            $.each(slides, function (index, value) {
                if (path.indexOf(value.assetPath) > -1) {
                    if (path.indexOf('?') > -1) {
                        $('.body').data('secondarySceneOffset', path.split('?')[1]);
                    } else {
                        $('.body').data('secondarySceneOffset', -1);
                    }
                    slideIndex = index;
                    return false;
                }
            });
            intCount = slideIndex;
            if (intCount - 1 >= 0) {
                page1 = slides[intCount - 1].assetPath;
            }
            page2 = slides[intCount].assetPath;
            currentLiveScene = slides[intCount];
            slidesIndex = intCount;
            currentLivePath = path;
            if ((intCount + 1) <= slides.length - 1) {
                page3 = slides[intCount + 1].assetPath;
            }
            var id = left.attr('id');
            var centerid = center.attr('id');
            divIdBeingLoaded = centerid.replace('-', '_').replace('#', '');
            inViewFunctions[divIdBeingLoaded] = function () { };
            if (page1) {
                $.ajax({
                    url: page1,
                    success: function (html) {
                        $('#' + centerid).html(html);
                    },
                    async: false
                });
            }
            left.remove();
            inViewFunctions[id.replace('-', '_').replace('#', '')] = function () { };
            $('<div id="' + id + '" class="body-content" style="display:block; left:1025px; -webkit-transform: translate3d(0,0,0)"></div>').appendTo($('#container'));
            if (page3) {
                divIdBeingLoaded = id.replace('-', '_').replace('#', '');
                $.ajax({
                    url: page3,
                    success: function (html) {
                        $('#' + id).html(html);
                        implementCoreFunctionality(right.attr('id'));

                    },
                    async: false
                });
            } else {
                implementCoreFunctionality(right.attr('id'));
                inViewFunctions[id.replace('-', '_').replace('#', '')] = function () { };
            }
            divIdBeingLoaded = id.replace('-', '_').replace('#', '');

            if (intCount == 0) { $('#top_nav').css('display', 'none'); }
            inViewFunctions[right.attr('id').replace('-', '_').replace('#', '')]();
            animating = false;

            $('#home').removeClass('touch_active');
            updateActiveMenuItem();
        }, 600);
    } else {
        setTimeout(function () { animating = false; }, 550);
    }
}

/* Tracking functionality */

function attachTrackingFunctionality(selector) {
    $(document).off(interactionEvent, selector + ' .track-on-click').on(interactionEvent, selector + ' .track-on-click', function () {
        var fullPath = $(this).data('navtarget');
        if ($(this).data('finalanswer')) {
            if (localStorage.getItem('_finalanswer') != 'disabled') {
                var variableName = $(this).data('variablesource') || '';
                if (variableName != '') {
                    fullPath += localStorage.getItem(variableName);
                }
                Framework_track(fullPath);
                if ($(this).data('finalanswer') == 'finalanswer') {
                    localStorage.clear();
                    localStorage.setItem('_finalanswer', 'disabled');
                }
            }
        } else {
            Framework_track(fullPath);
        }

    });
    $(document).on(leaveEvent, selector + ' .track-on-swipe', function () {
        Framework_track($(this).data('navtarget'));
    });
}

/* Video functionality */
function attachVideoFunctionality(selector) {
    $(selector).on(interactionEvent, '.video-play', function () { //
        var obj = $(this);
        var targetClass = obj.data('target');
        var targetVideo = $(selector + ' .' + targetClass);
        var targetDomElement = targetVideo.get(0);
        targetDomElement.play();
        if (obj.hasClass('video-fullscreen')) {
            targetDomElement.webkitEnterFullscreen();
        }
    });
    $(selector).on(interactionEvent, '.video-pause', function () { //
        var obj = $(this);
        var targetClass = obj.data('target');
        var targetVideo = $(selector + ' .' + targetClass);
        var targetDomElement = targetVideo.get(0);
        // video crashes on next play if tracking is run after pausing
        var navpausetarget = targetVideo.data('navpausetarget');
        if (typeof navpausetarget != "undefined" && navpausetarget != "") {
            Framework_track(navpausetarget);
        }
        targetDomElement.pause();
    });
    $(selector).on(interactionEvent, '.video-fullscreen', function () { //
        $(selector + ' *.' + $(this).data('target')).get(0).webkitEnterFullscreen();
    });
    $('video').unbind('play').bind('play', function () {
        var navplaytarget = $(this).data('navplaytarget');
        if (typeof navplaytarget != "undefined" && navplaytarget != "") {
            Framework_track(navplaytarget);
        }
    });
    $('video').unbind('pause').bind('pause', function (e) {
        // only attach to video with inbuilt controls and not external
        // video crashes on next play if tracking is run after pausing so prevent
        // default and pause after tracking
        e.preventDefault();
        var controls = $(this).attr('controls');
        if (typeof controls != "undefined" && controls != false) {
            var navpausetarget = $(this).data('navpausetarget');
            if (typeof navpausetarget != "undefined" && navpausetarget != "") {
                Framework_track(navpausetarget);
            }
        }
        $(this).get(0).pause();
    });
    $('video').unbind('ended').bind('ended', function () {
        var navfinishtarget = $(this).data('navfinishtarget');
        if (typeof navfinishtarget != "undefined" && navfinishtarget != "") {
            Framework_track(navfinishtarget);
        }
    });

    $(selector + ' .video-autoplay').each(function () {
        var jObj = $(this);
        var obj = this;
        var videoElement = jObj.attr('id');
        var videoDelay = jObj.data('delay') || 500;
        var video_autoplay_timer = setTimeout(function () {
            obj.play();
        }, videoDelay);
        timers.push(video_autoplay_timer);
    });
}

/* Audio functionality */
function attachAudioFunctionality(selector) {
    $(selector).on(interactionEvent, '.audio-play', function () {
        $(selector + ' *.' + $(this).data('target')).get(0).play();
    });
    $(selector).on(interactionEvent, '.audio-stop', function () {

        $(selector + ' *.' + $(this).data('target')).get(0).pause();
    });
    $(selector + ' .audio-autoplay').each(function () {
        this.play();
    });
}

function stopAllAudioAndVideo(selector) {
    if (typeof (selector) == "string") {
        $('#' + selector).find('audio').each(function (index, element) {
            this.pause();
        });
        $('#' + selector).find('video').each(function (index, element) {
            this.pause();
        });
    }
    else {
        selector.find('audio').each(function (index, element) {
            this.pause();
        });
        selector.find('video').each(function (index, element) {
            this.pause();
        });
    }
}

/* Show / hide functionality */
function attachShowHideFunctionality(selector) {
    $(selector).on(interactionEvent, '.slide-open', function () {
        var self = $(this);
        var slideId = self.data('target');
        var slide = $(selector + ' #' + slideId + ', .' + slideId); //
        slide.css('-webkit-transform', 'translate3d(0,0,0)');
    });
    $(selector).on(interactionEvent, '.slide-close', function () {
        var slideContent = $(this).closest('.slide-content');
        slideContent.css('-webkit-transform', '');
    });
}

/* Sub scene / secondary nav functionality */
function attachSecondaryNavFunctionality(selector) {
    $(document).off(interactionEvent, '#secnav_down').on(interactionEvent, '#secnav_down', function () {
        scrollSecondaryScene(selector, true);
    });
    $(document).off(interactionEvent, '#secnav_up').on(interactionEvent, '#secnav_up', function () {
        scrollSecondaryScene(selector, false);
    });
}

function scrollSecondaryScene(selector, blnDown) {
    var intTarget = $('.body').data(selector + 'currentSecondaryscene') * 1;
    if (blnDown) {
        intTarget += 1;
    } else {
        intTarget -= 1;
    }
    scrollSecondaryScenes(selector, intTarget, true);
}

function scrollSecondaryScenes(selector, intTarget, doTracking) {
    var intCurrent = ($('.body').data(selector + 'currentSecondaryscene') * 1) || 0;
    var blnDown = true;
    do {
        if (intCurrent == intTarget) {
            break;
        } else {
            blnHasScrolled = true;
            if (intCurrent < intTarget) {
                blnDown = true;
            } else {
                blnDown = false;
            }
        }
        if (blnDown) {
            intCurrent += 1
            $('#secnav_up').css('display', 'inline-block');
        } else {
            intCurrent -= 1
            $('#secnav_down').show();
        }
        $(selector + ' .secondary-scene').each(function (index) {
            var dest = (-intCurrent * 748);
            var obj = $(this);
            stopAllAudioAndVideo(obj);
            obj.css('-webkit-transform', 'translate(0px,' + dest + 'px)');
        });
        if (intCurrent == 0 && !blnDown) {
            $('#secnav_up').hide();
            break;
        } else if (intCurrent == $(selector + ' .secondary-scene').length - 1 && blnDown) {
            $('#secnav_down').hide();
            break;
        }
    } while (intCurrent != intTarget && intCurrent < 20 && intCurrent > -20);

    $($('.body').data('presentation')).each(function () {
        $(this.sections).each(function () {
            $(this.scenes).each(function () {
                if (this == currentLiveScene) {
                    currentLiveSecondaryScene = this.secondaryScenes[intCurrent - 1];
                }
            });
        });
    });
    $('.body').data(selector + 'currentSecondaryscene', intCurrent * 1);
    attachMoodIndicatorsShowFunctionality();
    attachMoodIndicatorsClickFunctionality();
    updateActiveMenuItem();

    var trackingPath = '';
    if (doTracking) {
        if (currentLiveSecondaryScene) {
            trackingPath = currentLiveSecondaryScene.trackingPath;
        } else {
            trackingPath = currentLiveScene.trackingPath;
        }

        Framework_track(trackingPath);
    }
}

function loadSecondaryScenesForScene(selector) {
    $('#secnav_up').hide();
    if ($(selector + ' .secondary-scene').length > 0) {
        $('#secnav_down').css({ display: 'inline-block' });
        if ($('.body').data('secondarySceneOffset') > 0) {
            targetsecondaryscene = ($('.body').data('secondarySceneOffset') * 1);
            scrollSecondaryScenes(selector, targetsecondaryscene, true);
        } else {
            scrollSecondaryScenes(selector, 0, false);
        }
        attachSecondaryNavFunctionality(selector);
    } else {
        $('#secnav_down').css({ display: 'none' });
        $('#secnav_up').css({ display: 'none' });
    }
}

/* Dynamic content functionality */
/* NOTE: Dynamic content must be loaded before other items are attached to include the 
elements that need attaching from the dynamically included files. */
function attachDynamicContent(selector) {
    var dynamicContent = $(selector + ' .dynamic-content');
    dynamicContent.each(function () {
        var sourcePath = $(this).data('source');
        $(this).load(sourcePath, function () {
            if (sourcePath.indexOf('/_bottom_nav') > -1) {
                attachOverlayShowFunctionality('');
                if (presentationHasSitemap) {
                    $('#home').css('display', 'none');
                } else {
                    $('#sitemap').css('display', 'none');
                }
                $('.nav_bottom').css('display', 'block');
            }
            if (sourcePath.indexOf('/_nav') > -1) {
                attachMenuFunctionality(false, true);
            }
            $('.body-content').css('display', 'block');
        });
    });
    var dynamicContentLazy = $(selector + ' .dynamic-content-lazy');
    dynamicContentLazy.on(interactionEvent, function () {
        var jObj = $(this);
        var target = jObj.data('target');
        var source = jObj.data('source');
        $(selector + ' .' + target).load(source);
    });
}

/* References functionality */
function attachReferencesFunctionality(selector) {
    var refs = $(selector + ' .ref');
    refs.each(function () {
        var obj = $(this);

        if (obj.children('div').length < 1) {
            obj.removeClass('show-overlay');
            obj.append('<div class="hotspot ref-overlay inhibitNavigationSwipe" data-refTarget="' + $(this).data('reftarget') + '" data-refPrefix="' + $(this).data('refprefix') + '" data-dialogclass="dialog-noclose"></div>');
            obj.removeData('refprefix');
            obj.removeData('reftarget');
        }
    });
    $(selector).on(interactionEvent, '.ref-overlay', function (e) {
        var currentWindow = $('.body-content');
        var refsPrefix = '';
        if (currentLiveScene.secondaryScenes) {
            currentWindow = $(e.currentTarget).closest('.secondary-scene');
        } else {
            currentWindow = $(e.currentTarget).closest('.body-content');
        }
        var refadded = new Array;
        var refsHTML = [];
        var footnote = "";
        var linelength = 0;
        currentWindow.find('.ref').each(function () {
            var refOverlay = $(this).find('.ref-overlay');
            var targets = "" + refOverlay.data('reftarget');
            targets = targets.split(',');
            var refNo = "" + $(this).text();
            if (refNo.match("-")) {
                var temp = refNo.split("-");
                var start = temp[0];
                var end = temp[1];
                refNo = new Array;
                for (var i = start; i <= end; i++) {
                    refNo.push(i);
                }
            } else {
                refNo = refNo.split(",");
            }
            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];
                var ref = refOverlay.data('refprefix') + '_' + target;
                if ($.inArray(ref, refadded) == -1) {
                    var refHTML = $('#refs_' + ref).html();
                    if (typeof refHTML != "undefined") {
                        var refDisplayNo = refNo[i] / 1;
                        var content = '<div class="refContent">' + refDisplayNo + '. ' + refHTML + '</div><div class="clr"></div>';
                        if (target == "footnote") {
                            footnote = '<div class="footnoteGroup">' + content + '</div>';
                        }
                        else {
                            refsHTML.push({ 'no': refDisplayNo, 'content': content });
                            linelength = (refHTML.length < linelength ? linelength : refHTML.length);
                        }
                    }
                    refadded.push(ref);
                }
            }
        });
        var contentWidth = 450;

        refsHTML.sort(function (a, b) {
            return a.no - b.no;
        });

        var tempArray = refsHTML;
        refsHTML = "";

        for (var i = 0; i < tempArray.length; i++) {
            refsHTML += tempArray[i].content;
        }
        refsHTML += footnote;

        $('#refsContainer').html(refsHTML);
        linelength *= 6;
        contentWidth = (contentWidth < linelength ? contentWidth : linelength);

        var target = '#refsContainer';
        var height = 'auto';
        var width = contentWidth || 'auto';
        var dialogClass = 'dialog-noclose';
        var showEffect = 'none';
        var showDuration = 0;
        var positionAnchor = 'center';
        openOverlay(target, height, width, dialogClass, showEffect, showDuration, positionAnchor);
    });
}

/* Bibliography functionality */
function attachBiliographyFunctionality() {
    /* Populate the bibliography */
    $(document).on(interactionEvent, '.open-bibliography', function (e) {
        e.preventDefault();
        var bibliographyContent = '<ul>';
        $('.showInBiblio').each(function () {
            bibliographyContent += '<li>' + $(this).html() + '</li>';
        })
        bibliographyContent += '</ul>';
        $('.bibliographyContent').html(bibliographyContent);
        if (!$('.nav_bibliography_off').hasClass('nav_bibliography_on')) {
            Framework_track("Bibliography");
            $('.nav_bibliography_off').addClass('nav_bibliography_on');
            $('.bibliography').show();
            $('.supportingPDFs').hide();
            $('.body-parent,.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transition-duration', '0.2s');
            $('.body-parent,.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transform', 'translate3d(1026px,0px,0px)');
            $('.nav_associatedPDFs_off').removeClass('nav_associatedPDFs_on');
        } else {
            $('.nav_bibliography_off').removeClass('nav_bibliography_on');
            $('.body-parent,.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transform', 'translate3d(340px, 0px, 0px)');
            $('.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transition-duration', '0s');
            setTimeout(function () { $('.bibliography').hide(); }, 200);
        }
    });
}

/* Overlay functionality */
function attachOverlayShowFunctionality(selector) {
    $(document).on('touchstart click', selector + ' .show-overlay', function () {
        animating = true;

    });
    $(selector + ' .show-overlay').each(function (index, element) {
        var obj = $(this);
        if (!obj.hasClass('overlay-bound')) {
            obj.on(interactionEvent, function () {
                if ($(this).attr('id') == 'PI') {
                    Framework_track('PI');
                    toggleActiveClass(this);
                }
                var obj = $(this);
                var target = selector + ' .' + obj.data('target');
                var height = obj.data('height') || 'auto';
                var width = obj.data('width') || 'auto';
                var dialogClass = obj.data('dialogclass') || '';
                var showEffect = obj.data('effect') || 'none';
                var showDuration = obj.data('duration') || 500;
                var positionAnchor = obj.data('anchor') || 'center';

                openOverlay(target, height, width, dialogClass, showEffect, showDuration, positionAnchor);
                if (obj.data('navtarget')) {
                    Framework_track(obj.data('navtarget'));
                }
                return false;
            });
            obj.addClass('overlay-bound');
        }
    });

}

function openOverlay(target, height, width, dialogClass,
    showEffect, showDuration, positionAnchor) {
    animating = true;

    var objTarget = $(target);

    objTarget.dialog({
        modal: true,
        draggable: false,
        resizable: false,
        height: height,
        width: width,
        dialogClass: dialogClass,
        show: { effect: showEffect, duration: showDuration },
        position: { my: positionAnchor, at: positionAnchor, of: window },
        open: function (event, ui) {
            setTimeout(function () {
                objTarget.css('-webkit-overflow-scrolling', 'touch');
            }, 1000
                );
            objTarget.on(interactionEvent, '.ref-overlay', function () {

                var refsText = "" + $(this).data('reftarget');
                var refsPrefix = "" + $(this).data('refprefix') || 'global';
                var refsHTML = '';
                refsList = refsText.split(',');
                var contentWidth = null;
                $.each(refsList, function (refIndex) {
                    var refHTML = $('#refs_' + refsPrefix + '_' + refsList[refIndex]).html();
                    var refWidth = typeof (refHTML) != 'undefined' ? refHTML.length * 6 : 0;
                    contentWidth = contentWidth < refWidth ? refWidth : contentWidth;
                    refsHTML += '<div class="refContent">' + this.toString() + '. ' + refHTML + '</div><div class="clr"></div>';
                });
                $('#refsContainer').html(refsHTML);
                var target = '#refsContainer';
                var height = 'auto';
                var width = contentWidth || 'auto';
                var dialogClass = 'dialog-noclose';
                var showEffect = 'none';
                var showDuration = 0;
                var positionAnchor = 'center';
                objTarget.css('-webkit-overflow-scrolling', '');
                openOverlay(target, height, width, dialogClass, showEffect, showDuration, positionAnchor);
            });
            setTimeout(function () {
                $('.ui-widget-overlay').on(interactionEvent,
                    function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var targetObj = $(this).next('.ui-dialog').attr('aria-describedby');
                        if (targetObj == "PIoverlay") {
                            $('#PI').removeClass("touch_active");
                        }
                        $(this).next('.ui-dialog').find('.ui-dialog-titlebar-close').click();
                    });
            }, showDuration + 100);
        },
        close: function (event, ui) {
            objTarget.css('-webkit-overflow-scrolling', '');
            objTarget.off(interactionEvent, '.ref-overlay')
            objTarget.dialog('destroy');
            animating = false;
            if (objTarget.attr('id') == "PIoverlay") {
                $('#PI').removeClass("touch_active");
            }
        }
    });

    objTarget.on("dialogopen", function (event, ui) {
        animating = true;
    });

}


/* Storage functionality */
function attachStorageFunctionality(selector) {
    var retrieveVars = $('[data-source]:not(.dynamic-content):not(.dynamic-content-lazy)');
    retrieveVars.each(function () {
        var value = localStorage.getItem($(this).data('source'));
        $(this).val(value);
        $(this).html(value);
    });

    $(document).on(changeEvent, '.save-data', function () {
        var tagName = $(this).prop('tagName')
        var value = '';
        if (tagName == 'INPUT') {
            if ($(this).prop('type') == 'radio' && $(this).prop('checked')) {
                value = $(this).val();
            } else if ($(this).prop('type') != 'radio') {
                value = $(this).val();
            }
        } else if (tagName == 'DIV') {
            value = $(this).html();
        }
        if (value != '') {
            localStorage.setItem($(this).data('target'), value);
        }
    });
}

/* Slider functionality */
function attachSliderFunctionality(selector) {
    if (!selector) { selector == ''; }
    $(selector + " .drag-slider").each(function () {   //
        var self = $(this);
        localStorage.setItem(self.data('target'), self.data('value'));
        self.slider({
            orientation: "horizontal",
            range: "min",
            min: self.data('min') || 0,
            max: self.data('max') || 10,
            value: self.data('value') || 0,
            step: self.data('step') || 1,
            change: function (event, ui) {
                localStorage.setItem(self.data('target'), ui.value);

            },
            start: function (event, ui) {
                $(ui.handle).siblings('.ui-slider-range').addClass('depressed');
                $(ui.handle).addClass('depressed');
            },
            stop: function (event, ui) {
                $(ui.handle).siblings('.ui-slider-range').removeClass('depressed');
                $(ui.handle).removeClass('depressed');
            }
        });
    });
}

/*Interactive bars functionality */
function attachInteractiveBarsFunctionality(selector) {
    if (!selector) { selector == ''; }
    $(selector + ' .interactive-bar').each(function () {
        var self = $(this);
        localStorage.setItem(self.data('target'), self.data('value'));

        self.slider({
            orientation: "horizontal",
            range: "min",
            min: self.data('min') || 0,
            max: self.data('max') || 500,
            step: 1,
            value: 250,
            value: self.data('value') || 250,
            change: function (event, ui) {
                localStorage.setItem(self.data('target'), ui.value);

            },
            create: function (event, ui) {
                $(".ui-slider-handle").html("<div class='_handle'></div>");
            }

        });

    });

}

/* Swipe framework */
/* https://github.com/bradbirdsall/Swipe */
function Swipe(container, options) {

    "use strict";

    var noop = function () { };
    var offloadFn = function (fn) { setTimeout(fn || noop, 0) };
    var browser = {
        addEventListener: !!window.addEventListener,
        touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
        transitions: (function (temp) {
            var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
            for (var i in props) if (temp.style[props[i]] !== undefined) return true;
            return false;
        })(document.createElement('swipe'))
    };

    if (!container) return;
    var element = container.children[0];

    if (typeof element == "undefined") return;
    var slides, slidePos, width, length;
    options = options || {};
    var index = parseInt(options.startSlide, 10) || 0;
    var speed = options.speed || 300;
    options.continuous = options.continuous !== undefined ? options.continuous : true;

    function setup() {
        slides = element.children;
        length = slides.length;
        if (slides.length < 2) options.continuous = false;
        if (browser.transitions && options.continuous && slides.length < 3) {
            element.appendChild(slides[0].cloneNode(true));
            element.appendChild(element.children[1].cloneNode(true));
            slides = element.children;
        }
        slidePos = new Array(slides.length);
        width = container.getBoundingClientRect().width || container.offsetWidth;

        element.style.width = (slides.length * width) + 'px';

        var pos = slides.length;
        while (pos--) {

            var slide = slides[pos];

            slide.style.width = width + 'px';
            slide.setAttribute('data-index', pos);

            if (browser.transitions) {
                slide.style.left = (pos * -width) + 'px';
                move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
            }

        }

        if (options.continuous && browser.transitions) {
            move(circle(index - 1), -width, 0);
            move(circle(index + 1), width, 0);
        }

        if (!browser.transitions) element.style.left = (index * -width) + 'px';

        container.style.visibility = 'visible';

    }

    function prev() {

        if (options.continuous) slide(index - 1);
        else if (index) slide(index - 1);

    }

    function next() {

        if (options.continuous) slide(index + 1);
        else if (index < slides.length - 1) slide(index + 1);

    }

    function circle(index) {
        return (slides.length + (index % slides.length)) % slides.length;
    }

    function slide(to, slideSpeed) {
        if (index == to) return;

        if (browser.transitions) {

            var direction = Math.abs(index - to) / (index - to);

            if (options.continuous) {
                var natural_direction = direction;
                direction = -slidePos[circle(to)] / width;
                if (direction !== natural_direction) to = -direction * slides.length + to;

            }

            var diff = Math.abs(index - to) - 1;
            while (diff--) move(circle((to > index ? to : index) - diff - 1), width * direction, 0);

            to = circle(to);

            move(index, width * direction, slideSpeed || speed);
            move(to, 0, slideSpeed || speed);

            if (options.continuous) move(circle(to - direction), -(width * direction), 0); // we need to get the next in place

        } else {

            to = circle(to);
            animate(index * -width, to * -width, slideSpeed || speed);
        }

        index = to;
        offloadFn(options.callback && options.callback(index, slides[index]));


    }

    function move(index, dist, speed) {
        translate(index, dist, speed);
        slidePos[index] = dist;
        return false;
    }

    function translate(index, dist, speed) {

        var slide = slides[index];
        var style = slide && slide.style;

        if (!style) return;

        style.webkitTransitionDuration =
            style.MozTransitionDuration =
            style.msTransitionDuration =
            style.OTransitionDuration =
            style.transitionDuration = speed + 'ms';

        style.webkitTransform = 'translate3d(' + dist + 'px,0,0)';
        style.msTransform =
            style.MozTransform =
            style.OTransform = 'translate3d(' + dist + 'px,0,0)';

    }

    function animate(from, to, speed) {
        if (!speed) {

            element.style.left = to + 'px';
            return;

        }

        var start = +new Date;

        var timer = setInterval(function () {

            var timeElap = +new Date - start;

            if (timeElap > speed) {

                element.style.left = to + 'px';

                if (delay) begin();

                options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

                clearInterval(timer);
                return;

            }

            element.style.left = (((to - from) * (Math.floor((timeElap / speed) * 100) / 100)) + from) + 'px';

        }, 4);

    }

    var delay = options.auto || 0;
    var interval;

    function begin() {

        interval = setTimeout(next, delay);

    }

    function stop() {

        delay = 0;
        clearTimeout(interval);

    }

    var start = {};
    var delta = {};
    var isScrolling;

    var events = {

        handleEvent: function (event) {

            switch (event.type) {
                case 'touchstart': this.start(event); break;
                case 'touchmove': this.move(event); break;
                case 'touchend': offloadFn(this.end(event)); break;
                case 'webkitTransitionEnd':
                case 'msTransitionEnd':
                case 'oTransitionEnd':
                case 'otransitionend':
                case 'transitionend': offloadFn(this.transitionEnd(event)); break;
                case 'resize': offloadFn(setup.call()); break;
            }

            if (options.stopPropagation) event.stopPropagation();

        },
        start: function (event) {

            var touches = event.touches[0];

            start = {

                x: touches.pageX,
                y: touches.pageY,
                time: +new Date

            };
            isScrolling = undefined;
            delta = {};

            element.addEventListener('touchmove', this, false);
            element.addEventListener('touchend', this, false);

        },
        move: function (event) {

            if (event.touches.length > 1 || event.scale && event.scale !== 1) return

            if (options.disableScroll) event.preventDefault();

            var touches = event.touches[0];
            delta = {
                x: touches.pageX - start.x,
                y: touches.pageY - start.y
            }

            if (typeof isScrolling == 'undefined') {
                isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
            }

            if (!isScrolling) {

                event.preventDefault();

                stop();

                if (options.continuous) {
                    translate(circle(index - 1), delta.x + slidePos[circle(index - 1)], 0);
                    translate(index, delta.x + slidePos[index], 0);
                    translate(circle(index + 1), delta.x + slidePos[circle(index + 1)], 0);
                } else {

                    delta.x =
                          delta.x /
                            ((!index && delta.x > 0
                              || index == slides.length - 1
                              && delta.x < 0
                            ) ?
                            (Math.abs(delta.x) / width + 1)
                            : 1);
                    translate(index - 1, delta.x + slidePos[index - 1], 0);
                    translate(index, delta.x + slidePos[index], 0);
                    translate(index + 1, delta.x + slidePos[index + 1], 0);
                }

            }

        },
        end: function (event) {

            var duration = +new Date - start.time;

            var isValidSlide =
                      Number(duration) < 250
                      && Math.abs(delta.x) > 20
                      || Math.abs(delta.x) > width / 2;
            var isPastBounds =
                      !index && delta.x > 0
                      || index == slides.length - 1 && delta.x < 0;

            if (options.continuous) isPastBounds = false;


            var direction = delta.x < 0;

            if (!isScrolling) {

                if (isValidSlide && !isPastBounds) {

                    if (direction) {

                        if (options.continuous) {

                            move(circle(index - 1), -width, 0);
                            move(circle(index + 2), width, 0);

                        } else {
                            move(index - 1, -width, 0);
                        }

                        move(index, slidePos[index] - width, speed);
                        move(circle(index + 1), slidePos[circle(index + 1)] - width, speed);
                        index = circle(index + 1);

                    } else {
                        if (options.continuous) {

                            move(circle(index + 1), width, 0);
                            move(circle(index - 2), -width, 0);

                        } else {
                            move(index + 1, width, 0);
                        }

                        move(index, slidePos[index] + width, speed);
                        move(circle(index - 1), slidePos[circle(index - 1)] + width, speed);
                        index = circle(index - 1);

                    }

                    options.callback && options.callback(index, slides[index]);

                } else {

                    if (options.continuous) {

                        move(circle(index - 1), -width, speed);
                        move(index, 0, speed);
                        move(circle(index + 1), width, speed);

                    } else {

                        move(index - 1, -width, speed);
                        move(index, 0, speed);
                        move(index + 1, width, speed);
                    }

                }

            }

            element.removeEventListener('touchmove', events, false)
            element.removeEventListener('touchend', events, false)

        },
        transitionEnd: function (event) {

            if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

                if (delay) begin();

                options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

            }

        }

    }

    setup();


    if (delay) begin();



    if (browser.addEventListener) {

        if (browser.touch) element.addEventListener('touchstart', events, false);

        if (browser.transitions) {
            element.addEventListener('webkitTransitionEnd', events, false);
            element.addEventListener('msTransitionEnd', events, false);
            element.addEventListener('oTransitionEnd', events, false);
            element.addEventListener('otransitionend', events, false);
            element.addEventListener('transitionend', events, false);
        }

        window.addEventListener('resize', events, false);

    } else {

        window.onresize = function () { setup() };

    }

    return {
        setup: function () {

            setup();

        },
        slide: function (to, speed) {

            stop();

            slide(to, speed);

        },
        prev: function () {
            stop();

            prev();

        },
        next: function () {
            stop();

            next();

        },
        getPos: function () {
            return index;

        },
        getNumSlides: function () {
            return length;
        },
        kill: function () {
            stop();
            element.style.width = 'auto';
            element.style.left = 0;
            var pos = slides.length;
            while (pos--) {

                var slide = slides[pos];
                slide.style.width = '100%';
                slide.style.left = 0;

                if (browser.transitions) translate(pos, 0, 0);

            }
            if (browser.addEventListener) {
                element.removeEventListener('touchstart', events, false);
                element.removeEventListener('webkitTransitionEnd', events, false);
                element.removeEventListener('msTransitionEnd', events, false);
                element.removeEventListener('oTransitionEnd', events, false);
                element.removeEventListener('otransitionend', events, false);
                element.removeEventListener('transitionend', events, false);
                window.removeEventListener('resize', events, false);

            }
            else {

                window.onresize = null;

            }

        }
    }

}

if (window.jQuery || window.Zepto) {
    (function ($) {
        $.fn.Swipe = function (params) {
            return this.each(function () {
                $(this).data('Swipe', new Swipe($(this)[0], params));
            });
        }
    })(window.jQuery || window.Zepto)
}

/* Jquery animate enhanced plugin
NOTE: Used to substitute overlay & dialog effects for web kit transitions wherever possible.*/
/*
jquery.animate-enhanced plugin v0.99
---
http://github.com/benbarnett/jQuery-Animate-Enhanced
http://benbarnett.net
@benpbarnett
---
Copyright (c) 2012 Ben Barnett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
---
Extends jQuery.animate() to automatically use CSS3 transformations where applicable.
Tested with jQuery 1.3.2+

Supports -moz-transition, -webkit-transition, -o-transition, transition

Targetted properties (for now):
- left
- top
- opacity
- width
- height

Usage (exactly the same as it would be normally):

jQuery(element).animate({left: 200},  500, function() {
// callback
});

*/

(function (jQuery, originalAnimateMethod, originalStopMethod) {

    // ----------
    // Plugin variables
    // ----------
    var cssTransitionProperties = ['top', 'right', 'bottom', 'left', 'opacity', 'height', 'width'],
        directions = ['top', 'right', 'bottom', 'left'],
        cssPrefixes = ['-webkit-', '-moz-', '-o-', ''],
        pluginOptions = ['avoidTransforms', 'useTranslate3d', 'leaveTransforms'],
        rfxnum = /^([+-]=)?([\d+-.]+)(.*)$/,
        rupper = /([A-Z])/g,
        defaultEnhanceData = {
            secondary: {},
            meta: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        },
        valUnit = 'px',

        DATA_KEY = 'jQe',
        CUBIC_BEZIER_OPEN = 'cubic-bezier(',
        CUBIC_BEZIER_CLOSE = ')',

        originalAnimatedFilter = null,
        pluginDisabledDefault = false;


    // ----------
    // Check if this browser supports CSS3 transitions
    // ----------
    var thisBody = document.body || document.documentElement,
        thisStyle = thisBody.style,
        transitionEndEvent = 'webkitTransitionEnd oTransitionEnd transitionend',
        cssTransitionsSupported = thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.OTransition !== undefined || thisStyle.transition !== undefined,
        has3D = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
        use3DByDefault = has3D;



    // ----------
    // Extended :animated filter
    // ----------
    if (jQuery.expr && jQuery.expr.filters) {
        originalAnimatedFilter = jQuery.expr.filters.animated;
        jQuery.expr.filters.animated = function (elem) {
            return jQuery(elem).data('events') && jQuery(elem).data('events')[transitionEndEvent] ? true : originalAnimatedFilter.call(this, elem);
        };
    }


    /**
    @private
    @name _getUnit
    @function
    @description Return unit value ("px", "%", "em" for re-use correct one when translating)
    @param {variant} [val] Target value
    */
    function _getUnit(val) {
        return val.match(/\D+$/);
    }


    /**
    @private
    @name _interpretValue
    @function
    @description Interpret value ("px", "+=" and "-=" sanitisation)
    @param {object} [element] The Element for current CSS analysis
    @param {variant} [val] Target value
    @param {string} [prop] The property we're looking at
    @param {boolean} [isTransform] Is this a CSS3 transform?
    */
    function _interpretValue(e, val, prop, isTransform) {
        // this is a nasty fix, but we check for prop == 'd' to see if we're dealing with SVG, and abort
        if (prop == "d") return;
        if (!_isValidElement(e)) return;

        var parts = rfxnum.exec(val),
            start = e.css(prop) === 'auto' ? 0 : e.css(prop),
            cleanCSSStart = typeof start == 'string' ? _cleanValue(start) : start,
            cleanTarget = typeof val == 'string' ? _cleanValue(val) : val,
            cleanStart = isTransform === true ? 0 : cleanCSSStart,
            hidden = e.is(':hidden'),
            translation = e.translation();

        if (prop == 'left') cleanStart = parseInt(cleanCSSStart, 10) + translation.x;
        if (prop == 'right') cleanStart = parseInt(cleanCSSStart, 10) + translation.x;
        if (prop == 'top') cleanStart = parseInt(cleanCSSStart, 10) + translation.y;
        if (prop == 'bottom') cleanStart = parseInt(cleanCSSStart, 10) + translation.y;

        // deal with shortcuts
        if (!parts && val == 'show') {
            cleanStart = 1;
            if (hidden) e.css({ 'display': (e.context.tagName == 'LI') ? 'list-item' : 'block', 'opacity': 0 });
        } else if (!parts && val == "hide") {
            cleanStart = 0;
        }

        if (parts) {
            var end = parseFloat(parts[2]);

            // If a +=/-= token was provided, we're doing a relative animation
            if (parts[1]) end = ((parts[1] === '-=' ? -1 : 1) * end) + parseInt(cleanStart, 10);
            return end;
        } else {
            return cleanStart;
        }
    }

    /**
    @private
    @name _getTranslation
    @function
    @description Make a translate or translate3d string
    @param {integer} [x]
    @param {integer} [y]
    @param {boolean} [use3D] Use translate3d if available?
    */
    function _getTranslation(x, y, use3D) {
        return ((use3D === true || (use3DByDefault === true && use3D !== false)) && has3D) ? 'translate3d(' + x + 'px, ' + y + 'px, 0)' : 'translate(' + x + 'px,' + y + 'px)';
    }


    /**
    @private
    @name _applyCSSTransition
    @function
    @description Build up the CSS object
    @param {object} [e] Element
    @param {string} [property] Property we're dealing with
    @param {integer} [duration] Duration
    @param {string} [easing] Easing function
    @param {variant} [value] String/integer for target value
    @param {boolean} [isTransform] Is this a CSS transformation?
    @param {boolean} [isTranslatable] Is this a CSS translation?
    @param {boolean} [use3D] Use translate3d if available?
    */
    function _applyCSSTransition(e, property, duration, easing, value, isTransform, isTranslatable, use3D) {
        var eCSSData = e.data(DATA_KEY),
            enhanceData = eCSSData && !_isEmptyObject(eCSSData) ? eCSSData : jQuery.extend(true, {}, defaultEnhanceData),
            offsetPosition = value,
            isDirection = jQuery.inArray(property, directions) > -1;

        if (isDirection) {
            var meta = enhanceData.meta,
                cleanPropertyValue = _cleanValue(e.css(property)) || 0,
                stashedProperty = property + '_o';

            offsetPosition = value - cleanPropertyValue;

            meta[property] = offsetPosition;
            meta[stashedProperty] = e.css(property) == 'auto' ? 0 + offsetPosition : cleanPropertyValue + offsetPosition || 0;
            enhanceData.meta = meta;

            // fix 0 issue (transition by 0 = nothing)
            if (isTranslatable && offsetPosition === 0) {
                offsetPosition = 0 - meta[stashedProperty];
                meta[property] = offsetPosition;
                meta[stashedProperty] = 0;
            }
        }

        // reapply data and return
        return e.data(DATA_KEY, _applyCSSWithPrefix(e, enhanceData, property, duration, easing, offsetPosition, isTransform, isTranslatable, use3D));
    }

    /**
    @private
    @name _applyCSSWithPrefix
    @function
    @description Helper function to build up CSS properties using the various prefixes
    @param {object} [cssProperties] Current CSS object to merge with
    @param {string} [property]
    @param {integer} [duration]
    @param {string} [easing]
    @param {variant} [value]
    @param {boolean} [isTransform] Is this a CSS transformation?
    @param {boolean} [isTranslatable] Is this a CSS translation?
    @param {boolean} [use3D] Use translate3d if available?
    */
    function _applyCSSWithPrefix(e, cssProperties, property, duration, easing, value, isTransform, isTranslatable, use3D) {
        var saveOriginal = false,
            transform = isTransform === true && isTranslatable === true;

        cssProperties = cssProperties || {};
        if (!cssProperties.original) {
            cssProperties.original = {};
            saveOriginal = true;
        }
        cssProperties.properties = cssProperties.properties || {};
        cssProperties.secondary = cssProperties.secondary || {};

        var meta = cssProperties.meta,
            original = cssProperties.original,
            properties = cssProperties.properties,
            secondary = cssProperties.secondary;

        for (var i = cssPrefixes.length - 1; i >= 0; i--) {
            var tp = cssPrefixes[i] + 'transition-property',
                td = cssPrefixes[i] + 'transition-duration',
                tf = cssPrefixes[i] + 'transition-timing-function';

            property = (transform ? cssPrefixes[i] + 'transform' : property);

            if (saveOriginal) {
                original[tp] = e.css(tp) || '';
                original[td] = e.css(td) || '';
                original[tf] = e.css(tf) || '';
            }

            secondary[property] = transform ? _getTranslation(meta.left, meta.top, use3D) : value;

            properties[tp] = (properties[tp] ? properties[tp] + ',' : '') + property;
            properties[td] = (properties[td] ? properties[td] + ',' : '') + duration + 'ms';
            properties[tf] = (properties[tf] ? properties[tf] + ',' : '') + easing;
        }

        return cssProperties;
    }

    /**
    @private
    @name _isBoxShortcut
    @function
    @description Shortcut to detect if we need to step away from slideToggle, CSS accelerated transitions (to come later with fx.step support)
    @param {object} [prop]
    */
    function _isBoxShortcut(prop) {
        for (var property in prop) {
            if ((property == 'width' || property == 'height') && (prop[property] == 'show' || prop[property] == 'hide' || prop[property] == 'toggle')) {
                return true;
            }
        }
        return false;
    }


    /**
    @private
    @name _isEmptyObject
    @function
    @description Check if object is empty (<1.4 compatibility)
    @param {object} [obj]
    */
    function _isEmptyObject(obj) {
        for (var i in obj) {
            return false;
        }
        return true;
    }


    /**
    @private
    @name _cleanValue
    @function
    @description Remove 'px' and other artifacts
    @param {variant} [val]
    */
    function _cleanValue(val) {
        return parseFloat(val.replace(_getUnit(val), ''));
    }


    function _isValidElement(element) {
        var allValid = true;
        element.each(function (index, el) {
            allValid = allValid && el.ownerDocument;
            return allValid;
        });
        return allValid;
    }

    /**
    @private
    @name _appropriateProperty
    @function
    @description Function to check if property should be handled by plugin
    @param {string} [prop]
    @param {variant} [value]
    */
    function _appropriateProperty(prop, value, element) {
        if (!_isValidElement(element)) {
            return false;
        }

        var is = jQuery.inArray(prop, cssTransitionProperties) > -1;
        if ((prop == 'width' || prop == 'height' || prop == 'opacity') && (parseFloat(value) === parseFloat(element.css(prop)))) is = false;
        return is;
    }


    jQuery.extend({
        /**
        @public
        @name toggle3DByDefault
        @function
        @description Toggle for plugin settings to automatically use translate3d (where available). Usage: $.toggle3DByDefault
        */
        toggle3DByDefault: function () {
            return use3DByDefault = !use3DByDefault;
        },


        /**
        @public
        @name toggleDisabledByDefault
        @function
        @description Toggle the plugin to be disabled by default (can be overridden per animation with avoidCSSTransitions)
        */
        toggleDisabledByDefault: function () {
            return pluginDisabledDefault = !pluginDisabledDefault;
        },


        /**
        @public
        @name setDisabledByDefault
        @function
        @description Set or unset the 'disabled by default' value
        */
        setDisabledByDefault: function (newValue) {
            return pluginDisabledDefault = newValue;
        }
    });


    /**
    @public
    @name translation
    @function
    @description Get current X and Y translations
    */
    jQuery.fn.translation = function () {
        if (!this[0]) {
            return null;
        }

        var elem = this[0],
            cStyle = window.getComputedStyle(elem, null),
            translation = {
                x: 0,
                y: 0
            };

        if (cStyle) {
            for (var i = cssPrefixes.length - 1; i >= 0; i--) {
                var transform = cStyle.getPropertyValue(cssPrefixes[i] + 'transform');
                if (transform && (/matrix/i).test(transform)) {
                    var explodedMatrix = transform.replace(/^matrix\(/i, '').split(/, |\)$/g);
                    translation = {
                        x: parseInt(explodedMatrix[4], 10),
                        y: parseInt(explodedMatrix[5], 10)
                    };

                    break;
                }
            }
        }

        return translation;
    };



    /**
    @public
    @name jQuery.fn.animate
    @function
    @description The enhanced jQuery.animate function
    @param {string} [property]
    @param {string} [speed]
    @param {string} [easing]
    @param {function} [callback]
    */
    jQuery.fn.animate = function (prop, speed, easing, callback) {
        prop = prop || {};
        var isTranslatable = !(typeof prop['bottom'] !== 'undefined' || typeof prop['right'] !== 'undefined'),
            optall = jQuery.speed(speed, easing, callback),
            elements = this,
            callbackQueue = 0,
            propertyCallback = function () {
                callbackQueue--;
                if (callbackQueue === 0) {
                    // we're done, trigger the user callback
                    if (typeof optall.complete === 'function') {
                        optall.complete.apply(elements, arguments);
                    }
                }
            },
            bypassPlugin = (typeof prop['avoidCSSTransitions'] !== 'undefined') ? prop['avoidCSSTransitions'] : pluginDisabledDefault;

        if (bypassPlugin === true || !cssTransitionsSupported || _isEmptyObject(prop) || _isBoxShortcut(prop) || optall.duration <= 0 || (jQuery.fn.animate.defaults.avoidTransforms === true && prop['avoidTransforms'] !== false)) {
            return originalAnimateMethod.apply(this, arguments);
        }

        return this[optall.queue === true ? 'queue' : 'each'](function () {
            var self = jQuery(this),
                opt = jQuery.extend({}, optall),
                cssCallback = function (e) {
                    var selfCSSData = self.data(DATA_KEY) || { original: {} },
                        restore = {};

                    if (e.eventPhase != 2)  // not at dispatching target (thanks @warappa issue #58)
                        return;

                    // convert translations to left & top for layout
                    if (prop.leaveTransforms !== true) {
                        for (var i = cssPrefixes.length - 1; i >= 0; i--) {
                            restore[cssPrefixes[i] + 'transform'] = '';
                        }
                        if (isTranslatable && typeof selfCSSData.meta !== 'undefined') {
                            for (var j = 0, dir; (dir = directions[j]) ; ++j) {
                                restore[dir] = selfCSSData.meta[dir + '_o'] + valUnit;
                                jQuery(this).css(dir, restore[dir]);
                            }
                        }
                    }

                    // remove transition timing functions
                    self.
                        unbind(transitionEndEvent).
                        css(selfCSSData.original).
                        css(restore).
                        data(DATA_KEY, null);

                    // if we used the fadeOut shortcut make sure elements are display:none
                    if (prop.opacity === 'hide') {
                        self.css({ 'display': 'none', 'opacity': '' });
                    }

                    // run the main callback function
                    propertyCallback.call(this);
                },
                easings = {
                    bounce: CUBIC_BEZIER_OPEN + '0.0, 0.35, .5, 1.3' + CUBIC_BEZIER_CLOSE,
                    linear: 'linear',
                    swing: 'ease-in-out',

                    // Penner equation approximations from Matthew Lein's Ceaser: http://matthewlein.com/ceaser/
                    easeInQuad: CUBIC_BEZIER_OPEN + '0.550, 0.085, 0.680, 0.530' + CUBIC_BEZIER_CLOSE,
                    easeInCubic: CUBIC_BEZIER_OPEN + '0.550, 0.055, 0.675, 0.190' + CUBIC_BEZIER_CLOSE,
                    easeInQuart: CUBIC_BEZIER_OPEN + '0.895, 0.030, 0.685, 0.220' + CUBIC_BEZIER_CLOSE,
                    easeInQuint: CUBIC_BEZIER_OPEN + '0.755, 0.050, 0.855, 0.060' + CUBIC_BEZIER_CLOSE,
                    easeInSine: CUBIC_BEZIER_OPEN + '0.470, 0.000, 0.745, 0.715' + CUBIC_BEZIER_CLOSE,
                    easeInExpo: CUBIC_BEZIER_OPEN + '0.950, 0.050, 0.795, 0.035' + CUBIC_BEZIER_CLOSE,
                    easeInCirc: CUBIC_BEZIER_OPEN + '0.600, 0.040, 0.980, 0.335' + CUBIC_BEZIER_CLOSE,
                    easeInBack: CUBIC_BEZIER_OPEN + '0.600, -0.280, 0.735, 0.045' + CUBIC_BEZIER_CLOSE,
                    easeOutQuad: CUBIC_BEZIER_OPEN + '0.250, 0.460, 0.450, 0.940' + CUBIC_BEZIER_CLOSE,
                    easeOutCubic: CUBIC_BEZIER_OPEN + '0.215, 0.610, 0.355, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeOutQuart: CUBIC_BEZIER_OPEN + '0.165, 0.840, 0.440, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeOutQuint: CUBIC_BEZIER_OPEN + '0.230, 1.000, 0.320, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeOutSine: CUBIC_BEZIER_OPEN + '0.390, 0.575, 0.565, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeOutExpo: CUBIC_BEZIER_OPEN + '0.190, 1.000, 0.220, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeOutCirc: CUBIC_BEZIER_OPEN + '0.075, 0.820, 0.165, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeOutBack: CUBIC_BEZIER_OPEN + '0.175, 0.885, 0.320, 1.275' + CUBIC_BEZIER_CLOSE,
                    easeInOutQuad: CUBIC_BEZIER_OPEN + '0.455, 0.030, 0.515, 0.955' + CUBIC_BEZIER_CLOSE,
                    easeInOutCubic: CUBIC_BEZIER_OPEN + '0.645, 0.045, 0.355, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeInOutQuart: CUBIC_BEZIER_OPEN + '0.770, 0.000, 0.175, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeInOutQuint: CUBIC_BEZIER_OPEN + '0.860, 0.000, 0.070, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeInOutSine: CUBIC_BEZIER_OPEN + '0.445, 0.050, 0.550, 0.950' + CUBIC_BEZIER_CLOSE,
                    easeInOutExpo: CUBIC_BEZIER_OPEN + '1.000, 0.000, 0.000, 1.000' + CUBIC_BEZIER_CLOSE,
                    easeInOutCirc: CUBIC_BEZIER_OPEN + '0.785, 0.135, 0.150, 0.860' + CUBIC_BEZIER_CLOSE,
                    easeInOutBack: CUBIC_BEZIER_OPEN + '0.680, -0.550, 0.265, 1.550' + CUBIC_BEZIER_CLOSE
                },
                domProperties = {},
                cssEasing = easings[opt.easing || 'swing'] ? easings[opt.easing || 'swing'] : opt.easing || 'swing';

            // seperate out the properties for the relevant animation functions
            for (var p in prop) {
                if (jQuery.inArray(p, pluginOptions) === -1) {
                    var isDirection = jQuery.inArray(p, directions) > -1,
                        cleanVal = _interpretValue(self, prop[p], p, (isDirection && prop.avoidTransforms !== true));

                    if (prop.avoidTransforms !== true && _appropriateProperty(p, cleanVal, self)) {
                        _applyCSSTransition(
                            self,
                            p,
                            opt.duration,
                            cssEasing,
                            isDirection && prop.avoidTransforms === true ? cleanVal + valUnit : cleanVal,
                            isDirection && prop.avoidTransforms !== true,
                            isTranslatable,
                            prop.useTranslate3d === true);

                    }
                    else {
                        domProperties[p] = prop[p];
                    }
                }
            }

            self.unbind(transitionEndEvent);

            var selfCSSData = self.data(DATA_KEY);

            if (selfCSSData && !_isEmptyObject(selfCSSData) && !_isEmptyObject(selfCSSData.secondary)) {
                callbackQueue++;

                self.css(selfCSSData.properties);

                // store in a var to avoid any timing issues, depending on animation duration
                var secondary = selfCSSData.secondary;

                // has to be done in a timeout to ensure transition properties are set
                setTimeout(function () {
                    self.bind(transitionEndEvent, cssCallback).css(secondary);
                });
            }
            else {
                // it won't get fired otherwise
                opt.queue = false;
            }

            // fire up DOM based animations
            if (!_isEmptyObject(domProperties)) {
                callbackQueue++;
                originalAnimateMethod.apply(self, [domProperties, {
                    duration: opt.duration,
                    easing: jQuery.easing[opt.easing] ? opt.easing : (jQuery.easing.swing ? 'swing' : 'linear'),
                    complete: propertyCallback,
                    queue: opt.queue
                }]);
            }

            // strict JS compliance
            return true;
        });
    };

    jQuery.fn.animate.defaults = {};


    /**
    @public
    @name jQuery.fn.stop
    @function
    @description The enhanced jQuery.stop function (resets transforms to left/top)
    @param {boolean} [clearQueue]
    @param {boolean} [gotoEnd]
    @param {boolean} [leaveTransforms] Leave transforms/translations as they are? Default: false (reset translations to calculated explicit left/top props)
    */
    jQuery.fn.stop = function (clearQueue, gotoEnd, leaveTransforms) {
        if (!cssTransitionsSupported) return originalStopMethod.apply(this, [clearQueue, gotoEnd]);

        // clear the queue?
        if (clearQueue) this.queue([]);

        // route to appropriate stop methods
        this.each(function () {
            var self = jQuery(this),
                selfCSSData = self.data(DATA_KEY);

            // is this a CSS transition?
            if (selfCSSData && !_isEmptyObject(selfCSSData)) {
                var i, restore = {};

                if (gotoEnd) {
                    // grab end state properties
                    restore = selfCSSData.secondary;

                    if (!leaveTransforms && typeof selfCSSData.meta['left_o'] !== undefined || typeof selfCSSData.meta['top_o'] !== undefined) {
                        restore['left'] = typeof selfCSSData.meta['left_o'] !== undefined ? selfCSSData.meta['left_o'] : 'auto';
                        restore['top'] = typeof selfCSSData.meta['top_o'] !== undefined ? selfCSSData.meta['top_o'] : 'auto';

                        // remove the transformations
                        for (i = cssPrefixes.length - 1; i >= 0; i--) {
                            restore[cssPrefixes[i] + 'transform'] = '';
                        }
                    }
                } else if (!_isEmptyObject(selfCSSData.secondary)) {
                    var cStyle = window.getComputedStyle(self[0], null);
                    if (cStyle) {
                        // grab current properties
                        for (var prop in selfCSSData.secondary) {
                            if (selfCSSData.secondary.hasOwnProperty(prop)) {
                                prop = prop.replace(rupper, '-$1').toLowerCase();
                                restore[prop] = cStyle.getPropertyValue(prop);

                                // is this a matrix property? extract left and top and apply
                                if (!leaveTransforms && (/matrix/i).test(restore[prop])) {
                                    var explodedMatrix = restore[prop].replace(/^matrix\(/i, '').split(/, |\)$/g);

                                    // apply the explicit left/top props
                                    restore['left'] = (parseFloat(explodedMatrix[4]) + parseFloat(self.css('left')) + valUnit) || 'auto';
                                    restore['top'] = (parseFloat(explodedMatrix[5]) + parseFloat(self.css('top')) + valUnit) || 'auto';

                                    // remove the transformations
                                    for (i = cssPrefixes.length - 1; i >= 0; i--) {
                                        restore[cssPrefixes[i] + 'transform'] = '';
                                    }
                                }
                            }
                        }
                    }
                }

                // Remove transition timing functions
                // Moving to seperate thread (re: Animation reverts when finished in Android - issue #91)
                self.unbind(transitionEndEvent);
                self.
                    css(selfCSSData.original).
                    css(restore).
                    data(DATA_KEY, null);
            }
            else {
                // dom transition
                originalStopMethod.apply(self, [clearQueue, gotoEnd]);
            }
        });

        return this;
    };
})(jQuery, jQuery.fn.animate, jQuery.fn.stop);

/* UI touch punch for interactive bars */
/*
* jQuery UI Touch Punch 0.2.2
*
* Copyright 2011, Dave Furfero
* Dual licensed under the MIT or GPL Version 2 licenses.
*
* Depends:
*  jquery.ui.widget.js
*  jquery.ui.mouse.js
*/
(function (b) { b.support.touch = "ontouchend" in document; if (!b.support.touch) { return; } var c = b.ui.mouse.prototype, e = c._mouseInit, a; function d(g, h) { if (g.originalEvent.touches.length > 1) { return; } g.preventDefault(); var i = g.originalEvent.changedTouches[0], f = document.createEvent("MouseEvents"); f.initMouseEvent(h, true, true, window, 1, i.screenX, i.screenY, i.clientX, i.clientY, false, false, false, false, 0, null); g.target.dispatchEvent(f); } c._touchStart = function (g) { var f = this; if (a || !f._mouseCapture(g.originalEvent.changedTouches[0])) { return; } a = true; f._touchMoved = false; d(g, "mouseover"); d(g, "mousemove"); d(g, "mousedown"); }; c._touchMove = function (f) { if (!a) { return; } this._touchMoved = true; d(f, "mousemove"); }; c._touchEnd = function (f) { if (!a) { return; } d(f, "mouseup"); d(f, "mouseout"); if (!this._touchMoved) { d(f, "click"); } a = false; }; c._mouseInit = function () { var f = this; f.element.bind("touchstart", b.proxy(f, "_touchStart")).bind("touchmove", b.proxy(f, "_touchMove")).bind("touchend", b.proxy(f, "_touchEnd")); e.call(f); }; })(jQuery);

/* Swiper for full page */
/**
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 * 
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * @version 1.1.1 (9th December 2010) - fix bug (older IE's had problems)
 * @version 1.1 (1st September 2010) - support wipe up and wipe down
 * @version 1.0 (15th July 2010)
 */

(function ($) {
    $.fn.touchwipe = function (settings) {
        var config = {
            min_move_x: 20,
            min_move_y: 20,
            wipeLeft: function (e) { e.preventDefault(); },
            wipeRight: function (e) { e.preventDefault(); },
            wipeUp: function (e) { },
            wipeDown: function (e) { },
            preventDefaultEvents: false
        };
        if (settings) $.extend(config, settings); this.each(function () {
            var startX;
            var startY;
            var isMoving = false;
            function cancelTouch() {
                this.removeEventListener('touchmove', onTouchMove);
                this.removeEventListener('mousemove', onMouseMove);
                startX = null;
                isMoving = false;
            }
            function onMouseMove(e) {
                e.touches = [{ pageX: e.clientX, pageY: e.clientY }];
                onTouchMove(e);
            }
            function onTouchMove(e) {
                if (config.preventDefaultEvents) { e.preventDefault() }
                if (isMoving && (e.which == 1 || interactionEvent == "touchend")) { // check if mouse button is clicked
                    var x = e.touches[0].pageX;
                    var y = e.touches[0].pageY;
                    var dx = startX - x;
                    var dy = startY - y;
                    if (Math.abs(dx) >= config.min_move_x) {
                        cancelTouch();
                        if (dx > 0) {
                            config.wipeLeft(e);
                        } else {
                            config.wipeRight(e);
                        }
                    } else if (Math.abs(dy) >= config.min_move_y) {
                        cancelTouch();
                        if (dy > 0) {
                            config.wipeDown(e);
                        } else {
                            config.wipeUp(e);
                        }
                    }
                } else if (isMoving) {
                    cancelTouch();
                }
            }
            function onMouseStart(e) {
                e.touches = [{ pageX: e.clientX, pageY: e.clientY }];
                onTouchStart(e);
            }
            function onTouchStart(e) {
                if (e.touches.length == 1) {
                    startX = e.touches[0].pageX;
                    startY = e.touches[0].pageY;
                    isMoving = true;
                    this.addEventListener('touchmove', onTouchMove, false);
                    this.addEventListener('mousemove', onMouseMove, false);
                }
            }
            if ('ontouchstart' in document.documentElement) {
                this.addEventListener('touchstart', onTouchStart, false);
            }
            if ('onmousemove' in document.documentElement) {
                this.addEventListener('mousedown', onMouseStart, false);
            }
        }); return this
    }
})(jQuery);



/* Implement all functionality */
function showHideMenu(blnShow, intDuration) {
    var intDestX = 0;
    if (blnShow) {
        intDestX = 340;
    } else {
        $('.body').data('opened', false);
    }
    $('.body-parent,.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transition-duration', '0.' + intDuration + 's');
    $('.body-parent,.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transform', 'translate3d(' + intDestX + 'px,0px,0px)');
    $('.mood-indicator-negative-blocked,.mood-indicator-positive-blocked').css('-webkit-transition-duration', '0s');

}

function implementCoreFunctionality(selector) {
    if (selector != undefined) {
        selector = '#' + selector;
    } else {
        selector = '';
    }

    for (var i = 0; i < timers.length; i++) {
        clearTimeout(timers[i]);
    }

    attachAudioFunctionality(selector);
    attachDynamicContent(selector);
    attachShowHideFunctionality(selector);
    attachSliderFunctionality(selector);
    attachStorageFunctionality(selector);
    attachOverlayShowFunctionality(selector);
    attachReferencesFunctionality(selector);
    attachTrackingFunctionality(selector);
    attachVideoFunctionality(selector);
    attachSwipeFunctionality(selector);
    attachMoodIndicatorsShowFunctionality();
    attachMoodIndicatorsClickFunctionality();
    attachInteractiveBarsFunctionality(selector);
    loadSecondaryScenesForScene(selector);

    Framework_track(currentLiveScene.trackingPath);
    $(selector + ' .inhibitNavigationSwipe').each(function () {
        var self = $(this);
        self.on('touchstart', function () {
            animating = true;
        }).on('touchend', function () {
            animating = false;
        })
        self.on('mouseover', function () {
            animating = true;
        }).on('mouseout', function () {
            animating = false;
        });
    });
    if (slidesIndex == 0 || currentLiveScene.name == 'voc') {
        $('#top_nav').css('display', 'none');
    } else {
        $('#top_nav').css('display', 'block');
    }

}

function implementParentCoreFunctionality() {
    attachDynamicContent('');
    attachBiliographyFunctionality();
    attachMoodIndicatorsShowFunctionality();
    attachMoodIndicatorsClickFunctionality();
    attachNavigationFunctionality('');
    attachOverlayShowFunctionality('');
    attachSwipeNextPrevFunctionality();

}

/* On Load functionality */

var slides = new Array();
var intCount = 0;
var currentLiveScene = '';
var currentLiveSecondaryScene = '';
var currentLivePath = '';
var shortCallName = '';
var animating = false;
var divIdBeingLoaded = 'ssss';
var inViewFunctions = {
    window_1: function () { },
    window_2: function () { },
    window_3: function () { }
}


function loadInitialSlides() {
    divIdBeingLoaded = 'window_2';

    $('#window-2').load(slides[0].assetPath, function () {
        inViewFunctions['window_2']();
        divIdBeingLoaded = 'window_3';
        $('#window-3').load(slides[1].assetPath);
        implementCoreFunctionality('window-2');
    });

}

function addInviewFunction(func) {
    inViewFunctions[divIdBeingLoaded] = func;
}

$(document).ready(function () {
    var iSlideCount = 0;
    function changeSlide(blnForwards) {
        var windows = $('.body-content');
        var right;
        var center;
        var left;
        var id;
        center = $(windows[1]);
        currentLiveSecondaryScene = false;
        $('.body').data({ 'secondarySceneOffset': 0, 'opened': false });
        if (!animating) {
            if (blnForwards) {
                intCount++;
                if (intCount >= slides.length) {
                    intCount--;
                    return;
                }
            } else {
                intCount--;
                if (intCount < 0) {
                    intCount++;
                    return;
                }
            }

            var page1;
            var page2;
            var page3;

            if (intCount - 1 >= 0) {
                page1 = slides[intCount - 1].assetPath;
            }

            page2 = slides[intCount].assetPath;
            currentLiveScene = slides[intCount];
            slidesIndex = intCount;
            if ((intCount + 1) <= slides.length - 1) {
                page3 = slides[intCount + 1].assetPath;
            }

            animating = true;
            if (blnForwards) {
                left = $(windows[0]);
                center = $(windows[1]);
                right = $(windows[2]);
                id = left.attr('id');
                stopAllAudioAndVideo(center.attr('id'));
                center.css({ '-webkit-transform': 'translate3d(-2049px,0,0)' });
                right.css({ '-webkit-transform': 'translate3d(-1025px,0,0)' });
                setTimeout(function () {
                    left.remove();
                    inViewFunctions[id.replace('-', '_')] = function () { };
                    $('<div id="' + id + '" class="body-content" style="display:block; left:1025px; -webkit-transform: translate3d(0,0,0)"></div>').appendTo($('#container'));
                    divIdBeingLoaded = id.replace('-', '_').replace('#', '');
                    if (page3) {
                        $('#' + id).load(page3, function () {
                            implementCoreFunctionality(right.attr('id'));
                            updateActiveMenuItem();
                        });
                        if (intCount == 0) { $('#top_nav').css('display', 'none'); }
                    } else {
                        implementCoreFunctionality(right.attr('id'));
                    }
                    inViewFunctions[right.attr('id').replace('-', '_').replace('#', '')]();
                    animating = false;
                }, 600);
            }
            else {
                right = $(windows[2]);
                center = $(windows[1]);
                left = $(windows[0]);
                id = right.attr('id');
                stopAllAudioAndVideo(center.attr('id'));
                center.css({ '-webkit-transform': 'translate3d(0px,0,0)' });
                left.css({ '-webkit-transform': 'translate3d(-1025px,0,0)' });
                setTimeout(function () {
                    right.remove();
                    inViewFunctions[id.replace('-', '_')] = function () { };
                    $('<div id="' + id + '" class="body-content" style="display:block; -webkit-transform: translate3d(-2049px,0,0); left:1025px"></div>').prependTo($('#container'));
                    divIdBeingLoaded = id.replace('-', '_').replace('#', '');
                    if (page1) {
                        $('#' + id).load(page1, function () {
                            implementCoreFunctionality(left.attr('id'));
                            updateActiveMenuItem();
                        });
                        if (intCount == 0) { $('#top_nav').css('display', 'none'); }
                    } else {
                        implementCoreFunctionality(left.attr('id'));
                    }
                    inViewFunctions[left.attr('id').replace('-', '_').replace('#', '')]();
                    animating = false;

                }, 600);
            }
            updateActiveMenuItem();
        }

    }
    $('#parent').touchwipe({
        wipeLeft: function (e) {
            e.preventDefault();
            changeSlide(true);
        },
        wipeRight: function (e) {
            e.preventDefault();
            changeSlide(false);
        },
        min_move_x: 100,
        preventDefaultEvents: false
    });

    $(document).on("touchmove", function (e) {
        $('.touch_active').removeClass('touch_active');
        dragging = true;
    });
    $('head').append('<style>.slide-content, .guide-content, .attributes-content {-webkit-transition:-webkit-transform 1s;}</style>');
    implementParentCoreFunctionality();
    Framework_onLoad();
});

