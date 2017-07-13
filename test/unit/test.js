/**
 * @file
 * QUnit tests.
 */

(function ($) {
  'use strict';

  var ELEMENT_TYPE_TOC = 'toc';
  var ELEMENT_TYPE_CONTENT = 'content';

  // //////////////////////////////////////////////////////////////////////// //
  // ////////////////////////////////// HELPERS ///////////////////////////// //
  // //////////////////////////////////////////////////////////////////////// //

  function getElementByText(text, parentSelectors, type) {
    var $found = $();

    type = type || ELEMENT_TYPE_CONTENT;
    var $set = type === ELEMENT_TYPE_CONTENT ? getContentContainer() : getTocContainer();
    if (parentSelectors) {
      $set = $set.find(parentSelectors);
    }

    // Element may contain the text itself.
    if ($set.is(':contains("' + text + '")')) {
      $found = $found.add($set.filter(function () {
        // Filter out parent of the deepest element containing a text.
        return $(this).find(':contains("' + text + '")').length === 0;
      }));
    }

    $found = $found.add($set.find(':contains("' + text + '")').filter(function () {
      // Filter out parent of the deepest element containing a text.
      return $(this).find(':contains("' + text + '")').length === 0;
    }));

    return $found;
  }

  function setWindowLocationHash(hash) {
    hash = hash || '';
    window.location.hash = hash;
  }

  function getContentContainer() {
    return getFixtureContainer().find('.content-container');
  }

  function getTocContainer() {
    return getFixtureContainer().find('.toc-container');
  }

  function getFixtureContainer() {
    return $('#qunit-fixture');
  }

  // //////////////////////////////////////////////////////////////////////// //
  // ////////////////////////////////// ASSERTIONS ////////////////////////// //
  // //////////////////////////////////////////////////////////////////////// //

  QUnit.assert.tocElementVisible = function (text, count) {
    count = count || 1;
    var $item = getElementByText(text, null, ELEMENT_TYPE_TOC);
    this.ok($item.length > 0, 'Content element with text "' + text + '" is present');
    this.equal($item.filter(':visible').length, count, 'TOC element with text "' + text + '" is visible');
  };

  QUnit.assert.tocElementInvisible = function (text, count) {
    count = count || false;
    var $item = getElementByText(text, null, ELEMENT_TYPE_TOC);
    if (count === false) {
      this.ok($item.filter(':visible').length === 0, 'TOC element with text "' + text + '" is invisible');
    }
    else {
      this.ok($item.length > 0, 'TOC element with text "' + text + '" is present');
      this.equal($item.filter(':not(:visible)').length, count, 'TOC element with text "' + text + '" is invisible');
    }
  };

  QUnit.assert.contentElementVisible = function (text, count) {
    count = count || 1;
    var $item = getElementByText(text);
    this.ok($item.length > 0, 'Content element with text "' + text + '" is present');
    this.equal($item.filter(':visible').length, count, 'Content element with text "' + text + '" is visible');
  };

  QUnit.assert.contentElementInvisible = function (text, count) {
    count = count || false;
    var $item = getElementByText(text);
    if (count === false) {
      this.ok($item.filter(':visible').length === 0, 'Content element with text "' + text + '" is invisible');
    }
    else {
      this.ok($item.length > 0, 'Content element with text "' + text + '" is present');
      this.equal($item.filter(':not(:visible)').length, count, 'Content element with text "' + text + '" is invisible');
    }
  };

  QUnit.assert.urlFragment = function (url) {
    if (url.length > 0 && url.indexOf('#') < 0) {
      throw 'Link does not contain a fragment';
    }
    var fragment = url.substr(url.indexOf('#') + 1);
    this.equal(window.location.hash.substr(1), fragment);
  };

  // //////////////////////////////////////////////////////////////////////// //
  // ////////////////////////////////// TESTS /////////////////////////////// //
  // //////////////////////////////////////////////////////////////////////// //
  QUnit.module('Test API', {
    before: function () {
      this.injectHtml = function (html, className, append) {
        className = className || 'content-container';
        append = append || false;
        var $fixtureContainer = getFixtureContainer();
        var $container = null;
        if (!append) {
          $fixtureContainer.empty();
          $container = $('<div class="' + className + '"></div>').appendTo($fixtureContainer);
        }
        else {
          $container = $fixtureContainer.find('.' + className);
        }
        return $(html).appendTo($container);
      };
    }
  });
  QUnit.test('Test containers', function (assert) {
    assert.equal(getFixtureContainer().length, 1, 'Fixture container is present');

    getFixtureContainer().empty();

    getFixtureContainer().append('<div class="content-container"></div>');
    assert.equal(getContentContainer().length, 1, 'Content container is present');

    getFixtureContainer().append('<div class="toc-container"></div>');
    assert.equal(getTocContainer().length, 1, 'TOC container is present');
  });

  QUnit.test('getElementByText', function (assert) {
    this.injectHtml('<p>unique string</p>');
    assert.equal(getElementByText('unique string').length, 1, 'Single occurrence');

    this.injectHtml('<p>unique string</p><p>unique string</p><p>unique string</p>');
    assert.equal(getElementByText('unique string').length, 3, 'All occurrences');

    this.injectHtml('<p>unique string</p>', 'toc-container');
    assert.equal(getElementByText('unique string').length, 0, 'Uses content container by default');

    this.injectHtml('<p>unique string</p>', 'toc-container');
    assert.equal(getElementByText('unique string', null, ELEMENT_TYPE_TOC).length, 1, 'TOC container');

    this.injectHtml('<div><div><p>unique string</p></div></div><div><div><p>unique string</p></div></div>');
    assert.equal(getElementByText('unique string').length, 2, 'Only deepest items returned');

    this.injectHtml('<div><div><p>unique string <span>something</span></p></div></div><div><div><p>unique string</p></div></div>');
    var $s = getElementByText('unique string');
    assert.equal($s.length, 2, 'Only deepest items returned');
    assert.equal($s.find('span').length, 1, 'Returned deepest items preserve inner HTML');

    this.injectHtml('<p><a>unique string</a></p><p>unique string</p>');
    assert.equal(getElementByText('unique string', 'a').length, 1, 'Single occurrence within parent');
  });

  QUnit.test('Assertions - Content Elements', function (assert) {
    this.injectHtml('<p>unique string</p>');
    assert.contentElementVisible('unique string');
    assert.contentElementVisible('unique string', 1);

    this.injectHtml('<p>unique string</p><p>unique string</p>');
    assert.contentElementVisible('unique string', 2);

    this.injectHtml('<p>unique string</p>').hide();
    assert.contentElementInvisible('unique string');
    assert.contentElementInvisible('unique string', 1);

    this.injectHtml('<p>unique string</p><p>unique string</p>').hide();
    assert.contentElementInvisible('unique string', 2);

    // One hidden, one visible.
    this.injectHtml('<p>unique string</p>').hide();
    this.injectHtml('<p>unique string</p>', 'content-container', true);
    assert.contentElementVisible('unique string', 1);
    assert.contentElementInvisible('unique string', 1);

    // Visible within hidden parent is hidden.
    this.injectHtml('<div class="unique-wrapper"><p>unique string</p></div>').hide();
    this.injectHtml('<p>unique string</p>', 'content-container', true);
    assert.contentElementVisible('unique string', 1);
    assert.contentElementInvisible('unique string', 1);

    // Invisible non-existing.
    this.injectHtml('<p>unique string</p>');
    assert.contentElementInvisible('unique string other');
  });

  QUnit.test('Assertions - TOC Elements', function (assert) {
    this.injectHtml('<p>unique string</p>', 'toc-container');
    assert.tocElementVisible('unique string');
    assert.tocElementVisible('unique string', 1);

    this.injectHtml('<p>unique string</p><p>unique string</p>', 'toc-container');
    assert.tocElementVisible('unique string', 2);

    this.injectHtml('<p>unique string</p>', 'toc-container').hide();
    assert.tocElementInvisible('unique string');
    assert.tocElementInvisible('unique string', 1);

    this.injectHtml('<p>unique string</p><p>unique string</p>', 'toc-container').hide();
    assert.tocElementInvisible('unique string', 2);

    // One hidden, one visible.
    this.injectHtml('<p>unique string</p>', 'toc-container').hide();
    this.injectHtml('<p>unique string</p>', 'toc-container', true);
    assert.tocElementVisible('unique string', 1);
    assert.tocElementInvisible('unique string', 1);

    // Visible within hidden parent is hidden.
    this.injectHtml('<div class="unique-wrapper"><p>unique string</p></div>', 'toc-container').hide();
    this.injectHtml('<p>unique string</p>', 'toc-container', true);
    assert.tocElementVisible('unique string', 1);
    assert.tocElementInvisible('unique string', 1);

    // Invisible non-existing.
    this.injectHtml('<p>unique string</p>', 'toc-container');
    assert.tocElementInvisible('unique string other');
  });

  QUnit.test('Assertions - URL Fragment', function (assert) {
    setWindowLocationHash();
    assert.urlFragment('');

    setWindowLocationHash();
    assert.urlFragment('#');

    setWindowLocationHash('unique-hash');
    assert.urlFragment('#unique-hash');
  });

  QUnit.module('Structure');
  QUnit.test('TOC plain text', function (assert) {
    getContentContainer().toc({
      link: false
    });

    assert.tocElementVisible('Heading 1 level 1');
    assert.tocElementVisible('Heading 11 level 2');
    assert.tocElementVisible('Heading 12 level 2');
    assert.tocElementVisible('Heading 13 level 2 repeating', 3);
    assert.tocElementVisible('Heading 2 level 1');
    assert.tocElementVisible('Heading 3 level 1');

    assert.contentElementVisible('Heading 1 level 1');
    assert.contentElementVisible('Heading 11 level 2');
    assert.contentElementVisible('Heading 12 level 2');
    assert.contentElementVisible('Line 111');
    assert.contentElementVisible('Line 112');
    assert.contentElementVisible('Line 113');
    assert.contentElementVisible('Line 121');
    assert.contentElementVisible('Line 122');
    assert.contentElementVisible('Line 123');
    assert.contentElementVisible('Line 131');
    assert.contentElementVisible('Line 132');
    assert.contentElementVisible('Heading 2 level 1');
    assert.contentElementVisible('Line 211');
    assert.contentElementVisible('Line 213');
    assert.contentElementVisible('Heading 3 level 1');
  });

  QUnit.test('TOC links', function (assert) {
    getContentContainer().toc({
      link: true
    });

    assert.tocElementVisible('Heading 1 level 1');
    assert.tocElementVisible('Heading 11 level 2');
    assert.tocElementVisible('Heading 12 level 2');
    assert.tocElementVisible('Heading 13 level 2 repeating', 3);
    assert.tocElementVisible('Heading 2 level 1');
    assert.tocElementVisible('Heading 3 level 1');

    assert.contentElementVisible('Heading 1 level 1');
    assert.contentElementVisible('Heading 11 level 2');
    assert.contentElementVisible('Heading 12 level 2');
    assert.contentElementVisible('Line 111');
    assert.contentElementVisible('Line 112');
    assert.contentElementVisible('Line 113');
    assert.contentElementVisible('Line 121');
    assert.contentElementVisible('Line 122');
    assert.contentElementVisible('Line 123');
    assert.contentElementVisible('Line 131');
    assert.contentElementVisible('Line 132');
    assert.contentElementVisible('Heading 2 level 1');
    assert.contentElementVisible('Line 211');
    assert.contentElementVisible('Line 213');
    assert.contentElementVisible('Heading 3 level 1');
  });

  QUnit.test('TOC links - top level', function (assert) {
    getContentContainer().toc({
      headings: ['h2'],
      link: true
    });
    assert.tocElementVisible('Heading 1 level 1');
    assert.tocElementInvisible('Heading 11 level 2');
    assert.tocElementInvisible('Heading 12 level 2');
    assert.tocElementInvisible('Heading 13 level 2 repeating');
    assert.tocElementVisible('Heading 2 level 1');
    assert.tocElementVisible('Heading 3 level 1');

    assert.contentElementVisible('Heading 1 level 1');
    assert.contentElementVisible('Heading 11 level 2');
    assert.contentElementVisible('Heading 12 level 2');
    assert.contentElementVisible('Line 111');
    assert.contentElementVisible('Line 112');
    assert.contentElementVisible('Line 113');
    assert.contentElementVisible('Line 121');
    assert.contentElementVisible('Line 122');
    assert.contentElementVisible('Line 123');
    assert.contentElementVisible('Line 131');
    assert.contentElementVisible('Line 132');
    assert.contentElementVisible('Heading 2 level 1');
    assert.contentElementVisible('Line 211');
    assert.contentElementVisible('Line 213');
    assert.contentElementVisible('Heading 3 level 1');
  });

  QUnit.test('TOC links - non-top level', function (assert) {
    getContentContainer().toc({
      headings: ['h3'],
      link: true
    });

    assert.tocElementInvisible('Heading 1 level 1');
    assert.tocElementVisible('Heading 11 level 2');
    assert.tocElementVisible('Heading 12 level 2');
    assert.tocElementVisible('Heading 13 level 2 repeating', 3);
    assert.tocElementInvisible('Heading 2 level 1');
    assert.tocElementInvisible('Heading 3 level 1');

    assert.contentElementVisible('Heading 1 level 1');
    assert.contentElementVisible('Heading 11 level 2');
    assert.contentElementVisible('Heading 12 level 2');
    assert.contentElementVisible('Line 111');
    assert.contentElementVisible('Line 112');
    assert.contentElementVisible('Line 113');
    assert.contentElementVisible('Line 121');
    assert.contentElementVisible('Line 122');
    assert.contentElementVisible('Line 123');
    assert.contentElementVisible('Line 131');
    assert.contentElementVisible('Line 132');
    assert.contentElementVisible('Heading 2 level 1');
    assert.contentElementVisible('Line 211');
    assert.contentElementVisible('Line 213');
    assert.contentElementVisible('Heading 3 level 1');
  });

  QUnit.module('Interaction', {
    beforeEach: function () {
      this.clickTocItem = function (text) {
        var $link = getElementByText(text, null, ELEMENT_TYPE_TOC);
        QUnit.assert.ok($link.length > 0);
        $link.simulate('click');
        return $link;
      };

      setWindowLocationHash();
    }
  });
  QUnit.test('TOC click fragment', function (assert) {
    getContentContainer().toc({
      link: true
    });

    assert.urlFragment(this.clickTocItem('Heading 1 level 1').attr('href'));
    assert.urlFragment(this.clickTocItem('Heading 11 level 2').attr('href'));
    assert.urlFragment(this.clickTocItem('Heading 12 level 2').attr('href'));
    assert.urlFragment(this.clickTocItem('Heading 2 level 1').attr('href'));
    assert.urlFragment(this.clickTocItem('Heading 3 level 1').attr('href'));
  });

  QUnit.test('TOC collapsible', function (assert) {
    var self = this;
    // Since this test deals with collapsing/expanding of the content, which
    // take time, sequential expanding/collapsing must be handled within delayed
    // callbacks, therefore a test timeout should be set.
    //
    // 2 seconds is 4-6 times more than required for transitions within tests.
    assert.timeout(2000);

    getContentContainer().toc({
      link: true,
      levelsCollapsible: [0],
      levelsCollapsed: true
    });

    // Assert that all TOC items are in place.
    assert.tocElementVisible('Heading 1 level 1');
    assert.tocElementVisible('Heading 11 level 2');
    assert.tocElementVisible('Heading 12 level 2');
    assert.tocElementVisible('Heading 13 level 2 repeating', 3);
    assert.tocElementVisible('Heading 2 level 1');
    assert.tocElementVisible('Heading 3 level 1');

    // Assert that start state of elements is as expected.
    assert.contentElementVisible('Heading 1 level 1');
    assert.contentElementVisible('Heading 11 level 2');
    assert.contentElementVisible('Heading 12 level 2');
    assert.contentElementVisible('Line 111');
    assert.contentElementVisible('Line 112');
    assert.contentElementVisible('Line 113');
    assert.contentElementVisible('Line 121');
    assert.contentElementVisible('Line 122');
    assert.contentElementVisible('Line 123');
    assert.contentElementVisible('Line 131');
    assert.contentElementVisible('Line 132');
    assert.contentElementInvisible('Heading 2 level 1');
    assert.contentElementInvisible('Line 211');
    assert.contentElementInvisible('Line 213');
    assert.contentElementInvisible('Heading 3 level 1');

    // Click TOC links and make sure that relevant items are visible/invisible.

    // Assert that clicking on the already opened top-level item from open
    // section preserves the state of that section.
    assert.urlFragment(self.clickTocItem('Heading 1 level 1').attr('href'));
    assert.contentElementVisible('Line 111');
    assert.contentElementVisible('Line 112');
    assert.contentElementVisible('Line 113');
    assert.contentElementVisible('Line 121');
    assert.contentElementVisible('Line 122');
    assert.contentElementVisible('Line 123');
    assert.contentElementVisible('Line 131');
    assert.contentElementVisible('Line 132');
    assert.contentElementInvisible('Heading 2 level 1');
    assert.contentElementInvisible('Line 211');
    assert.contentElementInvisible('Line 213');
    assert.contentElementInvisible('Heading 3 level 1');

    // Assert that clicking on the first of sub-level item from open section
    // preserves the state of that section.
    assert.urlFragment(self.clickTocItem('Heading 11 level 2').attr('href'));
    assert.contentElementVisible('Line 111');
    assert.contentElementVisible('Line 112');
    assert.contentElementVisible('Line 113');
    assert.contentElementVisible('Line 121');
    assert.contentElementVisible('Line 122');
    assert.contentElementVisible('Line 123');
    assert.contentElementVisible('Line 131');
    assert.contentElementVisible('Line 132');
    assert.contentElementInvisible('Heading 2 level 1');
    assert.contentElementInvisible('Line 211');
    assert.contentElementInvisible('Line 213');
    assert.contentElementInvisible('Heading 3 level 1');

    // Assert that clicking on the second of sub-level item from open section
    // preserves the state of that section.
    assert.urlFragment(self.clickTocItem('Heading 12 level 2').attr('href'));
    assert.contentElementVisible('Line 111');
    assert.contentElementVisible('Line 112');
    assert.contentElementVisible('Line 113');
    assert.contentElementVisible('Line 121');
    assert.contentElementVisible('Line 122');
    assert.contentElementVisible('Line 123');
    assert.contentElementVisible('Line 131');
    assert.contentElementVisible('Line 132');
    assert.contentElementInvisible('Heading 2 level 1');
    assert.contentElementInvisible('Line 211');
    assert.contentElementInvisible('Line 213');
    assert.contentElementInvisible('Heading 3 level 1');

    // Assert that clicking on the second top-level item from closed section
    // opens that section and closes current one.
    assert.urlFragment(self.clickTocItem('Heading 2 level 1').attr('href'));
    var done1 = assert.async();
    setTimeout(function () {
      assert.contentElementInvisible('Line 111');
      assert.contentElementInvisible('Line 112');
      assert.contentElementInvisible('Line 113');
      assert.contentElementInvisible('Line 121');
      assert.contentElementInvisible('Line 122');
      assert.contentElementInvisible('Line 123');
      assert.contentElementInvisible('Line 131');
      assert.contentElementInvisible('Line 132');
      assert.contentElementVisible('Heading 2 level 1');
      assert.contentElementVisible('Line 211');
      assert.contentElementVisible('Line 213');
      assert.contentElementInvisible('Heading 3 level 1');
      done1();

      // Assert that clicking on the third top-level item from closed section
      // opens that section and closes current one.
      assert.urlFragment(self.clickTocItem('Heading 3 level 1').attr('href'));
      var done2 = assert.async();
      setTimeout(function () {
        assert.contentElementInvisible('Line 111');
        assert.contentElementInvisible('Line 112');
        assert.contentElementInvisible('Line 113');
        assert.contentElementInvisible('Line 121');
        assert.contentElementInvisible('Line 122');
        assert.contentElementInvisible('Line 123');
        assert.contentElementInvisible('Line 131');
        assert.contentElementInvisible('Line 132');
        assert.contentElementInvisible('Heading 2 level 1');
        assert.contentElementInvisible('Line 211');
        assert.contentElementInvisible('Line 213');
        assert.contentElementVisible('Heading 3 level 1');
        done2();

        // Assert that clicking on the sub-item from closed section opens that
        // section and closes current one.
        assert.urlFragment(self.clickTocItem('Heading 12 level 2').attr('href'));
        var done3 = assert.async();
        setTimeout(function () {
          assert.contentElementVisible('Line 111');
          assert.contentElementVisible('Line 112');
          assert.contentElementVisible('Line 113');
          assert.contentElementVisible('Line 121');
          assert.contentElementVisible('Line 122');
          assert.contentElementVisible('Line 123');
          assert.contentElementVisible('Line 131');
          assert.contentElementVisible('Line 132');
          assert.contentElementInvisible('Heading 2 level 1');
          assert.contentElementInvisible('Line 211');
          assert.contentElementInvisible('Line 213');
          assert.contentElementInvisible('Heading 3 level 1');
          done3();
        }, 100);
      }, 100);
    }, 100);
  });

  QUnit.only('TOC events - Pager', function (assert) {
    var self = this;
    // Since this test deals with collapsing/expanding of the content, which
    // take time, sequential expanding/collapsing must be handled within delayed
    // callbacks, therefore a test timeout should be set.
    //
    // 2 seconds is 4-6 times more than required for transitions within tests.
    assert.timeout(2000);

    getContentContainer().toc({
      link: true,
      levelsCollapsible: [0],
      levelsCollapsed: true
    });

    var $prev = $('<a class="toc-btn-prev">< Prev</a>').on('click', function () {
      getContentContainer().trigger('prev.toc', {
        level: 0
      });
      return false;
    });

    var $next = $('<a class="toc-btn-next">Next ></a>').on('click', function () {
      getContentContainer().trigger('next.toc', {
        level: 0
      });
      return false;
    });

    getContentContainer().append($prev);
    getContentContainer().append($next);

    // Allow hiding and showing pager buttons.
    $(document).on('shown.toc', function (evt, data) {
      if (data.tocElement.parent().hasClass('first')) {
        $('.toc-btn-prev').hide();
      }
      else {
        $('.toc-btn-prev').show();
      }

      if (data.tocElement.parent().hasClass('last')) {
        $('.toc-btn-next').hide();
      }
      else {
        $('.toc-btn-next').show();
      }
    });

    assert.contentElementVisible('< Prev');
    assert.contentElementVisible('Next >');

    // Assert that clicking on the second top-level item from closed section
    // opens that section and closes current one.
    assert.urlFragment(self.clickTocItem('Heading 2 level 1').attr('href'));
    var done1 = assert.async();
    setTimeout(function () {
      assert.contentElementVisible('Line 211');
      assert.contentElementInvisible('Line 111');
      assert.contentElementVisible('< Prev');
      assert.contentElementVisible('Next >');
      done1();

      // Click on the Previous page link - section 1.
      $prev.simulate('click');
      var done2 = assert.async();
      setTimeout(function () {
        assert.contentElementVisible('Line 111');
        assert.contentElementInvisible('Line 211');
        assert.contentElementInvisible('< Prev');
        assert.contentElementVisible('Next >');
        done2();

        // Click on the Next page link - section 2.
        $next.simulate('click');
        var done3 = assert.async();
        setTimeout(function () {
          assert.contentElementInvisible('Line 111');
          assert.contentElementVisible('Line 211');
          assert.contentElementVisible('< Prev');
          assert.contentElementVisible('Next >');
          done3();

          // Click on the Next page link again - Section 3.
          $next.simulate('click');
          var done4 = assert.async();
          setTimeout(function () {
            assert.contentElementInvisible('Line 111');
            assert.contentElementInvisible('Line 211');
            assert.contentElementVisible('< Prev');
            assert.contentElementInvisible('Next >');
            done4();
          }, 100);
        }, 100);
      }, 100);
    }, 100);
  });
}(jQuery));
