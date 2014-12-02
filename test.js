shadow.registerTemplate("test", function(view, controller) {
	return ([
		(function() {
			if(true) {
				return (shadow.m("ul", {}, shadow.m("each", {"expr":"users","as":"user"}, shadow.m("li", {}, user))));
			} else if(false) {
				return (" should never show ");
			} 
		}).call(this),
		shadow.templates["foo"](view, controller)
	]);
});
