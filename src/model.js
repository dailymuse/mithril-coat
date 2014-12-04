var mithril = require("mithril");

MITHRIL_REQUEST_OPTS = ["user", "password", "data", "background", "initialValue", "unwrapSuccess", "unwrapError", "serialize", "extract", "type"]

var Model = function(options) {
    this._setOptions(options || {});
};

Model.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = options[key];
    }
};

Model.prototype.xhrConfig = function(xhr) {
    return 
};

Model.prototype._getUrl = function() {
    return typeof this.url === "function" ? this.url() : this.url;
};

Model.prototype._request = function(method, options) {
    var url = this._getUrl();
    var requestOpts = {method: method, url: url, config: this.xhrConfig};

    for(var key in options) {
        if(MITHRIL_REQUEST_OPTS.indexOf(key) !== -1) {
            requestOpts[key] = options[key];
        }
    }

    mithril.request(requestOpts)
        .then(function(response) {
            options.success(response)
        }, function(error) {
            if(options.error) {options.error(error)}
        })
};

Model.prototype.delete = function(options) {
    this._request("DELETE", options)
}

Model.prototype.get = function(options) {
    this._request("GET", options);
};

Model.prototype.save = function(options) {
    var requestType = this.id ? "PUT" : "POST"
    this._request(requestType, options)
};

module.exports = {
    Model: Model
};