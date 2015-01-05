# About Mithril Coat
Mithril coat is a lightweight wrapper around mithril that aims to provide some simple utilities on top of mithril. It also provides a templating language that compiles to mithril templates. The templating is meant to be used with coat and you will run into issues if you do not use the templating language with mithril coat. 

The only requirement for mithril coat is jQuery (although this may change in the future).

## Install
To install the template compiler `npm install mithril-coat`.

To install the front-end package via bower `bower install mithril-coat`.

## Usage
Mithril Coat exposes its api via the global `coat` variable.

### View
coat.View is a stripped down version of Backbone.View and is meant to be used with existing HTML elements.

#### var coatView = new coat.View({ $el: $elt, events: {} })
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

### Utils
###$ coat.map()
Is used by the coat template compiler in order to iterate over objects and arrays. 

###$ coat.depraram(queryString="")
Is a convenience method that accepts a query string and returns an object mapping query parameters to their decoded values.


