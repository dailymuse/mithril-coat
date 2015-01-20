module.exports = function(view, state) {
	return ([
		(function() {
			if(true) {
				return (coat.m("ul", {}, coat.map(controller.users, function() {
					return (coat.m("li", {}, user));
				})));
			} else if(false) {
				return (" should never show ");
			} 
		}).call(this),
		coat.trust("&nbsp"),
		coat.trust('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'),
		require("undefined.js")(view, state);,
		var newView = new view.ButtonView({state: state.subModel});
		coat.m('div', {config: coat.captureEvents(newView)}, newView.render());
	]);
};
