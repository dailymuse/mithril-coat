var mithril = require("mithril");

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
        if(key !== "success" || key !== 'error') {
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

Model.prototype.get = function(options) {
    var opts = this._request("GET", options);
};

Model.prototype.save = function(options) {
    var requestType = this.id ? "PUT" : "POST"
    opts = this._request(requestType, options)
};

module.exports = {
    Model: Model
};