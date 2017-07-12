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
