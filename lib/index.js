var htmlparser = require("htmlparser2");
var _ = require("underscore");

function isWhitespaceElement(el) {
    return el.type == "text" && /^\s*$/.test(el.data)
}

function CoatCompiler(options) {
    options = options || {};
    this.depth = options.startingDepth || 0;
    this.wrapFunction = options.wrapFunction || false;
    this.buffer = [];

    var extensionModules = options.extensions || [];
    this.extensions = {};

    for(var i=0; i<extensionModules.length; i++) {
        var extensionModule = extensionModules[i];

        for(var key in extensionModule) {
            this.extensions[key] = extensionModule[key];
        }
    }
}

CoatCompiler.prototype.emit = function(token) {
    this.buffer.push(token);
};

CoatCompiler.prototype.line = function(depthDiff) {
    this.emit("\n");

    this.depth += depthDiff || 0;

    for(var i=0; i<this.depth; i++) {
        this.emit("\t");
    }
};

CoatCompiler.prototype.compiled = function() {
    return this.buffer.join("");
};

CoatCompiler.prototype.prewalk = function(dom) {
    // Remove whitespace elements
    dom = _.reject(dom, function(el) {
        return el.type == "text" && /^\s*$/.test(el.data);
    });

    dom = _.reject(dom, function(el) {
        return el.type == "comment";
    });

    // Prewalk children
    for(var i=0; i<dom.length; i++) {
        var child = dom[i];
        var prevChild = i > 0 ? dom[i - 1] : null;

        if(child.type == "tag" || child.type == "script") {
            child.children = this.prewalk(child.children);
        }

        if(child.type == "tag" && (child.name == "elif" || child.name == "else")) {
            if(prevChild == null || prevChild.type != "tag" || !(prevChild.name == "elif" || prevChild.name == "if")) {
                throw new Error("Dangling `" + child.name + "` clause");
            }
        }
    }

    return dom;
};

CoatCompiler.prototype.pr = function(dom, depth) {
    for(var i=0; i<dom.length; i++) {
        var el = dom[i];
        var str = "";

        for(var j=0; j<depth; j++) {
            str += "  ";
        }

        if(el.type == "tag" || el.type == "script") {
            str += "- " + el.name;
            this.pr(el.children, depth + 2);
        } else {
            str += "* " + el.type;
        }
    }
};

CoatCompiler.prototype.compile = function(dom) {
    var root = this.prewalk(dom);

    if(root.length == 0) {
        throw new Error("No root node");
    }

    if(this.wrapFunction) {
        this.emit("function(view, state) {");
        this.line(1);
        this.emit("var configObj = view._template ? {} : {'config':view._configDomEvents.bind(view)};");
        this.line(0);
        this.emit('return (coat.m("div", configObj, ');
    }
    
    this.compileDom(root);

    if(this.wrapFunction) {
        this.emit("));");
        this.line(-1);
        this.emit("}");
    }
};

CoatCompiler.prototype.compileDom = function(dom) {
    if(dom.length == 1) {
        this.compileElement(dom[0]);
    } else if(dom.length > 1) {
        this.emit("[");
        this.line(1);
        var prevBufferLength = this.buffer.length;

        for(var i=0; i<dom.length; i++) {
            // Only emit commas if we're not on the last line and something
            // was emitted on the last compile run
            if(this.buffer.length != prevBufferLength) {
                this.emit(",");
                this.line();
                prevBufferLength = this.buffer.length;
            }

            this.compileElement(dom[i]);
        }

        this.line(-1);
        this.emit("]");
    }
};

CoatCompiler.prototype.compileElement = function(el) {
    if(el.type == "comment") {
        // Ignore comments
        return;
    }

    var cb = {
        "tag": this.compileTag,
        "text": this.compileText,
        "script": this.compileTag
    }[el.type];

    cb.call(this, el);
};

CoatCompiler.prototype.compileTag = function(el) {
    // handled by compileIf
    if(el.name == "else" || el.name == "elif") {
        return;
    }

    var cb = this.extensions[el.name];

    if(!cb) {
        cb = {
            "raw": this.compileRaw,
            "if": this.compileIf,
            "map": this.compileMap,
            "val": this.compileVal,
            "nbsp": this.compileNbsp,
            "template": this.compileTemplateImport,
            "view": this.compileViewImport
        }[el.name];
    }

    if(cb) {
        cb.call(this, el);
    } else {
        this.compileHtmlTag(el);
    }
};

CoatCompiler.prototype.compileRaw = function(el) {
    this.emit("coat.trust(");
    // allow to pass javscript expressions to raw
    if (el.attribs.val) {
        this.emit(el.attribs.val)
    } else {
        this.emit(JSON.stringify(el.attribs.expr));
    }
    this.emit(")");
};

