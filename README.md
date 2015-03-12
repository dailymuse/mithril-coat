# About Mithril Coat
Mithril Coat is a utility library for [mithril](https://github.com/lhorie/mithril) and provides two tools built on top of mithril: 

* A lightweight library around Mithril that provides some conveniences including a pub sub system using the excellent [pubsub-js](https://github.com/mroderick/PubSubJS).
* A templating language that uses HTML tags that compiles to mithril templates.

Mithril Coat's only requirement is jQuery. 

## Install
To install the front-end package via bower `bower install mithril-coat`.

To install the template compiler `npm install mithril-coat -g`.

## Mithril Coat
Mithril Coat exposes its API via the global variable `coat`. Mithril Coats API is organized into _ components: 
```
* Modules
* Routers
* Views
    * Base Views
    * Templated Views
* Controllers
* Models
* Util
```

A few notions around mithril coat that don't have to be strictly followed are:
* views should never manipulate state 
* state should only be manipulated by controllers
* views should not call methods on controllers and vice versa
* views and controllers should interact via mithril coat's pubsub system: modules or routers (more on that below)
* mithril autoredraw function should only be called from a controller
* controllers should be responsible for manipulating models 

### Module
In Mithril Coat Modules serve a dual purpose:

1. act as a dispatcher between views and controllers using Mithril Coat's event pubsub system
2. as a way to initialize a [Mithril Module](http://lhorie.github.io/mithril/mithril.module.html)

#### var module = new coat.Module(opts={})
Instantiates a module - all keys in the object passed into coat.Module are set on that module objects. 

#### module.events()
Events are bound to a module using Pubsub-js, which is a global pubsub system and therefore events are not Module specific. Modules expect the events to return an object mapping of event names to functions to call when the event is published.

For example:
```
    // called when the event "button-clicked" is hit
    module.prototype.buttonClicked = function(msgName, data) {
        console.log('button clicked')
        console.log(data)
    }

    module.prototype.events = function() {
        return {
            "button-clicked": this.buttonClicked
        }
    }
```

#### module.activate()
Instantiates a mithril module using a [Mitril Coat Templated View](). In order to use activate coat.Module expects a view variable to be bound to the module object.

For example:
```
    var module = new coat.Module({ view: new TemplatedView({ $el: $("body") }) })
    module.activate()
```

### Routers
Similar to Modules Routers serve a dual purpose:

1. acting as a dispatcher for events between views and controllers.
2. as a way to initialize a mithril route.

Routers expect only arguments to be passed in as an object
```
    $rootEl - a jQuery Node which will be used as the base node when Mithril.Router 

    var router = new coat.Router({
        $rootEl: $("body")
    })
```
Routers should have a templated view also passed in, but naming conventions should be decided by the developer.

#### router.events()
Exact same implementation as module.events()

#### router.routes()
Is called by Mithril.Router and should return an object mapping of mithril route urls to mithril objects. 

```
    router.prototype.routes = function() {
        "/": {
            controller: function() {
                // called by mithril every time a route is matched
            },
            view: function() {
                // should call .render() on a mithril coat templated view 
                // so if you have a templated view bound to router.view then 
                // you can call this.view.render(), but if render is not called
                // no html will be rendered on the page
            }
        }
    }
```

### Views
Mithril Coat has a notion of 2 different types of views: 
1. Base Views - coat.View
2. Templated Views - coat.TemplatedView

#### coat.View
Base Views provide a number of convenience methods for interacting with existing dom nodes. 

All views expect to be initialized with a $el, if not the view will throw an error
```
    var view = new coat.View({ 
        $el: $("body")
    })
```

#### view.domEvents()
Dom events takes a similar approach to backbone dom events and serves as a way to have event delegation on the view's $el. Like Modules and Routers events method, domEvents returns a mapping of keys structured as `"[events] [selector]"` and values as a function on the view. the domEvents method is called internally by mithril coat when a view is initialized. 

```
    view.prototype.domEvents = function() {
        return {
            "click a": "onClickLink"
        }
    }

    view.prototype.onClickLink = function(e) {
        console.log('linked clicked')
    }
```

#### view.$(jquerySelector)
returns the dom nodes that match the selector inside the $el

#### coat.TemplatedView
Extends coat.View and adds additional functionality for views that use mithril templates. 

In addition to setting an $el, all `coat.TemplatedView` expect a mithril template to be passed in via a template key.

```
    var sampleTemplate = require("./template.js")
    var templatedView = new coat.TemplatedView({
        $el: $("body"),
        template: sampleTemplate
    })
```

##### templatedView.render()
Should be called to render the mithril template. It is called internally by coat.Module.activate() and it is left for the developer to call it in coat.Router.routes. 

##### templatedView.config() 
Mithril has a special "config" key on mithril elements that is called when node are rendered on a page. Templates that generate subviews (use the view tag in the template - more on this in mithril templates below), automatically call the function when the view is rendered on the page. This function is meant to be extended. (this is going to be called on all templated views in the future).

## Models 
Mithril coat models provide convenience methods for interacting with Mithril models.

All models also expect a url property to or a url function to be bound to the object which returns the url that you are requesting. 

All keys and values that are passed in the opts objects are set as properties on the object and mithril properties respectively. 

```
    var model = new coat.Model({
        name: "mithril-coat",
        version: 1.0,
    });

    // the url can be set in the options or after instantiation or as a function 
    // should return a url string to request
    model.prototype.url = function() {
        return "/api/mithril-coat/" + this.version(s);
    }

    console.log(model.name()) // prints "mithril-coat" to the console
```

All coat models have a special property "loading" which is set to false on model initialization and true when a request begins and false when a request finishes completes. To access the value of loading just access it like any mithril property: `model.loading()`.

### model.xhrConfig(xhr) 
This function should be extended if it is necessary to configure the xhr request.

```
    model.prototype.xhrConfig = function(xhr) {
        // in order to avoid caching issues in ie10
        xhr.setRequestHeader("Content-Type", "application/json");
    }
```

### Model Requests
In addition to allowing you to set the underlying xhr requests - mithril coat provides a few other convenience methods. All method calls accept an object of key values. Possible keys that mithril coat will place in the options m.request include:

* "user" 
* "password"
* "data" 
* "background"
* "initialValue" 
* "unwrapSuccess" 
* "unwrapError"
* "serialize" 
* "extract" 
* "type"

Mithril Coat also allows you to pass in success and error call backs that will be called when a requests is finished. By default when a request is finished all the properties of response are set as mithril properties and updated.

#### model.get(opts)
Submits a get request and optionally specifies the method to use in opts

```
    model.get({
        success: function(response, model) {
            console.log(response)
        }, 
        error: function(error, model) {`
            console.log(error)
        }
    })
