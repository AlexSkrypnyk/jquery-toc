/**
 * @@title
 * @@description
 *
 * Version: @@version
 * Author: @@author_name (@@author_email)
 * License: @@license
 */

(function ($) {
  'use strict';

  var pluginName = 'toc';
  var version = '@@version';

  function Plugin(element, options) {
    this.pluginName = pluginName;
    this.version = version;

    this.tree = [];
    this.anchors = [];

    this.options = $.extend({}, {
      headings: ['h2', 'h3', 'h4'],
      pager: false,
      contentCollapsible: false,
      contentCollapse: false,
      levelsCollapsible: [],
      levelsCollapsed: false,
      link: true,
      sectionClass: 'toc-section-wrap',
      trackClicked: false
    }, options);

    this.$element = $(element);

    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      var self = this;
      $(self.options.headings.join(','), self.$element).each(function () {
        var $this = $(this);
        var level = self.getLevel($this);
        self.addItem($this, level);
      });

      if (self.options.link) {
        self.addAnchors(self.tree);

        if (self.options.levelsCollapsible.length > 0) {
          self.wrapAllCollapsed(self.tree);
          $(window).on('hashchange', function () {
            var activeItem = self.findActiveItem(window.location.hash.substr(1));
            activeItem = activeItem ? activeItem : self.getDefaultActiveSection();
            if (activeItem) {
              self.toggleSectionsVisibility(activeItem);
            }
          });
        }
      }

      self.$toc = self.renderToc(self.tree);

      if (self.options.trackClicked) {
        self.$toc.find('a').on('click.toc', function () {
          self.trackClickedLink($(this).attr('href'));
        });
      }

      self.$element.before(self.$toc);

      self.$element.on('next.toc', function (evt, data) {
        var level = data.level || 0;
        var nextItem = self.findNextItem(window.location.hash.substr(1), level);
        if (nextItem) {
          self.toggleSectionsVisibility(nextItem);
        }
      });

      self.$element.on('prev.toc', function (evt, data) {
        var level = data.level || 0;
        var prevItem = self.findPrevItem(window.location.hash.substr(1), level);
        if (prevItem) {
          self.toggleSectionsVisibility(prevItem);
        }
      });

      if (self.options.levelsCollapsed) {
        $(window).trigger('hashchange');
      }
    },
    trackClickedLink: function () {

    },
    toggleSectionsVisibility: function (activeItem) {
      this.getAllSections().hide();
      var $sections = this.getAllSectionsFromItem(activeItem);
      $sections.show();

      var $tocElement = $('.toc-container').find('a[href="#' + activeItem.anchor + '"]');
      this.$element.trigger('shown.toc', {
        element: activeItem.element,
        tocElement: $tocElement
      });
      window.location.hash = activeItem.anchor;
    },
    getAllSections: function () {
      return this.$element.find('.' + this.options.sectionClass);
    },
    getAllSectionsFromItem: function (item) {
      return item.element.parent('.' + this.options.sectionClass);
    },
    findNextItem: function (fragment, level) {
      var list = this.toList(this.tree).filter(function (el) {
        return el.level === level;
      });

      for (var i = 0; i < list.length; i++) {
        if (list[i].anchor === fragment && i + 1 < list.length) {
          return list[i + 1];
        }
      }
      return null;
    },
    findPrevItem: function (fragment, level) {
      var list = this.toList(this.tree).filter(function (el) {
        return el.level === level;
      });

      for (var i = 0; i < list.length; i++) {
        if (list[i].anchor === fragment && i - 1 >= 0) {
          return list[i - 1];
        }
      }
      return null;
    },
    findActiveItem: function (fragment) {
      var active = this.toList(this.tree).filter(function (el) {
        return el.anchor === fragment;
      });

      return active.length > 0 ? active.pop() : null;
    },
    getDefaultActiveSection: function () {
      return this.tree.length > 0 ? this.tree[0] : null;
    },
    wrapAllCollapsed: function (tree) {
      var self = this;

      var list = this.toList(tree);

      list = list.filter(function (el) {
        return self.options.levelsCollapsible.indexOf(el.level) > -1;
      });

      for (var i = 0; i < list.length; i++) {
        var next = i < list.length - 1 ? list[i + 1].element : null;
        var $set = list[i].element.nextUntil(next);
        $set = $set.add(list[i].element);
        self.renderSectionWrap($set, list[i].level);
      }
    },
    toList: function (tree) {
      var list = [];

      for (var i in tree) {
        if (tree.hasOwnProperty(i)) {
          list.push(tree[i]);
          if (tree[i].children.length > 0) {
            $.merge(list, this.toList(tree[i].children));
          }
        }
      }

      return list;
    },
    addItem: function ($el, level) {
      var currentLevel = 0;
      var currentTree = this.tree;

      while (currentLevel < level) {
        var last = currentTree.length - 1;
        var defaults = [{
          element: null,
          children: []
        }];
        currentTree[last].children = currentTree[last].children || defaults;
        currentTree = currentTree[last].children;
        currentLevel++;
      }
      currentTree.push({
        element: $el,
        level: level,
        children: []
      });
    },
    getLevel: function ($el) {
      for (var level in this.options.headings) {
        if ($el.is(this.options.headings[level])) {
          return parseInt(level);
        }
      }
      throw 'Unable to get level for provided element';
    },
    addAnchors: function (tree) {
      for (var i in tree) {
        if (tree.hasOwnProperty(i)) {
          tree[i].anchor = this.generateAnchor(tree[i].element.text());
          this.renderAnchor(tree[i]);
          if (tree[i].children.length > 0) {
            this.addAnchors(tree[i].children);
          }
        }
      }
    },
    generateAnchor: function (text) {
      var anchor = text.toLowerCase().replace(/ /g, '-');
      var uniqueAnchor = anchor;
      var delta = 2;
      while (this.anchors.indexOf(uniqueAnchor) > -1) {
        uniqueAnchor = anchor + '-' + delta;
        delta++;
      }
      this.anchors.push(uniqueAnchor);
      return uniqueAnchor;
    },
    renderItem: function (item, options) {
      var html = item.element.text();
      if (this.options.link) {
        html = '<a href="#' + item.anchor + '">' + html + '</a>';
      }

      var classes = [];
      if (options.isFirst) {
        classes.push('first');
      }
      if (options.isLast) {
        classes.push('last');
      }

      return '<li class="' + classes.join(' ') + '">' + html + '</li>';
    },
    renderList: function (list) {
      var output = '<ul>';
      for (var i = 0; i < list.length; i++) {
        var itemOptions = {
          isFirst: i === 0,
          isLast: i === list.length - 1
        };
        output += this.renderItem(list[i], itemOptions);
        if (list[i].children.length > 0) {
          output += this.renderList(list[i].children);
        }
      }
      output += '</ul>';

      return output;
    },
    renderAnchor: function (item) {
      item.element.prepend('<a id="' + item.anchor + '"></a>');
    },
    renderSectionWrap: function ($set, level) {
      $set.wrapAll('<div class="' + this.options.sectionClass + ' level-' + level + '"></div>');
    },
    renderToc: function (tree) {
      var output = '<div class="toc-container">';
      output += this.renderList(tree);
      output += '</div>';
      return output;
    }
  });

  // Create plugin in jQuery namespace.
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' +
          pluginName, new Plugin(this, options));
      }
    });
  };
}(jQuery));
