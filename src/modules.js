var mithril = require("mithril");

var initModule = function($rootEl, view) {
    return mithril.module($rootEl[0], {
        controller: function() {
            return;
        }, 
        view: function() {
            return view.render();
        }
    });
}

module.exports = initModule;
