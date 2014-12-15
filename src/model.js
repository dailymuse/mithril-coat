var mithril = require("mithril");

MITHRIL_REQUEST_OPTS = ["user", "password", "data", "background", "initialValue", "unwrapSuccess", "unwrapError", "serialize", "extract", "type"]

var Model = function(options) {
    this._setOptions(options || {});
};

Model.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = mithril.prop(options[key]);
    }
};

Model.prototype.setProps = function(obj) {
    this._updateProps(obj);
};

// update model mithril properties 
Model.prototype._updateProps = function(model) {
    for(var key in model) {
        if(this[key]) {
            this[key](model[key]);
        } else {
            this[key] = mithril.prop(model[key]);
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

Model.prototype._request = function(method, options) {
    var self = this,
        url = this._getUrl(),
        requestOpts = {method: method, url: url, config: this.xhrConfig};

    for(var key in options) {
        if(MITHRIL_REQUEST_OPTS.indexOf(key) !== -1) {
            requestOpts[key] = options[key];
        }
    }

    // make request and update model props
    mithril.request(requestOpts)
        .then(function(response) {
            self._updateProps(response);
            options.success(response);
        }, function(error) {    
            if(options.error) { options.error(error); }
        })
};

Model.prototype.delete = function(options) {
    this._request("DELETE", options);
};

Model.prototype.get = function(options) {
    this._request("GET", options);
};

Model.prototype.save = function(options) {
    var requestType = this.id ? "PUT" : "POST";
    this._request(requestType, options);
};

module.exports = {
    Model: Model
};