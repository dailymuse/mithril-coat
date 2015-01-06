# About Mithril Coat
Mithril coat is a lightweight wrapper around mithril that aims to provide some simple utilities on top of mithril. It also provides a templating language that compiles to mithril templates. The templating is meant to be used with coat and you will run into issues if you do not use the templating language with mithril coat. 

The only requirement for mithril coat is jQuery (although this may change in the future).

## Install
To install the template compiler `npm install mithril-coat`.

To install the front-end package via bower `bower install mithril-coat`.

## Usage Mithril Coat 
Mithril Coat exposes its api via the global `coat` variable.

### Module
coat.Modules is an object that contains references to a coat.View and a coat.Controller. 

#### coat.Module.activate()
Instantiates a mithril module. 

### Controller
`coat.Controller` is an object that is meant to be used a mithril controller. 

Things to know about the Controller:
- a controller can have many views bound to it (while views can only be bound to one controller)
- a controller can have many models
- the mithril autoredraw function should only be called from a controller
- a controller is responsible for manipulating models 
- generally views are bound to controllers through instantiating `coat.Module` and not on controller instantiation

#### var ctrl = new coat.Controller({})
Instantiates a controller with a hash. All key, value pairs within the hash are set on 

#### ctrl.autoredraw(cb, opts)
Redraws a view using mithrils `startComputation()` and `endComputation` in a try, finally block as recomended by mithril. Calls the callback and passes opts as an argument to the callback. 

### View
coat.View is a stripped down version of Backbone.View and is meant to be used with existing HTML elements.

#### new coat.View({ $el: $elt, events: {} })
Expects a jquery object as it's $el. If an events hash is provided, then the view uses event delegation on the $el.

The events object is similar to Backbones event objects:
```
{
    "[eventName] [selector]": "[function]"
}
```

#### coat.View.$(jquerySelector)
returns a jquery object via a jquery selector within the coat view.

#### coat.View.on(eventName, selector, method)
binds an event on the $el with the corresponding method.

#### coatView.off(eventName, selector, method)
distaches an event that was previously bound to the view.

### TemplatedView
`coat.TemplatedView` is a mithril view that extends from coat.View as well as methods used for rendering mithril modules. 

A `TemplatedView` can only be bound to one controller. Even though a view is bound to a controller, it should never manipulate controller and by extension model objects. It can call controller functions in order to flow user interaction up to the controller. 

### Utils
###$ coat.map()
Is used by the coat template compiler in order to iterate over objects and arrays. 

###$ coat.depraram(queryString="")
Is a convenience method that accepts a query string and returns an object mapping query parameters to their decoded values.


