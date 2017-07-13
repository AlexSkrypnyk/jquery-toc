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

    this.EVENT_HASHCHANGE = 'hashchange.toc';
    this.EVENT_PREV = 'prev.toc';
    this.EVENT_NEXT = 'next.toc';
    this.EVENT_SECTION_SHOWN = 'shown.toc.section';

    this.tree = [];
    this.anchors = [];

    this.options = $.extend({}, {
      headings: ['h2', 'h3', 'h4'],
      pager: false,
      levelsCollapsible: [],
      levelsCollapsed: false,
      link: true,
      sectionClass: 'toc-section-wrap',
      tocContainerClass: 'toc-container'
    }, options);

    this.$element = $(element);

    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      var self = this;

      // Build tree structure from provided heading.
      $(self.options.headings.join(','), self.$element).each(function () {
        self.addLeaf($(this));
      });

      // Populate anchors for link-based TOC.
      if (self.options.link) {
        self.addAnchors(self.tree);

        // Wrap content if using collapsible sections.
        if (self.options.levelsCollapsible.length > 0) {
          self.wrapAllCollapsed(self.tree);

          // Register activation on hash change.
          $(window).on(self.EVENT_HASHCHANGE, function () {
            var activeLeaf = self.findActiveLeaf(self.getCurrentFragment());
            activeLeaf = activeLeaf ? activeLeaf : self.getDefaultActiveSection();
            if (activeLeaf) {
              self.showSection(activeLeaf);
            }
          });
        }
      }

      // Render TOC into internal structure.
      self.$toc = self.renderToc();

      // Add TOC to DOM.
      self.$element.before(self.$toc);

      // Register prev section event handler.
      self.$element.on(self.EVENT_PREV, function (evt, data) {
        var level = data.level || 0;
        var prevLeaf = self.findPrevLeafByFragment(self.getCurrentFragment(), level);
        if (prevLeaf) {
          self.showSection(prevLeaf);
        }
      });

      // Register next section event handler.
      self.$element.on(self.EVENT_NEXT, function (evt, data) {
        var level = data.level || 0;
        var nextLeaf = self.findNextLeafByFragment(self.getCurrentFragment(), level);
        if (nextLeaf) {
          self.showSection(nextLeaf);
        }
      });

      if (self.options.levelsCollapsed) {
        $(window).trigger(self.EVENT_HASHCHANGE);
      }
    },
    showSection: function (activeLeaf) {
      this.getAllSections().hide();
      var $sections = this.getAllSectionsFromLeaf(activeLeaf);
      $sections.show();

      var $tocLink = this.getTocLinkFromLeaf(activeLeaf);
      this.$element.trigger(this.EVENT_SECTION_SHOWN, {
        contentElement: activeLeaf.$element,
        tocLink: $tocLink
      });
      this.setCurrentFragment(activeLeaf.fragment);
      this.processActiveTocLink($tocLink);
    },
    processActiveTocLink: function ($link) {
      var $parents = $link.parentsUntil(this.getTocContainer()).filter('li');
      this.getTocContainer().find('li').not($parents).removeClass('active');
      $parents.filter(':not(.active)').addClass('active');
    },
    getTocContainer: function () {
      return this.$element.parent().find('.' + this.options.tocContainerClass);
    },
    getTocLinkFromLeaf: function (leaf) {
      return this.getTocContainer().find('[href="#' + leaf.fragment + '"]');
    },
    getAllSections: function () {
      return this.$element.find('.' + this.options.sectionClass);
    },
    getAllSectionsFromLeaf: function (leaf) {
      return leaf.$element.parent('.' + this.options.sectionClass);
    },
    findNextLeafByFragment: function (fragment, level) {
      var list = this.treeToList(this.tree).filter(function (el) {
        return el.level === level;
      });

      for (var i = 0; i < list.length; i++) {
        if (list[i].fragment === fragment && i + 1 < list.length) {
          return list[i + 1];
        }
      }
      return null;
    },
    findPrevLeafByFragment: function (fragment, level) {
      var list = this.treeToList(this.tree).filter(function (el) {
        return el.level === level;
      });

      for (var i = 0; i < list.length; i++) {
        if (list[i].fragment === fragment && i - 1 >= 0) {
          return list[i - 1];
        }
      }
      return null;
    },
    findActiveLeaf: function (fragment) {
      var $activeLeaf = this.treeToList(this.tree).filter(function (leaf) {
        return leaf.fragment === fragment;
      });

      return $activeLeaf.length > 0 ? $activeLeaf.pop() : null;
    },
    getDefaultActiveSection: function () {
      return this.tree.length > 0 ? this.tree[0] : null;
    },
    getCurrentFragment: function () {
      return window.location.hash.substr(1);
    },
    setCurrentFragment: function (fragment) {
      if (fragment.indexOf('#') >= 0) {
        fragment = fragment.substr(fragment.indexOf('#') + 1);
      }
      window.location.hash = fragment;
    },
    treeToList: function (tree) {
      var list = [];

      for (var i = 0; i < tree.length; i++) {
        list.push(tree[i]);
        if (tree[i].children.length > 0) {
          $.merge(list, this.treeToList(tree[i].children));
        }
      }

      return list;
    },
    addLeaf: function ($el, level) {
      level = level || this.getLevel($el);
      var currentLevel = 0;
      var currentTree = this.tree;

      while (currentLevel < level) {
        var last = Math.max(currentTree.length - 1, 0);
        var defaults = [{
          $element: null,
          children: []
        }];
        currentTree[last].children = currentTree[last].children || defaults;
        currentTree = currentTree[last].children;
        currentLevel++;
      }
      currentTree.push({
        $element: $el,
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
      for (var i = 0; i < tree.length; i++) {
        tree[i].fragment = this.generateAnchor(tree[i].$element.text());
        this.renderAnchor(tree[i]);
        if (tree[i].children.length > 0) {
          this.addAnchors(tree[i].children);
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
    wrapAllCollapsed: function (tree) {
      var self = this;

      var list = self.treeToList(tree).filter(function (el) {
        return self.options.levelsCollapsible.indexOf(el.level) > -1;
      });

      for (var i = 0; i < list.length; i++) {
        var $next = i < list.length - 1 ? list[i + 1].$element : null;
        var $set = list[i].$element.nextUntil($next);
        $set = $set.add(list[i].$element);
        self.renderSectionWrap($set, list[i].level);
      }
    },
    renderTree: function (list) {
      var output = '<ul>';
      for (var i = 0; i < list.length; i++) {
        var subtreeOutput = '';
        if (list[i].children.length > 0) {
          subtreeOutput = this.renderTree(list[i].children);
        }
        var leafOptions = {
          isFirst: i === 0,
          isLast: i === list.length - 1,
          suffix: subtreeOutput
        };
        output += this.renderLeaf(list[i], leafOptions);
      }
      output += '</ul>';

      return output;
    },
    renderLeaf: function (leaf, options) {
      var html = leaf.$element.text();
      if (this.options.link) {
        html = '<a href="#' + leaf.fragment + '">' + html + '</a>';
      }

      var classes = [];
      if (options.isFirst) {
        classes.push('first');
      }
      if (options.isLast) {
        classes.push('last');
      }

      return '<li class="' + classes.join(' ') + '">' + html + options.suffix + '</li>';
    },
    renderAnchor: function (leaf) {
      leaf.$element.prepend('<a id="' + leaf.fragment + '"></a>');
    },
    renderSectionWrap: function ($set, level) {
      $set.wrapAll('<div class="' + this.options.sectionClass + ' level-' + level + '"></div>');
    },
    renderToc: function () {
      var output = '<div class="' + this.options.tocContainerClass + '">';
      output += this.renderTree(this.tree);
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
