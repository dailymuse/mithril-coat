var mithril = require("mithril");

/*
a convenient wrapper to initialize a mithril module.
@param [coat.TemplatedView] view a mithril coat view that's used to mount the 
mithril component
@param [Function] controllerCb a controller callback that's called in the 
mithril component controller
*/
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
