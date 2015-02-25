var mithril = require("mithril");

MITHRIL_REQUEST_OPTS = ["user", "password", "data", "background", "initialValue", "unwrapSuccess", "unwrapError", "serialize", "extract", "type"]

var Model = function(options) {
    this._setOptions(options || {});
};

Model.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = mithril.prop(options[key]);
    }

    this.loading = mithril.prop(false);
};

Model.prototype.setProps = function(obj) {
    this._updateProps(obj);
};

// update model mithril properties 
Model.prototype._updateProps = function(model) {
    this.modelKeys = [];

    for(var key in model) {
        if(this[key]) {
            this[key](model[key]);
        } else {
            this[key] = mithril.prop(model[key]);
            this.modelKeys.push(key);
        }
    }
};

// function to extend that allows you set xhrconfig status for all
// mithril requests
Model.prototype.xhrConfig = function(xhr) {
    return 
};

// allow url to be set as property on Model object or as a function 
// useful if need to conditionally set url based on variables passed into
// model
Model.prototype._getUrl = function() {
    return typeof this.url === "function" ? this.url() : this.url;
};

Model.prototype._request = function(options) {
    var self = this,
        url = this._getUrl(),
        requestOpts = {url: url, config: this.xhrConfig, method: options.method};

    for(var key in options) {
        if(MITHRIL_REQUEST_OPTS.indexOf(key) !== -1) {
            requestOpts[key] = options[key];
        }
    }

    this.loading(true);
    // make request and update model props
    mithril.request(requestOpts)
        .then(function(response) {
            // update all properties in response as mithril props on model
            self._updateProps(response);
            // the request has finished loading
            self.loading(false);
            // only want call success cb if was passed as opts
            if(options.success) { 
                options.success(response, self); 
            }
        }, function(error) {   
            // finished loading
            self.loading(false);
            // only want to call error cb if was passed as opts
            if(options.error) { 
                options.error(error, self); 
            }
        })
};

Model.prototype.delete = function(options) {
    if (!options.method) {
        options.method = "DELETE";
    }
    this._request(options);
};

Model.prototype.get = function(options) {
    if (!options.method) {
        options.method = "GET";
    }
    this._request(options);
};

Model.prototype.save = function(options) {
    if (!options.method) {
        options.method = this.id ? "PUT" : "POST";
    }
    this._request(options);
};

module.exports = {
    Model: Model
};