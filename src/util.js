var mithril = require("mithril");

var map = function(obj, iterator, context) {
    if (obj == null) {
        return results;
    } else if (Array.prototype.map && obj.map === Array.prototype.map) {
        return obj.map(iterator, context);
    } else {
        var results = [];

        if(obj.length === +obj.length) {
            for(var i=0; i<obj.length; i++) {
                results.push(iterator.call(context, obj[i], i, obj));
            }
        } else {
            for(var key in obj) {
                results.push(iterator.call(context, obj[key], key, obj));
            }
        }

        return results;
    }
};

var deparam = function(qs) {
    if(qs.length && qs.indexOf(0) == "?") {
        qs = qs.substring(1);
    }

    var deparamed = {};
    var parts = qs.split("&");

    for(var i=0; i<parts.length; i++) {
        var pair = parts[i].split("=");
        var key = decodeURIComponent(pair[0]), value = decodeURIComponent(pair[1]);
        var curValue = deparamed[key];
        var curType = typeof(curValue);

        if(curType == "undefined") {
            deparamed[key] = value;
        } else if(curType == "string") {
            deparamed[key] = [curValue, value];
        } else {
            curValue.push(value);
        }
    }

    return deparamed;
};

// util to create mithril app for mithril module or route (m.route expects an
// app and not module)
var app = function(viewObj, ctrlObj) {
    return {
        controller: ctrlObj,
        view: viewObj.render()
    }
};

var module = function(viewObj, ctrlObj) {
    m.module(viewObj.$el[0], app(viewObj, ctrlObj))
}

module.exports = {
    map: map,
    deparam: deparam,
    app: app,
    module: module
};
