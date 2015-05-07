var mithril = require("mithril");

function Module(options) {
    if (options.view) {
        this._view = options.view;
    }

    this._setOptions(options);
};

Module.prototype._setOptions = function(options) {
    for(var key in options) {

        if(key !== "view") {
            this[key] = options[key];
        }
        
    }

    this.options = options;
};

Module.prototype.activate = function() {
    var view = this._view;

    return mithril.module(this._view.$el[0], {
        controller: function() {
            return;
        }, 
        view: function() {
            return view.render();
        }
    });
};

module.exports = {
    Module: Module
};
