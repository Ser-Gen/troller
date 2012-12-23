(function(window, document, undefined){

  function loadScript(url, callback) {
    // добавляем в голову элемент со скриптом
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = url;

    // затем навешиваем обработчик на загрузку
    script.onreadystatechange = callback;
    script.onload = callback;

    // и начинаем её
    head.appendChild(script);
  }

  function jQReadyCallback () {

    if ($('.toTopScroller').length < 1) {
      
      // так можно было бы добавлять элементы в нормальных браузерах, но нет
      // var obj = $('<span/>').attr({'class' : 'toTopScroller'}).appendTo('body'),
      //     style = $('<style/>').html('.toTopScroller{-moz-box-sizing:border-box;-moz-user-select:none;-ms-user-select:none;-webkit-box-sizing:border-box;-webkit-user-select:none;box-sizing:border-box;color:#bbb;display:none;font-family:tahoma,arial,sans-serif;height:100%;left:0;padding:10px;position:fixed;text-decoration:none;top:0;user-select:none;z-index:9999;}.toTopScroller:hover{background-color:rgba(70,90,110,.1);color:#999;}').appendTo('html');

      var style = document.createElement('style'),
          css = '.toTopScroller{-moz-box-sizing:border-box;-moz-user-select:none;-ms-user-select:none;-webkit-box-sizing:border-box;-webkit-user-select:none;box-sizing:border-box;color:#bbb;display:none;font-family:tahoma,arial,sans-serif;height:100%;left:0;padding:10px;position:fixed;text-decoration:none;top:0;user-select:none;z-index:9999;}.toTopScroller:hover{background-color:rgb(235,245,255);background-color:rgba(70,90,110,.1);color:#999;}';
      style.type = 'text/css';

      // http://stackoverflow.com/questions/5227088/creating-style-node-adding-innerhtml-add-to-dom-and-ie-headaches
      if (style.styleSheet) { // IE
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }

      document.getElementsByTagName('head')[0].appendChild(style);

      // http://stackoverflow.com/questions/826782/css-rule-to-disable-text-selection-highlighting
      // http://stackoverflow.com/questions/7590537/ie-ignores-styles-for-dynamically-loaded-content
      $('body').append($('<span/>').attr({'id' : 'toTopScroller', 'class' : 'toTopScroller', 'unselectable' : 'on'}));
      var obj = $('#toTopScroller');

      var isChrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()),
          elemScroll;
      // хром прокручивает не тот элемент
      isChrome ? elemScroll = $('body') : elemScroll = $('html, body')

      // возьмём немного другую функцию анимации
      // http://stackoverflow.com/questions/5207301/looking-for-jquery-easing-functions-without-using-a-plugin
      $.extend($.easing, {
        easeOutQuart: function (x, t, b, c, d) {
          return -c * ((t=t/d-1)*t*t*t - 1) + b;
        }
      });

      var previousPos = 0,
          currentPos = 0,
          shift = 50,
          isScrolling = false,
          isShowing = false,
          wH = $(window).height();

      function scroller () {
        var firstPos = 0,
            lastPos = 0;
        isScrolling = true;

        if (previousPos) {
          // если есть запомненное предыдущее положение — будем крутить до него
          lastPos = previousPos;
          previousPos = 0;
        } else {
          // если нет — запоминаем текущее положение
          var dH = $(document).height();
          previousPos = currentPos;
          if ((dH - lastPos) < wH) { lastPos = dH - wH; }
        }
        // если получается, что крутить надо до текущего положения — крутим наверх
        if (lastPos === currentPos) { lastPos = 0; }
        // рассчитываем первое положение, учитывая сдвиг
        lastPos < currentPos ?
          firstPos = lastPos + shift
          : firstPos = lastPos - shift
        // крутим
        elemScroll.scrollTop(firstPos).animate({ scrollTop: lastPos}, 40, 'easeOutQuart', function () {
          setTimeout(function(){
            isScrolling = false;
          },25);
        });
      }

      function showOrHide () {
        currentPos = elemScroll.scrollTop();
        if (!isScrolling) { previousPos = 0; }
        currentPos <= shift ? obj.html('&darr;') : obj.html('&uarr;')
        if ((currentPos >= wH/4) && !isShowing) {
          obj.stop(true, true).fadeIn('75');
          isShowing = true;
        }
        if ((currentPos < wH/4) && isShowing && !previousPos) {
          obj.stop(true, true).fadeOut('75');
          isShowing = false;
        }
      }

      obj.click(function () {
        scroller();
      });

      $(window).scroll(function () {
        showOrHide();
      });
      $(window).resize(function () {
        wH = $(window).height();
      });

      showOrHide();

    };

  }

  // есть ли джКуери?
  if (typeof(jQuery) == 'undefined') {
    // если нет — грузим
    loadScript("http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js", jQReadyCallback);
  } else {
    // есть — пилим троллер
    jQReadyCallback();
  }

})(this, document);
