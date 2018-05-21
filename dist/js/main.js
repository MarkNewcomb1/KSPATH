$(document).ready(function(){
if ($(window).width() < 1025) {
	$('header nav').hide();
	$('.mobile_menu_button').on('click', function(){
		console.log("CLICK");
		if ( $('header nav').is(':hidden')) {
			$('header nav').slideDown(200);
		} else {
			$('header nav').slideUp(200);
		}
	}); //on click
} // end if	
});
// DOM.event.move
//
// 2.0.0
//
// Stephen Band
//
// Triggers 'movestart', 'move' and 'moveend' events after
// mousemoves following a mousedown cross a distance threshold,
// similar to the native 'dragstart', 'drag' and 'dragend' events.
// Move events are throttled to animation frames. Move event objects
// have the properties:
//
// pageX:
// pageY:     Page coordinates of pointer.
// startX:
// startY:    Page coordinates of pointer at movestart.
// distX:
// distY:     Distance the pointer has moved since movestart.
// deltaX:
// deltaY:    Distance the finger has moved since last event.
// velocityX:
// velocityY: Average velocity over last few events.


(function(fn) {
	if (typeof define === 'function' && define.amd) {
        define([], fn);
    } else if ((typeof module !== "undefined" && module !== null) && module.exports) {
        module.exports = fn;
	} else {
		fn();
	}
})(function(){
	var assign = Object.assign || window.jQuery && jQuery.extend;

	// Number of pixels a pressed pointer travels before movestart
	// event is fired.
	var threshold = 8;

	// Shim for requestAnimationFrame, falling back to timer. See:
	// see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	var requestFrame = (function(){
		return (
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(fn, element){
				return window.setTimeout(function(){
					fn();
				}, 25);
			}
		);
	})();

	var ignoreTags = {
			textarea: true,
			input: true,
			select: true,
			button: true
		};

	var mouseevents = {
		move:   'mousemove',
		cancel: 'mouseup dragstart',
		end:    'mouseup'
	};

	var touchevents = {
		move:   'touchmove',
		cancel: 'touchend',
		end:    'touchend'
	};

	var rspaces = /\s+/;


	// DOM Events

	var eventOptions = { bubbles: true, cancelable: true };

	var eventsSymbol = Symbol('events');

	function createEvent(type) {
		return new CustomEvent(type, eventOptions);
	}

	function getEvents(node) {
		return node[eventsSymbol] || (node[eventsSymbol] = {});
	}

	function on(node, types, fn, data, selector) {
		types = types.split(rspaces);

		var events = getEvents(node);
		var i = types.length;
		var handlers, type;

		function handler(e) { fn(e, data); }

		while (i--) {
			type = types[i];
			handlers = events[type] || (events[type] = []);
			handlers.push([fn, handler]);
			node.addEventListener(type, handler);
		}
	}

	function off(node, types, fn, selector) {
		types = types.split(rspaces);

		var events = getEvents(node);
		var i = types.length;
		var type, handlers, k;

		if (!events) { return; }

		while (i--) {
			type = types[i];
			handlers = events[type];
			if (!handlers) { continue; }
			k = handlers.length;
			while (k--) {
				if (handlers[k][0] === fn) {
					node.removeEventListener(type, handlers[k][1]);
					handlers.splice(k, 1);
				}
			}
		}
	}

	function trigger(node, type, properties) {
		// Don't cache events. It prevents you from triggering an event of a
		// given type from inside the handler of another event of that type.
		var event = createEvent(type);
		if (properties) { assign(event, properties); }
		node.dispatchEvent(event);
	}


	// Constructors
	
	function Timer(fn){
		var callback = fn,
		    active = false,
		    running = false;
		
		function trigger(time) {
			if (active){
				callback();
				requestFrame(trigger);
				running = true;
				active = false;
			}
			else {
				running = false;
			}
		}
		
		this.kick = function(fn) {
			active = true;
			if (!running) { trigger(); }
		};
		
		this.end = function(fn) {
			var cb = callback;
			
			if (!fn) { return; }
			
			// If the timer is not running, simply call the end callback.
			if (!running) {
				fn();
			}
			// If the timer is running, and has been kicked lately, then
			// queue up the current callback and the end callback, otherwise
			// just the end callback.
			else {
				callback = active ?
					function(){ cb(); fn(); } : 
					fn ;
				
				active = true;
			}
		};
	}


	// Functions

	function noop() {}
	
	function preventDefault(e) {
		e.preventDefault();
	}

	function isIgnoreTag(e) {
		return !!ignoreTags[e.target.tagName.toLowerCase()];
	}

	function isPrimaryButton(e) {
		// Ignore mousedowns on any button other than the left (or primary)
		// mouse button, or when a modifier key is pressed.
		return (e.which === 1 && !e.ctrlKey && !e.altKey);
	}

	function identifiedTouch(touchList, id) {
		var i, l;

		if (touchList.identifiedTouch) {
			return touchList.identifiedTouch(id);
		}
		
		// touchList.identifiedTouch() does not exist in
		// webkit yet… we must do the search ourselves...
		
		i = -1;
		l = touchList.length;
		
		while (++i < l) {
			if (touchList[i].identifier === id) {
				return touchList[i];
			}
		}
	}

	function changedTouch(e, data) {
		var touch = identifiedTouch(e.changedTouches, data.identifier);

		// This isn't the touch you're looking for.
		if (!touch) { return; }

		// Chrome Android (at least) includes touches that have not
		// changed in e.changedTouches. That's a bit annoying. Check
		// that this touch has changed.
		if (touch.pageX === data.pageX && touch.pageY === data.pageY) { return; }

		return touch;
	}


	// Handlers that decide when the first movestart is triggered
	
	function mousedown(e){
		// Ignore non-primary buttons
		if (!isPrimaryButton(e)) { return; }

		// Ignore form and interactive elements
		if (isIgnoreTag(e)) { return; }

		on(document, mouseevents.move, mousemove, e);
		on(document, mouseevents.cancel, mouseend, e);
	}

	function mousemove(e, data){
		checkThreshold(e, data, e, removeMouse);
	}

	function mouseend(e, data) {
		removeMouse();
	}

	function removeMouse() {
		off(document, mouseevents.move, mousemove);
		off(document, mouseevents.cancel, mouseend);
	}

	function touchstart(e) {
		// Don't get in the way of interaction with form elements
		if (ignoreTags[e.target.tagName.toLowerCase()]) { return; }

		var touch = e.changedTouches[0];

		// iOS live updates the touch objects whereas Android gives us copies.
		// That means we can't trust the touchstart object to stay the same,
		// so we must copy the data. This object acts as a template for
		// movestart, move and moveend event objects.
		var data = {
			target:     touch.target,
			pageX:      touch.pageX,
			pageY:      touch.pageY,
			identifier: touch.identifier,

			// The only way to make handlers individually unbindable is by
			// making them unique.
			touchmove:  function(e, data) { touchmove(e, data); },
			touchend:   function(e, data) { touchend(e, data); }
		};

		on(document, touchevents.move, data.touchmove, data);
		on(document, touchevents.cancel, data.touchend, data);
	}

	function touchmove(e, data) {
		var touch = changedTouch(e, data);
		if (!touch) { return; }
		checkThreshold(e, data, touch, removeTouch);
	}

	function touchend(e, data) {
		var touch = identifiedTouch(e.changedTouches, data.identifier);
		if (!touch) { return; }
		removeTouch(data);
	}

	function removeTouch(data) {
		off(document, touchevents.move, data.touchmove);
		off(document, touchevents.cancel, data.touchend);
	}

	function checkThreshold(e, data, touch, fn) {
		var distX = touch.pageX - data.pageX;
		var distY = touch.pageY - data.pageY;

		// Do nothing if the threshold has not been crossed.
		if ((distX * distX) + (distY * distY) < (threshold * threshold)) { return; }

		triggerStart(e, data, touch, distX, distY, fn);
	}

	function triggerStart(e, data, touch, distX, distY, fn) {
		var touches = e.targetTouches;
		var time = e.timeStamp - data.timeStamp;

		// Create a movestart object with some special properties that
		// are passed only to the movestart handlers.
		var template = {
			altKey:     e.altKey,
			ctrlKey:    e.ctrlKey,
			shiftKey:   e.shiftKey,
			startX:     data.pageX,
			startY:     data.pageY,
			distX:      distX,
			distY:      distY,
			deltaX:     distX,
			deltaY:     distY,
			pageX:      touch.pageX,
			pageY:      touch.pageY,
			velocityX:  distX / time,
			velocityY:  distY / time,
			identifier: data.identifier,
			targetTouches: touches,
			finger: touches ? touches.length : 1,
			enableMove: function() {
				this.moveEnabled = true;
				this.enableMove = noop;
				e.preventDefault();
			}
		};

		// Trigger the movestart event.
		trigger(data.target, 'movestart', template);

		// Unbind handlers that tracked the touch or mouse up till now.
		fn(data);
	}


	// Handlers that control what happens following a movestart

	function activeMousemove(e, data) {
		var timer  = data.timer;

		data.touch = e;
		data.timeStamp = e.timeStamp;
		timer.kick();
	}

	function activeMouseend(e, data) {
		var target = data.target;
		var event  = data.event;
		var timer  = data.timer;

		removeActiveMouse();

		endEvent(target, event, timer, function() {
			// Unbind the click suppressor, waiting until after mouseup
			// has been handled.
			setTimeout(function(){
				off(target, 'click', preventDefault);
			}, 0);
		});
	}

	function removeActiveMouse() {
		off(document, mouseevents.move, activeMousemove);
		off(document, mouseevents.end, activeMouseend);
	}

	function activeTouchmove(e, data) {
		var event = data.event;
		var timer = data.timer;
		var touch = changedTouch(e, event);

		if (!touch) { return; }

		// Stop the interface from gesturing
		e.preventDefault();

		event.targetTouches = e.targetTouches;
		data.touch = touch;
		data.timeStamp = e.timeStamp;

		timer.kick();
	}

	function activeTouchend(e, data) {
		var target = data.target;
		var event  = data.event;
		var timer  = data.timer;
		var touch  = identifiedTouch(e.changedTouches, event.identifier);

		// This isn't the touch you're looking for.
		if (!touch) { return; }

		removeActiveTouch(data);
		endEvent(target, event, timer);
	}

	function removeActiveTouch(data) {
		off(document, touchevents.move, data.activeTouchmove);
		off(document, touchevents.end, data.activeTouchend);
	}


	// Logic for triggering move and moveend events

	function updateEvent(event, touch, timeStamp) {
		var time = timeStamp - event.timeStamp;

		event.distX =  touch.pageX - event.startX;
		event.distY =  touch.pageY - event.startY;
		event.deltaX = touch.pageX - event.pageX;
		event.deltaY = touch.pageY - event.pageY;
		
		// Average the velocity of the last few events using a decay
		// curve to even out spurious jumps in values.
		event.velocityX = 0.3 * event.velocityX + 0.7 * event.deltaX / time;
		event.velocityY = 0.3 * event.velocityY + 0.7 * event.deltaY / time;
		event.pageX =  touch.pageX;
		event.pageY =  touch.pageY;
	}

	function endEvent(target, event, timer, fn) {
		timer.end(function(){
			trigger(target, 'moveend', event);
			return fn && fn();
		});
	}


	// Set up the DOM

	function movestart(e) {
		if (e.defaultPrevented) { return; }
		if (!e.moveEnabled) { return; }

		var event = {
			startX:        e.startX,
			startY:        e.startY,
			pageX:         e.pageX,
			pageY:         e.pageY,
			distX:         e.distX,
			distY:         e.distY,
			deltaX:        e.deltaX,
			deltaY:        e.deltaY,
			velocityX:     e.velocityX,
			velocityY:     e.velocityY,
			identifier:    e.identifier,
			targetTouches: e.targetTouches,
			finger:        e.finger
		};

		var data = {
			target:    e.target,
			event:     event,
			timer:     new Timer(update),
			touch:     undefined,
			timeStamp: e.timeStamp
		};

		function update(time) {
			updateEvent(event, data.touch, data.timeStamp);
			trigger(data.target, 'move', event);
		}

		if (e.identifier === undefined) {
			// We're dealing with a mouse event.
			// Stop clicks from propagating during a move
			on(e.target, 'click', preventDefault);
			on(document, mouseevents.move, activeMousemove, data);
			on(document, mouseevents.end, activeMouseend, data);
		}
		else {
			// In order to unbind correct handlers they have to be unique
			data.activeTouchmove = function(e, data) { activeTouchmove(e, data); };
			data.activeTouchend = function(e, data) { activeTouchend(e, data); };

			// We're dealing with a touch.
			on(document, touchevents.move, data.activeTouchmove, data);
			on(document, touchevents.end, data.activeTouchend, data);
		}
	}

	on(document, 'mousedown', mousedown);
	on(document, 'touchstart', touchstart);
	on(document, 'movestart', movestart);


	// jQuery special events
	//
	// jQuery event objects are copies of DOM event objects. They need
	// a little help copying the move properties across.

	if (!window.jQuery) { return; }

	var properties = ("startX startY pageX pageY distX distY deltaX deltaY velocityX velocityY").split(' ');

	function enableMove1(e) { e.enableMove(); }
	function enableMove2(e) { e.enableMove(); }
	function enableMove3(e) { e.enableMove(); }

	function add(handleObj) {
		var handler = handleObj.handler;

		handleObj.handler = function(e) {
			// Copy move properties across from originalEvent
			var i = properties.length;
			var property;

			while(i--) {
				property = properties[i];
				e[property] = e.originalEvent[property];
			}

			handler.apply(this, arguments);
		};
	}

	jQuery.event.special.movestart = {
		setup: function() {
			// Movestart must be enabled to allow other move events
			on(this, 'movestart', enableMove1);

			// Do listen to DOM events
			return false;
		},

		teardown: function() {
			off(this, 'movestart', enableMove1);
			return false;
		},

		add: add
	};

	jQuery.event.special.move = {
		setup: function() {
			on(this, 'movestart', enableMove2);
			return false;
		},

		teardown: function() {
			off(this, 'movestart', enableMove2);
			return false;
		},

		add: add
	};

	jQuery.event.special.moveend = {
		setup: function() {
			on(this, 'movestart', enableMove3);
			return false;
		},

		teardown: function() {
			off(this, 'movestart', enableMove3);
			return false;
		},

		add: add
	};
});
// jQuery.event.swipe
// 0.5
// Stephen Band

