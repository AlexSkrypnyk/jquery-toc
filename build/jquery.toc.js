/**
 * Table of Contents jQuery plugin
 * jQuery plugin to generate Table of Contents from provided content.
 *
 * Version: 0.1.0
 * Author: Alex Skrypnyk (alex.designworks@gmail.com)
 * License: GPL-2.0
 */

(function ($) {
  'use strict';

  var pluginName = 'toc';
  var version = '0.1.0';

  $.fn[pluginName] = function (obj, api) {
    var settings;

    // Default API usage to false.
    api = api || false;

    // Normalise array of rows.
    obj = $.isArray(obj) ? {rows: obj} : obj;

    // Merge with defaults.
    settings = $.extend({}, {}, obj);

    settings.version = version;

    /**
     * Process settings.
     */
    this.processSettings = function (s) {
      this.settings = s;
    };

    /**
     * Create TOC.
     */
    this.createToc = function () {

    };

    // Process settings.
    this.processSettings(settings);

    if (api) {
      return this;
    }

    return this.settings.rows.length === 0 ? this.renderEmpty() : this.createToc();
  };
}(jQuery));
