//step 1: get DOM
let nextDom = document.getElementById('next');
let prevDom = document.getElementById('prev');

let carouselDom = document.querySelector('.carousel');
let SliderDom = carouselDom.querySelector('.carousel .list');
// let thumbnailBorderDom = document.querySelector('.carousel .thumbnail');
// let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');
let timeDom = document.querySelector('.carousel .time');

// thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
let timeRunning = 3000;
let timeAutoNext = 7000;

nextDom.onclick = function(){
    showSlider('next');    
}

prevDom.onclick = function(){
    showSlider('prev');    
}
let runTimeOut;
let runNextAuto = setTimeout(() => {
    next.click();
}, timeAutoNext)
function showSlider(type){
    let  SliderItemsDom = SliderDom.querySelectorAll('.carousel .list .item');
    // let thumbnailItemsDom = document.querySelectorAll('.carousel .thumbnail .item');
    
    if(type === 'next'){
        SliderDom.appendChild(SliderItemsDom[0]);
        // thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
        carouselDom.classList.add('next');
    }else{
        SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
        // thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
        carouselDom.classList.add('prev');
    }
    clearTimeout(runTimeOut);
    runTimeOut = setTimeout(() => {
        carouselDom.classList.remove('next');
        carouselDom.classList.remove('prev');
    }, timeRunning);

    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        next.click();
    }, timeAutoNext)
}



(function() {
  var $$ = function $$(selector, context) {
    context = context || document;
    var elements = context.querySelectorAll(selector);
    return [].slice.call(elements);
  };

  

  function _fncSliderInit($slider, options) {
    var prefix = ".fnc-";
    $slider = $slider;
    var $slidesCont = $slider.querySelector(prefix + "slider__slides");
    var $slides = $$(prefix + "slide", $slider);
    var $controls = $$(prefix + "nav__control", $slider);
    var $controlsBgs = $$(prefix + "nav__bg", $slider);
    var $progressAS = $$(prefix + "nav__control-progress", $slider);
    var numOfSlides = $slides.length;
    var curSlide = 1;
    var sliding = false;
    var slidingAT =
      +parseFloat(getComputedStyle($slidesCont)["transition-duration"]) * 1000;
    var slidingDelay =
      +parseFloat(getComputedStyle($slidesCont)["transition-delay"]) * 1000;
    var autoSlidingActive = false;
    var autoSlidingTO;
    var autoSlidingDelay = 5000; // default autosliding delay value

    var autoSlidingBlocked = false;
    var $activeSlide;
    var $activeControlsBg;
    var $prevControl;

    function setIDs() {
      $slides.forEach(function($slide, index) {
        $slide.classList.add("fnc-slide-" + (index + 1));
      });
      $controls.forEach(function($control, index) {
        $control.setAttribute("data-slide", index + 1);
        $control.classList.add("fnc-nav__control-" + (index + 1));
      });
      $controlsBgs.forEach(function($bg, index) {
        $bg.classList.add("fnc-nav__bg-" + (index + 1));
      });
    }

    setIDs();

    function afterSlidingHandler() {
      $slider
        .querySelector(".m--previous-slide")
        .classList.remove("m--active-slide", "m--previous-slide");
      $slider
        .querySelector(".m--previous-nav-bg")
        .classList.remove("m--active-nav-bg", "m--previous-nav-bg");
      $activeSlide.classList.remove("m--before-sliding");
      $activeControlsBg.classList.remove("m--nav-bg-before");
      $prevControl.classList.remove("m--prev-control");
      $prevControl.classList.add("m--reset-progress");
      var triggerLayout = $prevControl.offsetTop;
      $prevControl.classList.remove("m--reset-progress");
      sliding = false;
      var layoutTrigger = $slider.offsetTop;

      if (autoSlidingActive && !autoSlidingBlocked) {
        setAutoslidingTO();
      }
    }

    function performSliding(slideID) {
      if (sliding) return;
      sliding = true;
      window.clearTimeout(autoSlidingTO);
      curSlide = slideID;
      $prevControl = $slider.querySelector(".m--active-control");
      $prevControl.classList.remove("m--active-control");
      $prevControl.classList.add("m--prev-control");
      $slider
        .querySelector(prefix + "nav__control-" + slideID)
        .classList.add("m--active-control");
      $activeSlide = $slider.querySelector(prefix + "slide-" + slideID);
      $activeControlsBg = $slider.querySelector(prefix + "nav__bg-" + slideID);
      $slider
        .querySelector(".m--active-slide")
        .classList.add("m--previous-slide");
      $slider
        .querySelector(".m--active-nav-bg")
        .classList.add("m--previous-nav-bg");
      $activeSlide.classList.add("m--before-sliding");
      $activeControlsBg.classList.add("m--nav-bg-before");
      var layoutTrigger = $activeSlide.offsetTop;
      $activeSlide.classList.add("m--active-slide");
      $activeControlsBg.classList.add("m--active-nav-bg");
      setTimeout(afterSlidingHandler, slidingAT + slidingDelay);
    }
    

    function controlClickHandler() {
      if (sliding) return;
      if (this.classList.contains("m--active-control")) return;

      if (options.blockASafterClick) {
        autoSlidingBlocked = true;
        $slider.classList.add("m--autosliding-blocked");
      }

      var slideID = +this.getAttribute("data-slide");
      performSliding(slideID);
    }

    $controls.forEach(function($control) {
      $control.addEventListener("click", controlClickHandler);
    });

    function setAutoslidingTO() {
      window.clearTimeout(autoSlidingTO);
      var delay = +options.autoSlidingDelay || autoSlidingDelay;
      curSlide++;
      if (curSlide > numOfSlides) curSlide = 1;
      autoSlidingTO = setTimeout(function() {
        performSliding(curSlide);
      }, delay);
    }

    if (options.autoSliding || +options.autoSlidingDelay > 0) {
      if (options.autoSliding === false) return;
      autoSlidingActive = true;
      setAutoslidingTO();
      $slider.classList.add("m--with-autosliding");
      var triggerLayout = $slider.offsetTop;
      var delay = +options.autoSlidingDelay || autoSlidingDelay;
      delay += slidingDelay + slidingAT;
      $progressAS.forEach(function($progress) {
        $progress.style.transition = "transform " + delay / 1000 + "s";
      });
    }

    $slider
      .querySelector(".fnc-nav__control:first-child")
      .classList.add("m--active-control");
  }

  var fncSlider = function fncSlider(sliderSelector, options) {
    var $sliders = $$(sliderSelector);
    $sliders.forEach(function($slider) {
      _fncSliderInit($slider, options);
    });
  };

  window.fncSlider = fncSlider;
})();
/* not part of the slider scripts */

