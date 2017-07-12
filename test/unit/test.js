/**
 * @file
 * QUnit tests.
 */

(function ($) {
  'use strict';

  QUnit.module('Structure');
  QUnit.test('passing test', function (assert) {
    $('.content-container').toc({
      levelsCollapsed: true,
      levelsCollapsible: [0]
    });


    var $toc = $('.content-container');

    $toc.after('<a class="toc-next" href="#">Next ></a>');
    $toc.after('<a class="toc-prev" href="#">< Prev</a>');

    $('.toc-prev').on('click', function () {
      $toc.trigger('prev.toc', {
        level: 0
      });
      return false;
    });

    $('.toc-next').on('click', function () {
      $toc.trigger('next.toc', {
        level: 0
      });
      return false;
    });


    $(document).on('shown.toc', function ($evt, data) {
      if (data.tocElement.parent().hasClass('first')) {
        $('.toc-prev').hide();
      }
      else {
        $('.toc-prev').show();
      }

      if (data.tocElement.parent().hasClass('last')) {
        $('.toc-next').hide();
      }
      else {
        $('.toc-next').show();
      }
    });

    assert.ok(1 === 1, 'Passed!');
  });
}(jQuery));
