/*  Mithril coat models reprsent the state of data.
    The data is represented by properties.
    Models can send requests to the server to retrieve or update a server-side model.
*/

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
    this._lastRequestId = 0;
};

// method to set mithril coat properties on the model
Model.prototype.setProps = function(options) {
    this._updateProps(options);
};

// update model mithril properties on Model object
Model.prototype._updateProps = function(options) {
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

// set the default model properties back to their default value
Model.prototype.setDefaultProps = function(options) {
    this.setProps(this.options);
};

// returns all properties on a model as an object mapping of keys to values
Model.prototype.getProps = function() {
    var data = {},
        key = null;

    // loop over all model keys and set the values for the returned object
    for (var i = 0; i < this.modelKeys.length; i++) {
        key = this.modelKeys[i];
        data[key] = this[key]();
    }

    return data;
};

/**
 * function to extend that allows you set xhrconfig status for all
 * mithril requests
 */
Model.prototype.xhrConfig = function(xhr) {
    return null;
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
Model.prototype._request = function(options) {
    var _this = this,
        url = this._getUrl(),
        requestOpts = {url: url, config: this.xhrConfig, method: options.method},
        requestId = this._lastRequestId + 1;

    this._lastRequestId++;

    // only add an option if it is allowed by mithril
    for (var key in options) {
        if (MITHRIL_REQUEST_OPTS.indexOf(key) !== -1) {
            requestOpts[key] = options[key];
        }
    }

    /**
     * set the request to loading - allows for more fine grained control for 
     * what happens during loading
     */
    this.loading(true);
    // make request and update model props
    mithril.request(requestOpts)
        .then(function(response) {
            if (_this._lastRequestId === requestId) {
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

/* 
Submits a DELETE request to the server.
@param [Object] options the request options for this request
*/
Model.prototype.delete = function(options) {
    var options = options ? options : {};

    if ("method" in options && options.method !== "DELETE") {
        throw "You are trying to call the delete() method with the method option already set to another method type. This is probably not what you want."
    }
    options.method = "DELETE"; 

    this._request(options);
};

/* 
Submits a get request to the server.
@param [Object] options the request options for this request
*/
Model.prototype.get = function(options) {
    var options = options ? options : {};

    if ("method" in options && options.method !== "GET") {
        throw "You are trying to call the get() method with the method option already set to another method type. This is probably not what you want."
    }
    options.method = "GET";

    this._request(options);
};

/* 
Submits a PUT or POST request to the server.
@param [Object] options the request options for this request
*/
Model.prototype.save = function(options) {
    var options = options ? options : {};

    // if the method isn't set and there is id then default to a put 
    if ("method" in options) && (options.mehtod !== "POST" || options.method !== "PUT") {
        throw "You are trying to call the save() method with the method option set to something besides PUT or POST. This is probably not what you want."
    }
    // POST is used to create new object, and PUT updates an existing object.
    // So we checkt to see if an object id is given to determine between the two methods
    options.method = this.id ? "PUT" : "POST";

    this._request(options);
};

module.exports = {
    Model: Model
};