/**
 * @file
 * QUnit tests.
 */

(function ($) {
  'use strict';

  // //////////////////////////////////////////////////////////////////////// //
  // ////////////////////////////////// HELPERS ///////////////////////////// //
  // //////////////////////////////////////////////////////////////////////// //

  function findItemsByText(text, isLink) {
    var $item = null;

    isLink = isLink === null ? false : isLink;
    if (!isLink) {
      $item = $('.toc-container').find('li:contains("' + text + '")');
    }
    else {
      $item = $('.toc-container').find('li a:contains("' + text + '")');
    }

    return $item;
  }

  function resetLocationHash() {
    window.location.hash = '';
  }

  function clickLink(text) {
    var $link = findItemsByText(text, true);
    QUnit.assert.ok($link.length > 0);
    $link.simulate('click');
    return $link;
  }

  // //////////////////////////////////////////////////////////////////////// //
  // ////////////////////////////////// ASSERTIONS ////////////////////////// //
  // //////////////////////////////////////////////////////////////////////// //

  QUnit.assert.tocItemPresent = function (text, level, idx, isLink) {
    level = level || 1;
    idx = idx || 0;

    var $items = findItemsByText(text, isLink);
    $items = $items.eq(idx);
    this.ok($items.length === 1, 'Item "' + text + '" is present');

    if ($items && $items.length > 0) {
      var itemLevel = $items.parents('ul').length;
      this.equal(itemLevel, level, 'Item "' + text + '" level is ' + itemLevel);
    }
  };

  QUnit.assert.tocItemAbsent = function (text, idx, isLink) {
    isLink = isLink === null ? false : isLink;
    idx = idx || 0;

    var $items = findItemsByText(text, isLink);
    $items = $items.eq(idx);
    this.ok($items.length === 0, 'Item "' + text + '" is absent');
  };

  QUnit.assert.tocAnchorPresent = function (id) {
    id = id.indexOf('#') === 0 ? id.substr(1) : id;
    QUnit.assert.equal($('#' + id).length, 1, 'Anchor with id "' + id + '" is present');
  };

  QUnit.assert.tocAnchorAbsent = function (id) {
    id = id.indexOf('#') === 0 ? id.substr(1) : id;
    QUnit.assert.equal($('#' + id).length, 0, 'Anchor with id "' + id + '" is absent');
  };

  // //////////////////////////////////////////////////////////////////////// //
  // ////////////////////////////////// TESTS /////////////////////////////// //
  // //////////////////////////////////////////////////////////////////////// //

  QUnit.module('Structure');
  QUnit.test('TOC plain text', function (assert) {
    $('.content-container').toc({
      link: false
    });

    assert.tocItemPresent('Heading 1 level 1', 1);
    assert.tocAnchorAbsent('heading-1-level-1');
    assert.tocItemPresent('Heading 11 level 2', 2);
    assert.tocAnchorAbsent('heading-11-level-2');
    assert.tocItemPresent('Heading 12 level 2', 2);
    assert.tocAnchorAbsent('heading-12-level-2');
    assert.tocAnchorAbsent('heading-12-level-2');
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 0);
    assert.tocAnchorAbsent('heading-13-level-2-repeating');
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 1);
    assert.tocAnchorAbsent('heading-13-level-2-repeating-2');
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 2);
    assert.tocAnchorAbsent('heading-13-level-2-repeating-3');
    assert.tocItemPresent('Heading 2 level 1', 1);
    assert.tocAnchorAbsent('heading-2-level-1');
    assert.tocItemPresent('Heading 3 level 1', 1);
    assert.tocAnchorAbsent('heading-3-level-1');

    assert.tocItemAbsent('Line 111');
    assert.tocAnchorAbsent('line-111');
    assert.tocItemAbsent('Line 112');
    assert.tocAnchorAbsent('line-112');
    assert.tocItemAbsent('Line 113');
    assert.tocAnchorAbsent('line-113');
    assert.tocItemAbsent('Line 121');
    assert.tocAnchorAbsent('line-121');
    assert.tocItemAbsent('Line 122');
    assert.tocAnchorAbsent('line-122');
    assert.tocItemAbsent('Line 123');
    assert.tocAnchorAbsent('line-123');
    assert.tocItemAbsent('Line 131');
    assert.tocAnchorAbsent('line-131');
    assert.tocItemAbsent('Line 132');
    assert.tocAnchorAbsent('line-132');
    assert.tocItemAbsent('Line 211');
    assert.tocAnchorAbsent('line-211');
    assert.tocItemAbsent('Line 213');
    assert.tocAnchorAbsent('line-213');
  });

  QUnit.test('TOC links', function (assert) {
    $('.content-container').toc({
      link: true
    });

    assert.tocItemPresent('Heading 1 level 1', 1, 0, true);
    assert.tocAnchorPresent('heading-1-level-1');
    assert.tocItemPresent('Heading 11 level 2', 2, 0, true);
    assert.tocAnchorPresent('heading-11-level-2');
    assert.tocItemPresent('Heading 12 level 2', 2, 0, true);
    assert.tocAnchorPresent('heading-12-level-2');
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 0, true);
    assert.tocAnchorPresent('heading-13-level-2-repeating');
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 1, true);
    assert.tocAnchorPresent('heading-13-level-2-repeating-2');
    assert.tocItemPresent('Heading 13 level 2 repeating', 2, 2, true);
    assert.tocAnchorPresent('heading-13-level-2-repeating-3');
    assert.tocItemPresent('Heading 2 level 1', 1, 0, true);
    assert.tocAnchorPresent('heading-2-level-1');
    assert.tocItemPresent('Heading 3 level 1', 1, 0, true);
    assert.tocAnchorPresent('heading-2-level-1');

    assert.tocItemAbsent('Line 111');
    assert.tocAnchorAbsent('line-111');
    assert.tocItemAbsent('Line 112');
    assert.tocAnchorAbsent('line-112');
    assert.tocItemAbsent('Line 113');
    assert.tocAnchorAbsent('line-113');
    assert.tocItemAbsent('Line 121');
    assert.tocAnchorAbsent('line-121');
    assert.tocItemAbsent('Line 122');
    assert.tocAnchorAbsent('line-122');
    assert.tocItemAbsent('Line 123');
    assert.tocAnchorAbsent('line-123');
    assert.tocItemAbsent('Line 131');
    assert.tocAnchorAbsent('line-131');
    assert.tocItemAbsent('Line 132');
    assert.tocAnchorAbsent('line-132');
    assert.tocItemAbsent('Line 211');
    assert.tocAnchorAbsent('line-211');
    assert.tocItemAbsent('Line 213');
    assert.tocAnchorAbsent('line-213');
  });

  QUnit.test('TOC links - top level', function (assert) {
    $('.content-container').toc({
      headings: ['h2'],
      link: true
    });

    assert.tocItemPresent('Heading 1 level 1', 1, 0, true);
    assert.tocItemPresent('Heading 2 level 1', 1, 0, true);
    assert.tocItemPresent('Heading 3 level 1', 1, 0, true);

    assert.tocItemAbsent('Heading 11 level 2');
    assert.tocItemAbsent('Heading 12 level 2');
    assert.tocItemAbsent('Heading 13 level 2 repeating');
    assert.tocItemAbsent('Heading 13 level 2 repeating');
    assert.tocItemAbsent('Heading 13 level 2 repeating');
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

  QUnit.test('TOC links - non-top level', function (assert) {
    $('.content-container').toc({
      headings: ['h3'],
      link: true
    });

    assert.tocItemPresent('Heading 11 level 2', 1, 0, true);
    assert.tocItemPresent('Heading 12 level 2', 1, 0, true);
    assert.tocItemPresent('Heading 13 level 2 repeating', 1, 0, true);
    assert.tocItemPresent('Heading 13 level 2 repeating', 1, 1, true);
    assert.tocItemPresent('Heading 13 level 2 repeating', 1, 2, true);

    assert.tocItemAbsent('Heading 1 level 1');
    assert.tocItemAbsent('Heading 2 level 1');
    assert.tocItemAbsent('Heading 3 level 1');
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

  QUnit.module('Interaction', {
    beforeEach: function () {
      resetLocationHash();
    }
  });
  QUnit.test('TOC click fragment', function (assert) {
    $('.content-container').toc({
      link: true
    });

    var $link;

    $link = clickLink('Heading 1 level 1');
    assert.equal(window.location.hash, $link.attr('href'));
    $link = clickLink('Heading 11 level 2');
    assert.equal(window.location.hash, $link.attr('href'));
    $link = clickLink('Heading 12 level 2');
    assert.equal(window.location.hash, $link.attr('href'));
    $link = clickLink('Heading 2 level 1');
    assert.equal(window.location.hash, $link.attr('href'));
    $link = clickLink('Heading 3 level 1');
    assert.equal(window.location.hash, $link.attr('href'));
  });

}(jQuery));
