var map = function(obj, iterator, context) {
    if (obj === null) {
        return null;
    } else if (Array.prototype.map && obj.map === Array.prototype.map) {
        return obj.map(iterator, context);
    } else {
        var results = [];

        if (obj.length === +obj.length) {
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

/*  Converts a query string into an object mapping keys to values.
    Duplicate key names are accepted, in which case the values for that key
    are concatenated into a list.
*/
var deparam = function(qs) {
    if (qs.length && qs[0] === "?") {
        qs = qs.substring(1);
    }

    var deparamed = {};
    var parts = qs.split("&");
    var regexForSpaces = /\+/gi;

    for (var i=0; i<parts.length; i++) {
        var pair = parts[i].split("=");
        // split the key to handle multi arguments
        var key = decodeURIComponent(pair[0]).split("[]")[0], 
            newValue = pair[1],
            curValue = deparamed[key],
            curType = typeof(curValue);

        // convert '+'' to %20 which js consider encoding a space
        if (newValue) newValue = newValue.replace(regexForSpaces, "%20");

        newValue = decodeURIComponent(newValue);

        if (curType === "undefined") {
            deparamed[key] = newValue;
        } else if (curType === "string") { // this key has multiple values, so make them into a list
            deparamed[key] = [curValue, newValue];
        } else {
            curValue.push(newValue);
        }
    }

    return deparamed;
};

module.exports = {
    map: map,
    deparam: deparam
};
