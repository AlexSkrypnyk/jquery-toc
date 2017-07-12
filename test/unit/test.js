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
    assert.ok(1 === 1, 'Passed!');
  });
}(jQuery));
