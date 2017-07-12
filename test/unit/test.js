/**
 * @file
 * QUnit tests.
 */

(function () {
  'use strict';

  QUnit.module('Test of test system');
  QUnit.test('passing test', function (assert) {
    assert.ok(1 === 1, 'Passed!');
  });
}());
