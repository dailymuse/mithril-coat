var templates = {};

function render(name, view, controller) {
    var template = templates[name];

    if(template === undefined) {
        throw new Error("Template `" + name + "` does not exist");
    }

    return template(view, controller);
}

function register(name, fn) {
    templates[name] = fn;
}

module.exports = {
    templates: templates,
    render: render,
    register: register
};
