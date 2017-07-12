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
      levelsCollapsible: false,
      levelsCollapsed: false,
      link: true
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

      if (this.options.link) {
        this.addAnchors(this.tree);
      }

      this.$element.before(this.renderList(this.tree));
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
      currentTree.push({element: $el, children: []});
    },
    getLevel: function ($el) {
      for (var level in this.options.headings) {
        if ($el.is(this.options.headings[level])) {
          return level;
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
    renderItem: function (item) {
      var html = item.element.text();
      if (this.options.link) {
        html = '<a href="#' + item.anchor + '">' + html + '</a>';
      }
      return '<li>' + html + '</li>';
    },
    renderList: function (list) {
      var output = '<ul>';
      for (var i in list) {
        if (list.hasOwnProperty(i)) {
          output += this.renderItem(list[i]);
          if (list[i].children.length > 0) {
            output += this.renderList(list[i].children);
          }
        }
      }
      output += '</ul>';

      return output;
    },
    renderAnchor: function (item) {
      item.element.prepend('<a id="' + item.anchor + '"></a>');
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
