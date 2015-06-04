module.exports = function(view, state) {
	var configObj = view._template ? {} : {'config':view._configDomEvents.bind(view)};
	return (coat.m("div", configObj, [
		(function() {
			if(true) {
				return (coat.m("ul", {}, coat.map(controller.users, function(user, key) {
					return (coat.m("li", {}, user));
				})));
			} else if(false) {
				return (" should never show ");
			} 
		}).call(this),
		coat.trust("&nbsp"),
		coat.trust("'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'"),
		(function() {
			view._template = true;
			var template = require("./foo.js")(view, state);
			view._template = false;
			return template
		}).call(this),
		(function() {
			var newView = new view.ButtonView({state: state.subModel});
			view._addSubview(newView)
			return newView.render();
		}).call(this)
	]));
};