// Dependencies
// jQuery.event.move 1.2

// One of swipeleft, swiperight, swipeup or swipedown is triggered on
// moveend, when the move has covered a threshold ratio of the dimension
// of the target node, or has gone really fast. Threshold and velocity
// sensitivity changed with:
//
// jQuery.event.special.swipe.settings.threshold
// jQuery.event.special.swipe.settings.sensitivity

(function (thisModule) {
	if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', undefined, 'jquery.event.move'], thisModule);
    } else if ((typeof module !== "undefined" && module !== null) && module.exports) {
        module.exports = thisModule;
	} else {
		// Browser globals
        thisModule(jQuery);
	}
})(function(jQuery, undefined){
	var add = jQuery.event.add,
	   
	    remove = jQuery.event.remove,

	    // Just sugar, so we can have arguments in the same order as
	    // add and remove.
	    trigger = function(node, type, data) {
	    	jQuery.event.trigger(type, data, node);
	    },

	    settings = {
	    	// Ratio of distance over target finger must travel to be
	    	// considered a swipe.
	    	threshold: 0.4,
	    	// Faster fingers can travel shorter distances to be considered
	    	// swipes. 'sensitivity' controls how much. Bigger is shorter.
	    	sensitivity: 6
	    };

	function moveend(e) {
		var w, h, event;

		w = e.currentTarget.offsetWidth;
		h = e.currentTarget.offsetHeight;

		// Copy over some useful properties from the move event
		event = {
			distX: e.distX,
			distY: e.distY,
			velocityX: e.velocityX,
			velocityY: e.velocityY,
			finger: e.finger
		};

		// Find out which of the four directions was swiped
		if (e.distX > e.distY) {
			if (e.distX > -e.distY) {
				if (e.distX/w > settings.threshold || e.velocityX * e.distX/w * settings.sensitivity > 1) {
					event.type = 'swiperight';
					trigger(e.currentTarget, event);
				}
			}
			else {
				if (-e.distY/h > settings.threshold || e.velocityY * e.distY/w * settings.sensitivity > 1) {
					event.type = 'swipeup';
					trigger(e.currentTarget, event);
				}
			}
		}
		else {
			if (e.distX > -e.distY) {
				if (e.distY/h > settings.threshold || e.velocityY * e.distY/w * settings.sensitivity > 1) {
					event.type = 'swipedown';
					trigger(e.currentTarget, event);
				}
			}
			else {
				if (-e.distX/w > settings.threshold || e.velocityX * e.distX/w * settings.sensitivity > 1) {
					event.type = 'swipeleft';
					trigger(e.currentTarget, event);
				}
			}
		}
	}

	function getData(node) {
		var data = jQuery.data(node, 'event_swipe');
		
		if (!data) {
			data = { count: 0 };
			jQuery.data(node, 'event_swipe', data);
		}
		
		return data;
	}

	jQuery.event.special.swipe =
	jQuery.event.special.swipeleft =
	jQuery.event.special.swiperight =
	jQuery.event.special.swipeup =
	jQuery.event.special.swipedown = {
		setup: function( data, namespaces, eventHandle ) {
			var data = getData(this);

			// If another swipe event is already setup, don't setup again.
			if (data.count++ > 0) { return; }

			add(this, 'moveend', moveend);

			return true;
		},

		teardown: function() {
			var data = getData(this);

			// If another swipe event is still setup, don't teardown.
			if (--data.count > 0) { return; }

			remove(this, 'moveend', moveend);

			return true;
		},

		settings: settings
	};
});
!function(t){"object"==typeof module&&"object"==typeof module.exports?t(require("jquery")):"function"==typeof define&&define.amd?define([],t(window.jQuery)):t(window.jQuery)}(function(t){if(!t)return console.warn("Unslider needs jQuery");t.Unslider=function(n,e){var i=this;return i._="unslider",i.defaults={autoplay:!1,delay:3e3,speed:750,easing:"swing",keys:{prev:37,next:39},nav:!0,arrows:{prev:'<a class="'+i._+'-arrow prev">Prev</a>',next:'<a class="'+i._+'-arrow next">Next</a>'},animation:"horizontal",selectors:{container:"ul:first",slides:"li"},animateHeight:!1,activeClass:i._+"-active",swipe:!0,swipeThreshold:.2},i.$context=n,i.options={},i.$parent=null,i.$container=null,i.$slides=null,i.$nav=null,i.$arrows=[],i.total=0,i.current=0,i.prefix=i._+"-",i.eventSuffix="."+i.prefix+~~(2e3*Math.random()),i.interval=[],i.init=function(n){return i.options=t.extend({},i.defaults,n),i.$container=i.$context.find(i.options.selectors.container).addClass(i.prefix+"wrap"),i.$slides=i.$container.children(i.options.selectors.slides),i.setup(),t.each(["nav","arrows","keys","infinite"],function(n,e){i.options[e]&&i["init"+t._ucfirst(e)]()}),jQuery.event.special.swipe&&i.options.swipe&&i.initSwipe(),i.options.autoplay&&i.start(),i.calculateSlides(),i.$context.trigger(i._+".ready"),i.animate(i.options.index||i.current,"init")},i.setup=function(){i.$context.addClass(i.prefix+i.options.animation).wrap('<div class="'+i._+'" />'),i.$parent=i.$context.parent("."+i._),"static"===i.$context.css("position")&&i.$context.css("position","relative"),i.$context.css("overflow","hidden")},i.calculateSlides=function(){if(i.$slides=i.$container.children(i.options.selectors.slides),i.total=i.$slides.length,"fade"!==i.options.animation){var t="width";"vertical"===i.options.animation&&(t="height"),i.$container.css(t,100*i.total+"%").addClass(i.prefix+"carousel"),i.$slides.css(t,100/i.total+"%")}},i.start=function(){return i.interval.push(setTimeout(function(){i.next()},i.options.delay)),i},i.stop=function(){for(var t;t=i.interval.pop();)clearTimeout(t);return i},i.initNav=function(){var n=t('<nav class="'+i.prefix+'nav"><ol /></nav>');i.$slides.each(function(e){var o=this.getAttribute("data-nav")||e+1;t.isFunction(i.options.nav)&&(o=i.options.nav.call(i.$slides.eq(e),e,o)),n.children("ol").append('<li data-slide="'+e+'">'+o+"</li>")}),i.$nav=n.insertAfter(i.$context),i.$nav.find("li").on("click"+i.eventSuffix,function(){var n=t(this).addClass(i.options.activeClass);n.siblings().removeClass(i.options.activeClass),i.animate(n.attr("data-slide"))})},i.initArrows=function(){!0===i.options.arrows&&(i.options.arrows=i.defaults.arrows),t.each(i.options.arrows,function(n,e){i.$arrows.push(t(e).insertAfter(i.$context).on("click"+i.eventSuffix,i[n]))})},i.initKeys=function(){!0===i.options.keys&&(i.options.keys=i.defaults.keys),t(document).on("keyup"+i.eventSuffix,function(n){t.each(i.options.keys,function(e,o){n.which===o&&t.isFunction(i[e])&&i[e].call(i)})})},i.initSwipe=function(){var t=i.$slides.width();"fade"!==i.options.animation&&i.$container.on({movestart:function(t){if(t.distX>t.distY&&t.distX<-t.distY||t.distX<t.distY&&t.distX>-t.distY)return!!t.preventDefault();i.$container.css("position","relative")},move:function(n){i.$container.css("left",-100*i.current+100*n.distX/t+"%")},moveend:function(n){Math.abs(n.distX)/t>i.options.swipeThreshold?i[n.distX<0?"next":"prev"]():i.$container.animate({left:-100*i.current+"%"},i.options.speed/2)}})},i.initInfinite=function(){var n=["first","last"];t.each(n,function(t,e){i.$slides.push.apply(i.$slides,i.$slides.filter(':not(".'+i._+'-clone")')[e]().clone().addClass(i._+"-clone")["insert"+(0===t?"After":"Before")](i.$slides[n[~~!t]]()))})},i.destroyArrows=function(){t.each(i.$arrows,function(t,n){n.remove()})},i.destroySwipe=function(){i.$container.off("movestart move moveend")},i.destroyKeys=function(){t(document).off("keyup"+i.eventSuffix)},i.setIndex=function(t){return t<0&&(t=i.total-1),i.current=Math.min(Math.max(0,t),i.total-1),i.options.nav&&i.$nav.find('[data-slide="'+i.current+'"]')._active(i.options.activeClass),i.$slides.eq(i.current)._active(i.options.activeClass),i},i.animate=function(n,e){if("first"===n&&(n=0),"last"===n&&(n=i.total),isNaN(n))return i;i.options.autoplay&&i.stop().start(),i.setIndex(n),i.$context.trigger(i._+".change",[n,i.$slides.eq(n)]);var o="animate"+t._ucfirst(i.options.animation);return t.isFunction(i[o])&&i[o](i.current,e),i},i.next=function(){var t=i.current+1;return t>=i.total&&(t=i.options.noloop&&!i.options.infinite?i.total-1:0),i.animate(t,"next")},i.prev=function(){var t=i.current-1;return t<0&&(t=i.options.noloop&&!i.options.infinite?0:i.total-1),i.animate(t,"prev")},i.animateHorizontal=function(t){var n="left";return"rtl"===i.$context.attr("dir")&&(n="right"),i.options.infinite&&i.$container.css("margin-"+n,"-100%"),i.slide(n,t)},i.animateVertical=function(t){return i.options.animateHeight=!0,i.options.infinite&&i.$container.css("margin-top",-i.$slides.outerHeight()),i.slide("top",t)},i.slide=function(t,n){if(i.animateHeight(n),i.options.infinite){var e;n===i.total-1&&(e=i.total-3,n=-1),n===i.total-2&&(e=0,n=i.total-2),"number"==typeof e&&(i.setIndex(e),i.$context.on(i._+".moved",function(){i.current===e&&i.$container.css(t,-100*e+"%").off(i._+".moved")}))}var o={};return o[t]=-100*n+"%",i._move(i.$container,o)},i.animateFade=function(t){i.animateHeight(t);var n=i.$slides.eq(t).addClass(i.options.activeClass);i._move(n.siblings().removeClass(i.options.activeClass),{opacity:0}),i._move(n,{opacity:1},!1)},i.animateHeight=function(t){i.options.animateHeight&&i._move(i.$context,{height:i.$slides.eq(t).outerHeight()},!1)},i._move=function(t,n,e,o){return!1!==e&&(e=function(){i.$context.trigger(i._+".moved")}),t._move(n,o||i.options.speed,i.options.easing,e)},i.init(e)},t.fn._active=function(t){return this.addClass(t).siblings().removeClass(t)},t._ucfirst=function(t){return(t+"").toLowerCase().replace(/^./,function(t){return t.toUpperCase()})},t.fn._move=function(){return this.stop(!0,!0),t.fn[t.fn.velocity?"velocity":"animate"].apply(this,arguments)},t.fn.unslider=function(n){return this.each(function(e,i){var o=t(i);if(!(t(i).data("unslider")instanceof t.Unslider)){if("string"==typeof n&&o.data("unslider")){n=n.split(":");var s=o.data("unslider")[n[0]];if(t.isFunction(s))return s.apply(o,n[1]?n[1].split(","):null)}return o.data("unslider",new t.Unslider(o,n))}})}});