```

#### model.save(opts)
By default if a `"method"` key is not set in opts and an id is set on the model then mithril coat will set the method request to `"PUT"` and if there is not id it will set the method request to `"POST"`. However there are times when you should submit a `"PUT"` request even though an id exists - therefore we provide the flexbility to determine which method to use. 

#### model.delete(opts)
Submits a delete request to the server.

## Controllers
Mithril coat controllers are meant to be used to manipulate model state and to initiate mithril redraws (either via model requests or via autoredraws). Like all other Mithril Coat Objects all options passed to controllers are set as properties on the instantiated Object.

```
    var controller = new coat.Controller({
        model: new coat.Model({
            url: "api/confirm"
        })
    })
```

#### ctrl.autoredraw(cb, opts)
Redraws a view using mithrils `startComputation()` and `endComputation` in a try, finally block as recomended by mithril. Calls the callback and passes opts as an argument to the callback. 

```
    // inside some function in a controller
    this.autoredraw(function(opts) {
        console.log(opts);
    }, opts);
```

## Mithril Coat Templates
Mithril coat templates are mithril templates that are written in HTML. The files are saved with a .html extension and are then compiled to JavaScript by the mithril coat compiler. 

Mithril coat templates are simply html templates that are compiled to mithril. The templating language is expected to be used in conjunction with [Browserify](http://browserify.org/) as it `module exports` all the templates. 







