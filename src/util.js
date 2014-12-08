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

module.exports = {
    deparam: deparam
};
