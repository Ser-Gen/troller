# To top scRoller

Часто возникает ситуация, когда создаваемые нами страницы длинны, их содержимое интересно, но различные меню для перехода, информационные панели находятся только _наверху страницы_. При этом, хотелось бы иметь возможность _вернуться_ к просматриваемому содержимому.

Подключив к своим страницам данный компонент, вы получите панель для быстрой прокрутки _наверх и обратно_.

Стрелка (&darr;) выбрана основным индикатором панели, так как занимает мало экранного места и информативна.

## Демонстрация

Вы можете попробовать компонент в работе, добавив ссылку [отсюда](http://ser-gen.github.com/source/troller/bookmarklet-host.html) в закладки и нажав на неё, находясь на любой длинной странице.

## Стили панели

Изначально панель оснащена следующим набором стилей:

    .toTopScroller {
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      color: #bbb;
      display: none;
      font-family: tahoma, arial, sans-serif;
      height: 100%;
      left: 0;
      padding: 10px;
      position: fixed;
      text-decoration: none;
      top: 0;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      z-index: 9999;
    }
    .toTopScroller:hover {
      background-color: rgb(235, 245, 255);
      background-color: rgba(70, 90, 110, .1);
      color: #999;
    }

Вы всегда можете переопределить их при помощи `!important`.

## Вызов

`toTopScroller()`

## Поддержка

Компонент проверен в обозревателях марок ИЕ (7&ndash;9) и в современных: Файрфокс, Хром, Опера, ИЕ 10.

Для работы требует jQuery.