/* Slider initialization
options:
autoSliding - boolean
autoSlidingDelay - delay in ms. If audoSliding is on and no value provided, default value is 5000
blockASafterClick - boolean. If user clicked any sliding control, autosliding won't start again
*/


/* 1. Proloder */
    $(window).on('load', function () {
      $('#preloader-active').delay(450).fadeOut('slow');
      $('body').delay(450).css({
        'overflow': 'visible'
      });
    });

    

    // zoom image
    $(document).ready(function(){
	
	$(".zoom").mousemove(function(e){
		zoom(e);
	});

	function zoom(e){
		var x, y;
		var zoomer = e.currentTarget;
		if(e.offsetX) {
			offsetX = e.offsetX;
		} else {
			offsetX = e.touches[0].pageX;
		}

		if(e.offsetY) {
			offsetY = e.offsetY;
		} else {
			offsetX = e.touches[0].pageX;
		}
		x = offsetX/zoomer.offsetWidth*100;
		y = offsetY/zoomer.offsetHeight*100;
		zoomer.style.backgroundPosition = x+'% '+y+'%';
	}
});

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector("canvas");
console.clear();
if (canvas) {
  let URL = `https://moonbase.nyc3.cdn.digitaloceanspaces.com/lvdv-brick-dev/webp/frame_`;

  canvas.width = 1920;
  canvas.height = 1200;

  const context = canvas.getContext("2d");

  const frameCount = 599;
  const scrollableFrames = 200;
  const images = [];
  const position = {
    frame: 0,
    mergingFrame: 0
  };
  let isLooping;
  const positionTo = gsap.quickTo(position, "mergingFrame", {
    onUpdate: () => {
      position.frame = Math.round(position.mergingFrame);
      render();
    },
    duration: 0.5,
    onComplete: () => isLooping = false
  });
  const currentFrame = (index) =>
    URL + (index + 1).toString().padStart(3, "0") + ".webp";

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

  let scrollAnimation = gsap.to(position, {
    frame: scrollableFrames - 1,
    snap: "frame",
    ease: "circ.inOut",
    onUpdate: () => {
      if (isLooping) {
        loop.paused() && positionTo(position.frame);
      } else {
        render();
      }
    },
    scrollTrigger: {
      scrub: 0.5,
      trigger: ".track",
      start: "top",
      pin: ".brick-wrap",
      markers: true,
      onLeave: function () {
        isLooping = true;
        positionTo.tween.pause();
        loop.play(0);
      },
      onEnterBack: function () {
        loop.pause();
        positionTo(position.frame);
      }
    }
  });

  images[0].onload = render;

  function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(images[position.frame], 0, 0);
  }

  let loop = gsap.fromTo(position, {
      frame: 200
    }, {
      frame: 598,
      duration: 13,
      repeat: -1,
      snap: "frame",
      ease: "none",
      onUpdate: () => {
        position.mergingFrame = position.frame;
        positionTo.tween.invalidate();
        render();
      },
      paused: true
    }
  );
}




let image = document.querySelectorAll(".floatimg");
let winScroll = 0;
let posNeg = 0;
let isScrolling;

// change speed (hight < 8 < low)
const speed = 8;

image.forEach((elm) => {
  window.addEventListener("scroll", function () {
    winScroll = window.scrollY;

    elm.style.transition = "none";
    elm.style.transform = `translateY(${0 + winScroll / speed}px)`;

    if (posNeg < winScroll) {
      console.log("+++++");
      setTimeout(() => {
        elm.style.transition = "500ms ease-in-out";
        elm.style.transform = `translateY(${0 + winScroll / (speed - 1)}px)`;
      }, 66);
    } else {
      console.log("----");
      setTimeout(() => {
        elm.style.transition = "500ms ease-in-out";
        elm.style.transform = `translateY(${0 + winScroll / (speed + 1)}px)`;
      }, 66);
    }

    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(function () {
      posNeg = winScroll;
    }, 66);
  });
});

 