CoatCompiler.prototype.compileHtmlTag = function(el) {
    this.emit("coat.m(");
    this.emit(JSON.stringify(el.name));
    this.emit(", ");

    // TODO: horrible hack to allow for attribute expressions and accommodate
    // mithril's custom style system
    var attribsSpec = {};
    var hasAnyStylings = false;

    for(var key in el.attribs) {
        var expr = false;
        var style = false;
        var serializedValue = el.attribs[key];
        var replacementValue = null;

        if(key.substring(0, 5) == "expr-") {
            expr = true;
            key = key.substring(5);
            replacementValue = serializedValue;
            serializedValue = "__$coat_expr_" + key;
        }

        if(key.substring(0, 6) == "style-") {
            style = true;
            hasAnyStylings = true;
        }

        attribsSpec[key] = {
            expr: expr,
            style: style,
            serializedValue: serializedValue,
            replacementValue: replacementValue
        };
    }

    var newAttribs = hasAnyStylings ? { style: {} } : {};

    for(var key in attribsSpec) {
        var spec = attribsSpec[key];

        if(spec.style) {
            newAttribs.style[key.substring(6)] = spec.serializedValue;
        } else {
            newAttribs[key] = spec.serializedValue;
        }
    }

    var attribsJson = JSON.stringify(newAttribs);

    for(var key in attribsSpec) {
        var spec = attribsSpec[key];

        if(spec.expr) {
            attribsJson = attribsJson.replace(JSON.stringify("__$coat_expr_" + key), spec.replacementValue);
        }
    }

    this.emit(attribsJson);
    this.emit(", ");

    var prevBufferLength = this.buffer.length;
    this.compileDom(el.children);
    if(this.buffer.length == prevBufferLength) {
        this.emit("null");
    }

    this.emit(")");
};

CoatCompiler.prototype.compileIf = function(el) {
    var elseIfClauses = [];
    var elseClause = null;
    var curClause = el.next;

    while(curClause) {
        if(isWhitespaceElement(curClause)) {
            // ignore
        } else if(curClause.name == "else" || curClause.name == "elif") {
            elseIfClauses.push(curClause);
        } else {
            // Break on any other type of element
            break;
        }

        curClause = curClause.next;
    }

    // Verify the else clause (if it exists) is the last
    for(var i=0; i<elseIfClauses.length-1; i++) {
        if(elseIfClauses[i].name == "else") {
            throw new Error("The `else` clause must be the last among adjacent `if` and `elif` clauses");
        }
    }

    if(elseIfClauses.length && elseIfClauses[elseIfClauses.length - 1].name == "else") {
        elseClause = elseIfClauses.pop();
    }

    var self = this;

    var emitChildren = function(el) {
        self.emit("return (");
        self.compileDom(el.children);
        self.emit(");");
    };

    var emitClause = function(el) {
        self.emit("if(");
        self.emit(el.attribs.expr);
        self.emit(") {");
        self.line(1);
        emitChildren(el);
        self.line(-1);
        self.emit("} ");
    };

    this.emit("(function() {");
    this.line(1);
    emitClause(el);

    for(var i=0; i<elseIfClauses.length; i++) {
        this.emit("else ");
        emitClause(elseIfClauses[i]);
    }

    if(elseClause) {
        this.emit("else {");
        this.line(1);
        emitChildren(elseClause);
        this.line(-1);
        this.emit("}");
    }

    this.line(-1);
    this.emit("}).call(this)");
};

CoatCompiler.prototype.compileMap = function(el) {
    this.emit("coat.map(");
    this.emit(el.attribs.expr);
    this.emit(", function(");
    this.emit(el.attribs.val);

    if(el.attribs.key) {
        this.emit(", ");
        this.emit(el.attribs.key);
    }

    this.emit(") {");
    this.line(1);
    this.emit("return (");
    this.compileDom(el.children);
    this.emit(");");
    this.line(-1);
    this.emit("})");
};

CoatCompiler.prototype.compileNbsp = function(el) {
    var count = el.attribs.count || 1;

    if(count == 1) {
        this.emit('" "');
    } else {
        var html = [];

        for(var i=0; i<count.length; i++) {
            html.push("&nbsp");
        }

        this.emit('coat.trust(');
        this.emit(JSON.stringify(html.join("")));
        this.emit(")")
    }
};

CoatCompiler.prototype.compileTemplateImport = function(el) {
    var path = el.attribs.path;
    
    if (path.indexOf("/") === -1) {
        path = "./" + path;
    }

    this.emit("(function() {");
    this.line(1);
    this.emit("view._template = true;");
    this.line(0);
    this.emit('var template = require(');
    this.emit(JSON.stringify(path + ".coat"));
    this.emit(')(view, state);');
    this.line(0);
    this.emit("view._template = false;");
    this.line(0);
    this.emit("return template;");
    this.line(-1);
    this.emit("}).call(this)");
};

CoatCompiler.prototype.compileViewImport = function(el) {
    this.emit("(function() {");
    this.line(1);
    this.emit('var newView = new ');
    this.emit(el.attribs.name);
    this.emit('(');
    this.emit(el.attribs.args);
    this.emit(");");
    this.line(0);
    this.emit("view._addSubview(newView)");
    this.line(0);
    this.emit("return newView.render();");
    this.line(-1);
    this.emit("}).call(this)");
};

CoatCompiler.prototype.compileVal = function(el) {
    this.emit(el.attribs.expr);
};

CoatCompiler.prototype.compileText = function(el) {
    this.emit(JSON.stringify(el.data));
};

function compile(contents, options, cb) {
    options = options || {};

    var domOptions = _.defaults({}, options, { normalizeWhitespace: true });
    var compilerOptions = _.defaults({}, options);

    var handler = new htmlparser.DomHandler(function(error, dom) {
        var compiler = new CoatCompiler(compilerOptions);

        if(error) {
            cb(error);
        } else {
            try {
                compiler.compile(dom);
            } catch(e) {
                cb(e);
                return;
            }

            cb(null, compiler.compiled());
        }
    }, domOptions);

    var parser = new htmlparser.Parser(handler, {
        recognizeSelfClosing: true,
        lowerCaseAttributeNames: false,
        lowerCaseTags: false
    });

    parser.write(contents);
    parser.done();
}

exports.compile = compile;
