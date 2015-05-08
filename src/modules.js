var mithril = require("mithril");

var initModule = function(view) {
    return mithril.module(view.$el[0], {
        controller: function() {
            return;
        }, 
        view: function() {
            return view.render();
        }
    });
}

module.exports = initModule;
