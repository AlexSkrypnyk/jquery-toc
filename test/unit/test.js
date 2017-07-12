/**
 * @file
 * QUnit tests.
 */

(function ($) {
  'use strict';

  QUnit.assert.tocItemPresent = function (text, level, idx, isLink) {
    level = level || 1;
    isLink = isLink === null ? false : isLink;
    idx = idx || 0;

    var $item = null;
    if (!isLink) {
      $item = $('.toc-container').find('li:contains("' + text + '")').eq(idx);
      this.ok($item.length === 1, 'Item text "' + text + '" present');
    }
    else {
      $item = $('.toc-container').find('li a:contains("' + text + '")').eq(idx);
      this.ok($item.length === 1, 'Item link "' + text + '" present');
    }
    if ($item && $item.length > 0) {
      var itemLevel = $item.parents('ul').length;
      this.equal(itemLevel, level, 'Item "' + text + '" level is ' + itemLevel);
    }
  };

  QUnit.assert.tocItemAbsent = function (text, idx, isLink) {
    isLink = isLink === null ? false : isLink;
    idx = idx || 0;

    var $item = null;
    if (!isLink) {
      $item = $('.toc-container').find('li:contains("' + text + '")').eq(idx);
      this.ok($item.length === 0, 'Item text "' + text + '" absent');
    }
    else {
      $item = $('.toc-container').find('li a:contains("' + text + '")').eq(idx);
      this.ok($item.length === 0, 'Item link "' + text + '" absent');
    }
  };

  QUnit.module('Structure');
  QUnit.test('TOC plain text', function (assert) {
    $('.content-container').toc({
      link: false
    });

    assert.tocItemPresent('Heading 1 level 1', 1);
    assert.tocItemPresent('Heading 11 level 2', 2);
    assert.tocItemPresent('Heading 12 level 2', 2);
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 0);
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 1);
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 2);
    assert.tocItemPresent('Heading 2 level 1', 1);
    assert.tocItemPresent('Heading 3 level 1', 1);

    assert.tocItemAbsent('Line 111');
    assert.tocItemAbsent('Line 112');
    assert.tocItemAbsent('Line 113');
    assert.tocItemAbsent('Line 121');
    assert.tocItemAbsent('Line 122');
    assert.tocItemAbsent('Line 123');
    assert.tocItemAbsent('Line 131');
    assert.tocItemAbsent('Line 132');
    assert.tocItemAbsent('Line 211');
    assert.tocItemAbsent('Line 213');
  });

  QUnit.test('TOC links', function (assert) {
    $('.content-container').toc({
      link: true
    });

    assert.tocItemPresent('Heading 1 level 1', 1, 0, true);
    assert.tocItemPresent('Heading 11 level 2', 2, 0, true);
    assert.tocItemPresent('Heading 12 level 2', 2, 0, true);
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 0, true);
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 1, true);
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 2, true);
    assert.tocItemPresent('Heading 2 level 1', 1, 0, true);
    assert.tocItemPresent('Heading 3 level 1', 1, 0, true);

    assert.tocItemAbsent('Line 111');
    assert.tocItemAbsent('Line 112');
    assert.tocItemAbsent('Line 113');
    assert.tocItemAbsent('Line 121');
    assert.tocItemAbsent('Line 122');
    assert.tocItemAbsent('Line 123');
    assert.tocItemAbsent('Line 131');
    assert.tocItemAbsent('Line 132');
    assert.tocItemAbsent('Line 211');
    assert.tocItemAbsent('Line 213');
  });

}(jQuery));
