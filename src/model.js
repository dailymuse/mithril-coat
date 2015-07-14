var mithril = require("mithril");

MITHRIL_REQUEST_OPTS = ["user", "password", "data", "background", "initialValue", "unwrapSuccess", "unwrapError", "serialize", "extract", "type"]

function Model (options) {
    this.options = options;

   // model keys is an array of all model keys on the object
    this.modelKeys = [];
    this._updateProps(options);

    // flag whether the model is currently loading
    this.loading = mithril.prop(false);
    this.requestError = mithril.prop(false);
};

// method to ste properties for options
Model.prototype.setProps = function (options) {
    this._updateProps(options);
};

// update model mithril properties on Model object
Model.prototype._updateProps = function (options) {
    for (var key in options) {
        // if the key exists then update the mithril property
        if (this[key]) {
            this[key](options[key]);
        } else {
            this[key] = mithril.prop(options[key]);
            this.modelKeys.push(key);
        }
    }
};

// set the default model properties back to the default
Model.prototype.setDefaultProps = function (options) {
    this.setProps(this.options);
};

/**
 * function to extend that allows you set xhrconfig status for all
 * mithril requests
 */
Model.prototype.xhrConfig = function (xhr) {
    return 
};

/**
 * allow url to be set as property on Model object or as a function 
 * useful if need to conditionally set url based on variables passed into
 * model
 */
Model.prototype._getUrl = function () {
    return typeof this.url === "function" ? this.url() : this.url;
};

/** 
 * Internal method used to make mithril requests and only submit the correct 
 * request options to mithril
 */
Model.prototype._request = function (options) {
    var _this = this,
        url = this._getUrl(),
        requestOpts = {url: url, config: this.xhrConfig, method: options.method};

    // only add an option if it is allowed by mithril
    for (var key in options) {
        if (MITHRIL_REQUEST_OPTS.indexOf(key) !== -1) {
            requestOpts[key] = options[key];
        }
    }

    /**
     * set the request to loading - allows for more fine grained control for 
     * happens during loading
     */
    this.loading(true);
    // make request and update model props
    mithril.request(requestOpts)
        .then(function(response) {
            // update all properties in response as mithril props on model
            _this._updateProps(response);

            // the request has finished loading
            _this.loading(false);
            // ensure that if the request is submitted again it is marked as 
            // successful
            _this.requestError(false);

            // only want call success cb if was passed as opts
            if ("success" in options) { 
                options.success(response, _this); 
            }
        }, function(error) {   
            // finished loading
            _this.loading(false);
            // request resulted in an error
            _this.requestError(true);

            // only want to call error cb if was passed as opts
            if ("error" in options) { 
                options.error(error, _this); 
            }
        })
};

Model.prototype.delete = function (options) {
    var options = options ? options : {};

    if (!("method" in options)) {
        options.method = "DELETE";
    }

    this._request(options);
};

Model.prototype.get = function (options) {
    var options = options ? options : {};

    if (!("method" in options)) {
        options.method = "GET";
    }

    this._request(options);
};

Model.prototype.save = function (options) {
    var options = options ? options : {};

    if (!("method" in options)) {
        options.method = this.id ? "PUT" : "POST";
    }

    this._request(options);
};

module.exports = {
    Model: Model
};