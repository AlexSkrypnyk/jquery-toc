/**
 * Initialise testing system.
 */

(function () {
  'use strict';
  var reset = QUnit.reset;
  QUnit.reset = function () {
    // Ensure jQuery events and data on the fixture are properly removed.
    jQuery('#qunit-fixture').empty();
    // Let QUnit reset the fixture.
    reset.apply(this, arguments);
  };
})();
