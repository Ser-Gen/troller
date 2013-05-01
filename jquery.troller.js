/*!
 * troller 1.1
 * https://github.com/Ser-Gen/troller
 * Компонент для прокрутки к верху документа и обратно
 * Требуется jQuery
 * MIT licensed
 *
 * Создан Сергеем Васильевым (@Ser_Gen)
 */
var Troller = {

  /**
   * создаёт элемент и всё ему нужное
   */
  create: function( options ) {

    // есть ли джКуери?
    if ( typeof( jQuery ) == 'undefined' ) {
      return 'No jQuery -- no troller';
    }

    // троллер должен остаться только один
    if ( $( '#troller' ).length > 1 ) {
      return 'Troller is already working';
    }

    // создаём опции, если нет, и настраиваем их
    if ( options === undefined ) {
      options = {};
    }

    var uarr, darr;

    // поддерживается ли SVG?
    if ( document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" ) ) {
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

    // основные переменные страницы
    var doc = document,
        docObj = $( doc ),
        win = window,
        winObj = $( win ),
        html, head, body,

        elemScroll, obj, objElem;

    // вспомогательные переменные
    var previousPos = 0,
        currentPos = 0,
        shift = 50,
        isScrolling = false,
        isShowing = false,
        wH,
        trollerIsDown = true;

    $.extend( config, options );
    $( document ).ready( documentReady );

    function documentReady() {
      html = $('html');
      head = doc.getElementsByTagName('head')[0];
      body = $( 'body' );

      elemScroll = elementScroll();

      panelPreparing();
      bindEvents();
      showOrHide();
    }

    //определяет, за какой элемент нужно дёргать, чтобы прокручивать страницу
    // решение из вопроса про Оперу, хотя проблема с Хромом
    // http://stackoverflow.com/questions/4880743/jquery-animate-scrolltop-on-opera-bug
    function elementScroll () {
      if ( html.scrollTop() ) {
        return html;
      } else {
        var bodyST = body.scrollTop();
        body.scrollTop(bodyST + 1);
        if ( body.scrollTop() == bodyST ) {
          return html;
        } else {
          body.scrollTop(bodyST - 1);
          return body;
        }
      }
    }

    // возьмём немного другую функцию анимации
    // http://stackoverflow.com/questions/5207301/looking-for-jquery-easing-functions-without-using-a-plugin
    $.extend( $.easing, {
      easeOutQuart: function ( x, t, b, c, d ) {
        return -c * ( ( t=t/d-1 )*t*t*t - 1 ) + b;
      }
    });

    // готовим панель
    function panelPreparing () {
      var style = doc.createElement( 'style' ),
          css = '.troller{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;color:#bbb;display:none;font-family:tahoma,arial,helvetica,sans-serif;height:100%;left:0;padding:12px 10px;position:fixed;text-decoration:none;top:0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:9999;}.troller:hover{background-color:rgb(235,245,255);background-color:rgba(70,90,110,.1);color:#999;}.trollerArrow{fill:#bbb}.trollerArrow:hover{fill:#999}';

      style.type = 'text/css';

      // http://stackoverflow.com/questions/5227088/creating-style-node-adding-innerhtml-add-to-dom-and-ie-headaches
      if ( style.styleSheet ) { // IE
        style.styleSheet.cssText = css;
      } else {
        style.appendChild( doc.createTextNode( css ) );
      }

      head.appendChild( style );

      // http://stackoverflow.com/questions/826782/css-rule-to-disable-text-selection-highlighting
      // http://stackoverflow.com/questions/7590537/ie-ignores-styles-for-dynamically-loaded-content
      body.append( $ ('<span/>' ).attr( {'id' : 'troller', 'class' : 'troller', 'unselectable' : 'on'} ) );
      obj = $( '#troller' );
      objElem = doc.getElementById('troller');

      // пока не прокрутится чуть сильнее, не отобразится панель
      // костылина, но что уж поделаешь
      // пора на блинк, блин
      if ( /opera/.test( navigator.userAgent.toLowerCase() ) ) {
        var crutch = elemScroll.scrollTop() - 1;
        if ( crutch >= 0 ) {
          elemScroll.scrollTop(crutch);
          elemScroll.scrollTop(crutch + 1);
        }
      }
    }

    // логика скроллера троллера
    function scroller () {
      var firstPos = 0,
          lastPos = 0;
          isScrolling = true;

      if ( previousPos ) {
        // если есть запомненное предыдущее положение — будем крутить до него
        lastPos = previousPos;
        previousPos = 0;
      } else {
        // если нет — запоминаем текущее положение
        var dH = docObj.height();
        previousPos = currentPos;
        if ( ( dH - lastPos ) < wH ) { lastPos = dH - wH; }
      }
      // если получается, что крутить надо до текущего положения — крутим наверх
      if ( lastPos === currentPos ) { lastPos = 0; }
      // рассчитываем первое положение, учитывая сдвиг
      lastPos < currentPos ?
        firstPos = lastPos + shift
        : firstPos = lastPos - shift
      // крутим
      elemScroll.scrollTop( firstPos ).stop(true, true).animate( { scrollTop: lastPos}, 100, 'easeOutQuart', function () {
        isScrolling = false;
      });
    }

    // логика отображения троллера
    function showOrHide () {
      wH = winObj.height();
      currentPos = elemScroll.scrollTop();

      if ( !isScrolling ) { previousPos = 0; }

      if ( currentPos >= wH/4 ) {

        if ( trollerIsDown ) {
          obj.html( config.uarr ).removeClass( 'trollerIsDown' ).addClass( 'trollerIsUp' );
          trollerIsDown = false;
        }

        if ( !isShowing ) {
          obj.stop( true, true ).fadeIn( '75' );
          isShowing = true;
        }
      }

      if ( currentPos < wH/4 ) {

        if ( !trollerIsDown ) {
          obj.html( config.darr ).removeClass( 'trollerIsUp' ).addClass( 'trollerIsDown' );
          trollerIsDown = true;
        }

        if ( isShowing && !previousPos ) {
          obj.stop( true, true ).hide();
          isShowing = false;
        }
      }
    }

    // назначаем события
    function bindEvents() {
      // http://blogs.msdn.com/b/ie/archive/2011/09/20/touch-input-for-ie10-and-metro-style-apps.aspx
      // http://msdn.microsoft.com/en-US/library/ie/hh673557.aspx
      if ( win.navigator.msPointerEnabled ) {
        objElem.addEventListener( 'MSPointerDown', scroller, false );
      } else if ( 'ontouchstart' in win ) {
        objElem.addEventListener( 'touchstart', scroller, false );
      } else {
        obj.click(scroller);
      }

      winObj.scroll(function () {
        showOrHide();
      });
      winObj.resize(function () {
        wH = winObj.height();
        showOrHide();
      });
    }

    /// API: ///////////////////////////////////
    return {
      scroller : scroller
    };

  }

};
