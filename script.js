(function($) { // Begin jQuery
  $(function() { // DOM ready
    // If a link has a dropdown, add sub menu toggle.
    $('nav ul li a:not(:only-child)').click(function(e) {
      $(this).siblings('.nav-dropdown').toggle();
      // Close one dropdown when selecting another
      $('.nav-dropdown').not($(this).siblings()).hide();
      e.stopPropagation();
    });
    // Clicking away from dropdown will remove the dropdown class
    $('html').click(function() {
      $('.nav-dropdown').hide();
    });
    // Toggle open and close nav styles on click
    $('#nav-toggle').click(function() {
      $('nav ul').slideToggle();
    });
    // Hamburger to X toggle
    $('#nav-toggle').on('click', function() {
      this.classList.toggle('active');
    });
  }); // end DOM ready
})(jQuery); // end jQuery



InitInfiniteCarousal('.parent', '.slide', {
  
});

function InitInfiniteCarousal(wrapper, slideClass, options){

    options.slideDelay = options.slideDelay || 2.5;
    options.slideDuration = options.slideDuration || 0.3;
    options.onCompleteEvt = options.onCompleteEvt || null;
    options.isPaused = options.isPaused || false;
    options.easeType = options.easeType || Linear.easeNone;
    options.paginationButtons = options.paginationButtons || null;

    var slideDraggable;
    var slides = $(wrapper).find(slideClass);
    var boxWidth = slides.outerWidth();
    var wrapWidth = slides.length * boxWidth - boxWidth;

    slides.css('position', 'absolute');

    slides.each(function(index){
        TweenMax.set(this, {xPercent: index * 100});
    });

    var wrap = wrapPartial(-100, (slides.length - 1) * 100);
    var timer = TweenLite.delayedCall(options.slideDelay, autoPlay);
    var animation = null;

    var lastX = 0;
    var totalPercent = 0;
    var keptDragging = false;

    slideDraggable = new Draggable('<div />', {
        trigger: wrapper,
        type: 'x',
        dragClickables: true,
        onDrag: updateProgress,
        onPress: pauseProgress,
        onRelease: continueProgress
    });

    function animateSlides(delta){
        animation = TweenMax.to(slides, options.slideDuration,{
            x: 0,
            ease: options.easeType,
            xPercent: function(i, target){
                return (Math.round(target._gsTransform.xPercent/100) * 100) + delta;
            },
            modifiers: {
                xPercent: wrap
            },
            onComplete: restartTimer
        });
    }

    if(boxWidth * slides.length <= $(wrapper).width() + 1){
        killTweens();

        slideDraggable.disable();

        slides.each(function(index){
            TweenMax.set(this, {xPercent: index * 100});
        });

    }

    if(options.isPaused){
        killTweens();
    }

    if(options.onCompleteEvt !== null){
        $(wrapper).find(slideClass).each(function(index){
            if(this._gsTransform.xPercent === 0){
                options.onCompleteEvt(index);
                return;
            }
        });
    }

    $(window).resize(function(){
        boxWidth = slides.outerWidth();
        wrapWidth = slides.length * boxWidth - boxWidth;

        if(boxWidth * slides.length <= $(wrapper).width() + 1){
            killTweens();

            slideDraggable.disable();

            slides.each(function(index){
                TweenMax.set(this, {xPercent: index * 100});
            });
        } else if(!slideDraggable.enabled()){
            slideDraggable.enable();
            autoPlay();
        }
    });

    function autoPlay(){
        if(!animation && !options.isPaused) {
            animateSlides(100);
        }
    }

    function restartTimer(){
        if(animation === this){
            animation = null;
            timer.restart(true);
        }

        if(options.onCompleteEvt !== null){
            $(wrapper).find(slideClass).each(function(index){
                if(this._gsTransform.xPercent === 0){
                    options.onCompleteEvt(index);
                    return;
                }
            });
        }
    }

    function wrapPartial(min, max){
        var r = max - min;

        return function(value){
            var v = value - min;
            return ((r + v % r) % r) + min;
        };
    }



    function updateProgress() {
        var currentPercent = (this.x-lastX)/$(wrapper).find(slideClass).outerWidth() * 100;
        TweenMax.set($(wrapper).find(slideClass), {xPercent: '+=' + currentPercent,
            modifiers: {
                xPercent: wrap
            }
        });

        if((this.x > lastX && this.getDirection() ==='right')
        || (this.x < lastX && this.getDirection() ==='left')){
            keptDragging = true;
        } else{
            keptDragging = false;
        }

        lastX = this.x;
        totalPercent += currentPercent;


    }

    function pauseProgress(){
        killTweens();
        lastX = this.x;
        totalPercent = 0;
    }

    function continueProgress(){
        TweenMax.set(this.target, {x: 0});

        if(Math.round(totalPercent/100) !== 0){
            animateSlides(0);
        }else if (this.x && keptDragging){
            animateSlides(100 * (this.x > 0 ? 1 : -1));
        } else{
            animateSlides(0);
        }

    }

    function killTweens(){
        TweenMax.killTweensOf($(wrapper).find(slideClass));
        TweenMax.killDelayedCallsTo(animateSlides);
        TweenMax.killDelayedCallsTo(restartTimer);
        TweenMax.killDelayedCallsTo(autoPlay);
    }

    $(options.paginationButtons).click(function(){
        var clickIndex = $(this).index();
        var targetxPercent = $(wrapper).find(slideClass).eq(clickIndex)[0]._gsTransform.xPercent;
        animateSlides( Math.round((0 - targetxPercent)/100) * 100);
    });

}