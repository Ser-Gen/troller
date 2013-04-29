/*!
 * troller 1.1
 * https://github.com/Ser-Gen/troller
 * Компонент для прокрутки к верху документа и обратно
 * MIT licensed
 *
 * Создан Сергеем Васильевым (@Ser_Gen)
 */
var Troller = {

  /**
   * создаёт элемент и всё ему нужное
   */
  create: function( options ) {

    // троллер должен остаться только один
    if ( document.getElementById( 'troller' ) !== null ) {
      return 'Троллер уже работает';
    }

    // создаём опции, если нет, и настраиваем их
    if ( options === undefined ) {
      options = {};
    }

    var isSVG = Troller.supportsSvg(),
        uarr, darr;

    if ( isSVG ) {
      uarr = '<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="15px" height="15px" viewBox="0 0 83.642 100" enable-background="new 0 0 83.642 100" xml:space="preserve"><polygon class="trollerArrow" points="0.054,41.737 41.849,0 83.642,41.737 83.642,69.339 51.867,37.562 51.867,100 31.609,100 31.609,37.786 0,69.339 0.054,41.737 "></polygon></svg>';
      darr = '<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="15px" height="15px" viewBox="0 0 83.64 100" enable-background="new 0 0 83.64 100" xml:space="preserve"><polygon class="trollerArrow" points="83.584,58.208 41.792,100 0,58.208 0,30.666 31.777,62.437 31.777,0 52.03,0 52.03,62.213 83.64,30.606 83.584,58.208 "></polygon></svg>';
    } else {
      uarr = '&uarr;';
      darr = '&darr;';
    }

    var config = {
      uarr : uarr,
      darr : darr
    };

    Troller.extend( config, options );

    // основные переменные страницы
    var html = document.documentElement,
        head = document.getElementsByTagName('head')[0],
        body = document.body,

        obj;

    // элемент для прокрутки
    var elemScroll = Troller.elementScroll();

    // вспомогательные переменные
    var previousPos = 0,
        currentPos = 0,
        shift = 50,
        isScrolling = false,
        isShowing = false,
        wH = Troller.windowHeight(),
        scrollerAnimation, opacityAnimation,
        trollerIsDown = true;

    panelPreparing();
    bindEvents();
    Troller.onDocumentReady(documentReady);


    // готовим панель
    function panelPreparing() {
      var style = document.createElement( 'style' ),
          css = '.troller{color:#bbb;display:none;font-family:tahoma,arial,helvetica,sans-serif;height:100%;left:0;padding:12px 10px;position:fixed;text-decoration:none;top:0;z-index:9999;}.troller:hover{background-color:rgb(235,245,255);background-color:rgba(70,90,110,.1);color:#999;}.trollerArrow{fill:#bbb}.trollerArrow:hover{fill:#999}';

      style.type = 'text/css';

      // http://stackoverflow.com/questions/5227088/creating-style-node-adding-innerhtml-add-to-dom-and-ie-headaches
      if ( style.styleSheet ) { // IE
        style.styleSheet.cssText = css;
      } else {
        style.appendChild( document.createTextNode( css ) );
      }

      // http://stackoverflow.com/questions/826782/css-rule-to-disable-text-selection-highlighting
      // http://stackoverflow.com/questions/7590537/ie-ignores-styles-for-dynamically-loaded-content
      obj = document.createElement( 'span' );
      obj.id = 'troller';
      obj.className = 'troller';
      obj.style[ Troller.prefix( 'boxSizing' ) ] = 'border-box';
      obj.style[ Troller.prefix( 'userSelect' ) ] = 'none';
      obj.setAttribute( 'unselectable', 'on' );

      head.appendChild( style );
      body.appendChild( obj );

      // пока не прокрутится чуть сильнее, не отобразится панель
      // костылина, но что уж поделаешь
      // пора на блинк, блин
      if ( /opera/.test( navigator.userAgent.toLowerCase() ) ) {
        var crutch = elemScroll.scrollTop;
        if ( crutch != 0 ) {
          elemScroll.scrollTop = crutch = crutch - 1;
          elemScroll.scrollTop = crutch + 1;
        };
      };
    }

    // логика скроллера троллера
    function scroller() {
      var firstPos = 0,
          lastPos = 0;
          isScrolling = true;

      if ( previousPos ) {
        // если есть запомненное предыдущее положение — будем крутить до него
        lastPos = previousPos;
        previousPos = 0;
      } else {
        /**
         * если нет — запоминаем текущее положение
         * http://stackoverflow.com/questions/1145850/get-height-of-entire-document-with-javascript
         */
        var dH = Math.max( body.scrollHeight, body.offsetHeight, 
                     html.clientHeight, html.scrollHeight, html.offsetHeight );
        previousPos = currentPos;
        if ( ( dH - lastPos ) < wH ) { lastPos = dH - wH; }
      }
      // если получается, что крутить надо до текущего положения — крутим наверх
      if ( lastPos === currentPos ) { lastPos = 0; }
      // рассчитываем первое положение, учитывая сдвиг
      lastPos < currentPos ?
        firstPos = lastPos + shift
        : firstPos = lastPos - shift
      // http://stackoverflow.com/questions/6333028/cross-browser-method-for-setting-scrolltop-of-an-element
      elemScroll.scrollTop = firstPos;
      scrollerAnimation && scrollerAnimation.stop();
      scrollerAnimation = Troller.animate( elemScroll, { scrollTop: lastPos }, 100, function() { isScrolling = false; } );
    }

    // логика отображения троллера
    function showOrHide() {
      currentPos = elemScroll.scrollTop;

      if ( !isScrolling ) { previousPos = 0; }

      if ( currentPos >= wH/4 ) {

        if ( trollerIsDown ) {
          obj.innerHTML = config.uarr;
          Troller.removeClass( obj, 'trollerIsDown' );
          Troller.addClass( obj, 'trollerIsUp' );
          trollerIsDown = false;
        }

        if ( !isShowing ) {
          opacityAnimation && opacityAnimation.stop();
          obj.style.display = 'block';
          opacityAnimation = Troller.animate( obj, { opacity : 1 }, 1000 );
          isShowing = true;
        }
      }

      if ( currentPos < wH/4 ) {

        if ( !trollerIsDown ) {
          obj.innerHTML = config.darr;
          Troller.removeClass( obj, 'trollerIsUp' );
          Troller.addClass( obj, 'trollerIsDown' );
          trollerIsDown = true;
        }

        if ( isShowing && !previousPos ) {
          opacityAnimation && opacityAnimation.stop();
          opacityAnimation = Troller.animate( obj, { opacity : 0 }, 1000, Troller.hide( obj ) );
          isShowing = false;
        }
      }
    }

    // назначаем события
    function bindEvents() {
      // http://blogs.msdn.com/b/ie/archive/2011/09/20/touch-input-for-ie10-and-metro-style-apps.aspx
      // http://msdn.microsoft.com/en-US/library/ie/hh673557.aspx
      if ( window.navigator.msPointerEnabled ) {
        Troller.bindEvent( obj, 'MSPointerDown', scroller );
      } else if ( 'ontouchstart' in window ) {
        Troller.bindEvent( obj, 'touchstart', scroller );
      } else {
        Troller.bindEvent( obj, 'click', scroller );
      }

      Troller.bindEvent( window, 'scroll', showOrHide );
      // http://stackoverflow.com/questions/641857/javascript-window-resize-event#comment7547069_641874
      Troller.bindEvent( window, 'resize', showOrHide );
    }

    // первый раз отображаем, когда ДОМ построен
    function documentReady() {
      showOrHide();
    }

    /// API: ///////////////////////////////////
    return {
      scroller : scroller
    };

  },

  /**
   * анимирует элемент
   */
  animate: function( element, properties, duration, callback ) {
    return (function() {
      // контейнер для всех начальных и конечных значений
      var interpolations = {},
          obj = element;

      // форматируем параметры
      for( var p in properties ) {
        // scrollTop метод самого элемента, например
        // но стиль тоже нужно уметь менять
        element[p] === undefined ? element = element.style : element = obj
        interpolations[p] = {
          // start: parseFloat( element.style[p] ) || 0,
          start: parseFloat( element[p] ) || 0,
          end: parseFloat( properties[p] ),
          unit: ( typeof properties[p] === 'string' && properties[p].match( /px|em|%/gi ) ) ? properties[p].match( /px|em|%/gi )[0] : ''
        };
      }

      var animationStartTime = Date.now(),
          animationTimeout;

      // шаг анимации
      function step() {
        // Ease out
        var progress = 1 - Math.pow( 1 - ( ( Date.now() - animationStartTime ) / duration ), 5 );

        // выставляем стиль элемента в соответствие со следующим значением
        for( var p in interpolations ) {
          var property = interpolations[p];
          // element.style[p] = property.start + ( ( property.end - property.start ) * progress ) + property.unit;
          element[p] = property.start + ( ( property.end - property.start ) * progress ) + property.unit;
        }

        // продолжаем, пока не закончим
        if( progress < 1 ) {
          animationTimeout = setTimeout( step, 1000 / 60 );
        }
        else {
          callback && callback();
          stop();
        }
      }

      // отменяем анимацию
      function stop() {
        clearTimeout( animationTimeout );
      }

      // начинаем анимацию
      step();


      /// API: ///////////////////////////////////

      return {
        stop: stop
      };
    })();
  },

  /**
   * расширяет объект a свойствами объекта b.
   * если возник конфликт, у b приоритет
   */
  extend: function( a, b ) {
    for( var i in b ) {
      a[ i ] = b[ i ];
    }
  },

  /**
   * добавляет префиксы, нужные браузеру
   */
  prefix: function( property, el ) {
    var propertyUC = property.slice( 0, 1 ).toUpperCase() + property.slice( 1 ),
      vendors = [ 'Webkit', 'Moz', 'O', 'ms' ];

    for( var i = 0, len = vendors.length; i < len; i++ ) {
      var vendor = vendors[i];

      if( typeof ( el || document.body ).style[ vendor + propertyUC ] !== 'undefined' ) {
        return vendor + propertyUC;
      }
    }

    return property;
  },

  /**
   * добавляет класс
   */
  addClass: function( element, name ) {
    element.className = element.className.replace( /\s+$/gi, '' ) + ' ' + name;
  },

  /**
   * убирает класс
   */
  removeClass: function( element, name ) {
    element.className = element.className.replace( name, '' );
  },

  /**
   * грамотно отвешивает события
   */
  bindEvent: function( element, ev, fn ) {
    if( element.addEventListener ) {
      element.addEventListener( ev, fn, false );
    }
    else {
      element.attachEvent( 'on' + ev, fn );
    }
  },

  /**
   * считает высоту окна
   * http://stackoverflow.com/questions/3333329/javascript-get-browser-height
   */
  windowHeight: function() {
    if( typeof( window.innerHeight ) == 'number' ) {
      // не ИЕ
      return window.innerHeight;
    } else if( document.documentElement && document.documentElement.clientHeight ) {
      // ИЕ гте 6 в режиме соответствия стандартам
      return document.documentElement.clientHeight;
    }
  },

  /**
   * прячет элемент
   */
  hide: function( element ) {
    element.style.display = 'none';
  },

  /**
   * проверяет, поддерживается ли СВГ
   * http://stackoverflow.com/questions/654112/how-do-you-detect-support-for-vml-or-svg-in-a-browser
   */
  supportsSvg: function () {
    return document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
  },

  /**
   * опреедляет, за какой элемент нужно дёргать, чтобы прокручивать страницу
   * решение из вопроса про Оперу, хотя проблема с Хромом
   * http://stackoverflow.com/questions/4880743/jquery-animate-scrolltop-on-opera-bug
   */
  elementScroll: function () {
    var html = document.documentElement,
        body = document.body,
        elemScroll;
    if ( html.scrollTop ) {
      return html;
    } else {
      var bodyST = body.scrollTop;
      body.scrollTop = bodyST + 1;
      if ( body.scrollTop == bodyST ) {
        return html;
      } else {
        body.scrollTop = bodyST - 1;
        return body;
      }
    }
  },

  // определяем, когда будет построен ДОМ
  // http://stackoverflow.com/questions/799981/document-ready-equivalent-without-jquery
  onDocumentReady: function(callout) {

    if ( document.addEventListener ) {
      // современные браузеры поддерживают такое событие
      document.addEventListener( "DOMContentLoaded", function(){
        document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
        callout();
      }, false );

    // но если ИЕ
    } else if ( document.attachEvent ) {
      // проверить, что срабатывает до onload,
      // возможно, поздно, но надёжно
      document.attachEvent("onreadystatechange", function(){
        if ( document.readyState === "complete" ) {
          document.detachEvent( "onreadystatechange", arguments.callee );
          callout();
        }
      });

      // если ИЕ и не айфрейм
      // начинаем проверять, пока документ не будет готовы
      if ( document.documentElement.doScroll && window == window.top ) (function(){
        if ( callout ) return;

        try {
          // если ИЕ, то можно использовать ещё и такое Diego Perini
          // http://javascript.nwbox.com/IEContentLoaded/
          document.documentElement.doScroll("left");
        } catch( error ) {
          setTimeout( arguments.callee, 0 );
          return;
        }

        // и запускаем функцию
        callout();
      })();
    }

    // ну и window.onload, это всегда работает
    Troller.bindEvent( window, 'load', callout );

  }

};
