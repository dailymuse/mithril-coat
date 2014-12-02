var templates = {};

function registerTemplate(name, fn) {
    templates[name] = fn;
}

module.exports = {
    templates: templates,
    registerTemplate: registerTemplate
};
