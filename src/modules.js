var mithril = require("mithril");

var initModule = function(view, controllerCb) {
    return mithril.mount(view.$el[0], {
        controller: function() {
            if (controllerCb) controllerCb();
        }, 
        view: function() {
            return view.render();
        }
    });
}

module.exports = initModule;
