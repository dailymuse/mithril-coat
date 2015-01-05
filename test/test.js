shadow.registerTemplate("test", function(view, controller) {
	return ([
		(function() {
			if(true) {
				return (shadow.m("ul", {}, shadow.map(controller.users, function() {
					return (shadow.m("li", {}, user));
				})));
			} else if(false) {
				return (" should never show ");
			} 
		}).call(this),
		shadow.trust("&nbsp"),
		shadow.trust('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'),
		shadow.templates["foo"](view, controller)
	]);
});
