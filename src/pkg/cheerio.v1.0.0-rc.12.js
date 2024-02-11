import { textContent, innerText, uniqueSort, nextElementSibling, prevElementSibling, getSiblings, getChildren, removeElement } from '/_snowpack/pkg/domutils.v3.1.0.js';
import { cloneNode, Document, isTag, isDocument, hasChildren, Text } from '/_snowpack/pkg/domhandler.v5.0.3.js';
import { select, filter as filter$1, is as is$1, some } from '/_snowpack/pkg/cheerio-select.v2.1.0.js';
import { serializeOuter, parse as parse$2, parseFragment } from '/_snowpack/pkg/parse5.v7.1.2.js';
import { adapter } from '/_snowpack/pkg/parse5-htmlparser2-tree-adapter.v7.0.0.js';
import renderWithHtmlparser2 from '/_snowpack/pkg/dom-serializer.v2.0.0.js';
import { parseDocument } from '/_snowpack/pkg/htmlparser2.v8.0.2.js';

const defaultOpts = {
    xml: false,
    decodeEntities: true,
};
const xmlModeDefault = {
    _useHtmlParser2: true,
    xmlMode: true,
};
/**
 * Flatten the options for Cheerio.
 *
 * This will set `_useHtmlParser2` to true if `xml` is set to true.
 *
 * @param options - The options to flatten.
 * @returns The flattened options.
 */
function flatten(options) {
    return (options === null || options === void 0 ? void 0 : options.xml)
        ? typeof options.xml === 'boolean'
            ? xmlModeDefault
            : { ...xmlModeDefault, ...options.xml }
        : options !== null && options !== void 0 ? options : undefined;
}

/**
 * Helper function to render a DOM.
 *
 * @param that - Cheerio instance to render.
 * @param dom - The DOM to render. Defaults to `that`'s root.
 * @param options - Options for rendering.
 * @returns The rendered document.
 */
function render(that, dom, options) {
    if (!that)
        return '';
    return that(dom !== null && dom !== void 0 ? dom : that._root.children, null, undefined, options).toString();
}
/**
 * Checks if a passed object is an options object.
 *
 * @param dom - Object to check if it is an options object.
 * @returns Whether the object is an options object.
 */
function isOptions(dom, options) {
    return (!options &&
        typeof dom === 'object' &&
        dom != null &&
        !('length' in dom) &&
        !('type' in dom));
}
function html(dom, options) {
    /*
     * Be flexible about parameters, sometimes we call html(),
     * with options as only parameter
     * check dom argument for dom element specific properties
     * assume there is no 'length' or 'type' properties in the options object
     */
    const toRender = isOptions(dom) ? ((options = dom), undefined) : dom;
    /*
     * Sometimes `$.html()` is used without preloading html,
     * so fallback non-existing options to the default ones.
     */
    const opts = {
        ...defaultOpts,
        ...this === null || this === void 0 ? void 0 : this._options,
        ...flatten(options !== null && options !== void 0 ? options : {}),
    };
    return render(this, toRender, opts);
}
/**
 * Render the document as XML.
 *
 * @param dom - Element to render.
 * @returns THe rendered document.
 */
function xml(dom) {
    const options = { ...this._options, xmlMode: true };
    return render(this, dom, options);
}
/**
 * Render the document as text.
 *
 * This returns the `textContent` of the passed elements. The result will
 * include the contents of `script` and `stype` elements. To avoid this, use
 * `.prop('innerText')` instead.
 *
 * @param elements - Elements to render.
 * @returns The rendered document.
 */
function text(elements) {
    const elems = elements ? elements : this ? this.root() : [];
    let ret = '';
    for (let i = 0; i < elems.length; i++) {
        ret += textContent(elems[i]);
    }
    return ret;
}
function parseHTML(data, context, keepScripts = typeof context === 'boolean' ? context : false) {
    if (!data || typeof data !== 'string') {
        return null;
    }
    if (typeof context === 'boolean') {
        keepScripts = context;
    }
    const parsed = this.load(data, defaultOpts, false);
    if (!keepScripts) {
        parsed('script').remove();
    }
    /*
     * The `children` array is used by Cheerio internally to group elements that
     * share the same parents. When nodes created through `parseHTML` are
     * inserted into previously-existing DOM structures, they will be removed
     * from the `children` array. The results of `parseHTML` should remain
     * constant across these operations, so a shallow copy should be returned.
     */
    return parsed.root()[0].children.slice();
}
/**
 * Sometimes you need to work with the top-level root element. To query it, you
 * can use `$.root()`.
 *
 * @example
 *
 * ```js
 * $.root().append('<ul id="vegetables"></ul>').html();
 * //=> <ul id="fruits">...</ul><ul id="vegetables"></ul>
 * ```
 *
 * @returns Cheerio instance wrapping the root node.
 * @alias Cheerio.root
 */
function root() {
    return this(this._root);
}
/**
 * Checks to see if the `contained` DOM element is a descendant of the
 * `container` DOM element.
 *
 * @param container - Potential parent node.
 * @param contained - Potential child node.
 * @returns Indicates if the nodes contain one another.
 * @alias Cheerio.contains
 * @see {@link https://api.jquery.com/jQuery.contains/}
 */
function contains(container, contained) {
    // According to the jQuery API, an element does not "contain" itself
    if (contained === container) {
        return false;
    }
    /*
     * Step up the descendants, stopping when the root element is reached
     * (signaled by `.parent` returning a reference to the same object)
     */
    let next = contained;
    while (next && next !== next.parent) {
        next = next.parent;
        if (next === container) {
            return true;
        }
    }
    return false;
}
/**
 * $.merge().
 *
 * @param arr1 - First array.
 * @param arr2 - Second array.
 * @returns `arr1`, with elements of `arr2` inserted.
 * @alias Cheerio.merge
 * @see {@link https://api.jquery.com/jQuery.merge/}
 */
function merge(arr1, arr2) {
    if (!isArrayLike(arr1) || !isArrayLike(arr2)) {
        return;
    }
    let newLength = arr1.length;
    const len = +arr2.length;
    for (let i = 0; i < len; i++) {
        arr1[newLength++] = arr2[i];
    }
    arr1.length = newLength;
    return arr1;
}
/**
 * Checks if an object is array-like.
 *
 * @param item - Item to check.
 * @returns Indicates if the item is array-like.
 */
function isArrayLike(item) {
    if (Array.isArray(item)) {
        return true;
    }
    if (typeof item !== 'object' ||
        !Object.prototype.hasOwnProperty.call(item, 'length') ||
        typeof item.length !== 'number' ||
        item.length < 0) {
        return false;
    }
    for (let i = 0; i < item.length; i++) {
        if (!(i in item)) {
            return false;
        }
    }
    return true;
}

var staticMethods = /*#__PURE__*/Object.freeze({
    __proto__: null,
    html: html,
    xml: xml,
    text: text,
    parseHTML: parseHTML,
    root: root,
    contains: contains,
    merge: merge
});

/**
 * Checks if an object is a Cheerio instance.
 *
 * @category Utils
 * @param maybeCheerio - The object to check.
 * @returns Whether the object is a Cheerio instance.
 */
function isCheerio(maybeCheerio) {
    return maybeCheerio.cheerio != null;
}
/**
 * Convert a string to camel case notation.
 *
 * @private
 * @category Utils
 * @param str - The string to be converted.
 * @returns String in camel case notation.
 */
function camelCase(str) {
    return str.replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
}
/**
 * Convert a string from camel case to "CSS case", where word boundaries are
 * described by hyphens ("-") and all characters are lower-case.
 *
 * @private
 * @category Utils
 * @param str - The string to be converted.
 * @returns String in "CSS case".
 */
function cssCase(str) {
    return str.replace(/[A-Z]/g, '-$&').toLowerCase();
}
/**
 * Iterate over each DOM element without creating intermediary Cheerio instances.
 *
 * This is indented for use internally to avoid otherwise unnecessary memory
 * pressure introduced by _make.
 *
 * @category Utils
 * @param array - The array to iterate over.
 * @param fn - Function to call.
 * @returns The original instance.
 */
function domEach(array, fn) {
    const len = array.length;
    for (let i = 0; i < len; i++)
        fn(array[i], i);
    return array;
}
/**
 * Create a deep copy of the given DOM structure. Sets the parents of the copies
 * of the passed nodes to `null`.
 *
 * @private
 * @category Utils
 * @param dom - The domhandler-compliant DOM structure.
 * @returns - The cloned DOM.
 */
function cloneDom(dom) {
    const clone = 'length' in dom
        ? Array.prototype.map.call(dom, (el) => cloneNode(el, true))
        : [cloneNode(dom, true)];
    // Add a root node around the cloned nodes
    const root = new Document(clone);
    clone.forEach((node) => {
        node.parent = root;
    });
    return clone;
}
var CharacterCodes;
(function (CharacterCodes) {
    CharacterCodes[CharacterCodes["LowerA"] = 97] = "LowerA";
    CharacterCodes[CharacterCodes["LowerZ"] = 122] = "LowerZ";
    CharacterCodes[CharacterCodes["UpperA"] = 65] = "UpperA";
    CharacterCodes[CharacterCodes["UpperZ"] = 90] = "UpperZ";
    CharacterCodes[CharacterCodes["Exclamation"] = 33] = "Exclamation";
})(CharacterCodes || (CharacterCodes = {}));
/**
 * Check if string is HTML.
 *
 * Tests for a `<` within a string, immediate followed by a letter and
 * eventually followed by a `>`.
 *
 * @private
 * @category Utils
 * @param str - The string to check.
 * @returns Indicates if `str` is HTML.
 */
function isHtml(str) {
    const tagStart = str.indexOf('<');
    if (tagStart < 0 || tagStart > str.length - 3)
        return false;
    const tagChar = str.charCodeAt(tagStart + 1);
    return (((tagChar >= CharacterCodes.LowerA && tagChar <= CharacterCodes.LowerZ) ||
        (tagChar >= CharacterCodes.UpperA && tagChar <= CharacterCodes.UpperZ) ||
        tagChar === CharacterCodes.Exclamation) &&
        str.includes('>', tagStart + 2));
}

/**
 * Methods for getting and modifying attributes.
 *
 * @module cheerio/attributes
 */
const hasOwn = Object.prototype.hasOwnProperty;
const rspace = /\s+/;
const dataAttrPrefix = 'data-';
/*
 * Lookup table for coercing string data-* attributes to their corresponding
 * JavaScript primitives
 */
const primitives = {
    null: null,
    true: true,
    false: false,
};
// Attributes that are booleans
const rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
// Matches strings that look like JSON objects or arrays
const rbrace = /^{[^]*}$|^\[[^]*]$/;
function getAttr(elem, name, xmlMode) {
    var _a;
    if (!elem || !isTag(elem))
        return undefined;
    (_a = elem.attribs) !== null && _a !== void 0 ? _a : (elem.attribs = {});
    // Return the entire attribs object if no attribute specified
    if (!name) {
        return elem.attribs;
    }
    if (hasOwn.call(elem.attribs, name)) {
        // Get the (decoded) attribute
        return !xmlMode && rboolean.test(name) ? name : elem.attribs[name];
    }
    // Mimic the DOM and return text content as value for `option's`
    if (elem.name === 'option' && name === 'value') {
        return text(elem.children);
    }
    // Mimic DOM with default value for radios/checkboxes
    if (elem.name === 'input' &&
        (elem.attribs['type'] === 'radio' || elem.attribs['type'] === 'checkbox') &&
        name === 'value') {
        return 'on';
    }
    return undefined;
}
/**
 * Sets the value of an attribute. The attribute will be deleted if the value is `null`.
 *
 * @private
 * @param el - The element to set the attribute on.
 * @param name - The attribute's name.
 * @param value - The attribute's value.
 */
function setAttr(el, name, value) {
    if (value === null) {
        removeAttribute(el, name);
    }
    else {
        el.attribs[name] = `${value}`;
    }
}
function attr(name, value) {
    // Set the value (with attr map support)
    if (typeof name === 'object' || value !== undefined) {
        if (typeof value === 'function') {
            if (typeof name !== 'string') {
                {
                    throw new Error('Bad combination of arguments.');
                }
            }
            return domEach(this, (el, i) => {
                if (isTag(el))
                    setAttr(el, name, value.call(el, i, el.attribs[name]));
            });
        }
        return domEach(this, (el) => {
            if (!isTag(el))
                return;
            if (typeof name === 'object') {
                Object.keys(name).forEach((objName) => {
                    const objValue = name[objName];
                    setAttr(el, objName, objValue);
                });
            }
            else {
                setAttr(el, name, value);
            }
        });
    }
    return arguments.length > 1
        ? this
        : getAttr(this[0], name, this.options.xmlMode);
}
/**
 * Gets a node's prop.
 *
 * @private
 * @category Attributes
 * @param el - Element to get the prop of.
 * @param name - Name of the prop.
 * @returns The prop's value.
 */
function getProp(el, name, xmlMode) {
    return name in el
        ? // @ts-expect-error TS doesn't like us accessing the value directly here.
            el[name]
        : !xmlMode && rboolean.test(name)
            ? getAttr(el, name, false) !== undefined
            : getAttr(el, name, xmlMode);
}
/**
 * Sets the value of a prop.
 *
 * @private
 * @param el - The element to set the prop on.
 * @param name - The prop's name.
 * @param value - The prop's value.
 */
function setProp(el, name, value, xmlMode) {
    if (name in el) {
        // @ts-expect-error Overriding value
        el[name] = value;
    }
    else {
        setAttr(el, name, !xmlMode && rboolean.test(name) ? (value ? '' : null) : `${value}`);
    }
}
function prop(name, value) {
    var _a;
    if (typeof name === 'string' && value === undefined) {
        const el = this[0];
        if (!el || !isTag(el))
            return undefined;
        switch (name) {
            case 'style': {
                const property = this.css();
                const keys = Object.keys(property);
                keys.forEach((p, i) => {
                    property[i] = p;
                });
                property.length = keys.length;
                return property;
            }
            case 'tagName':
            case 'nodeName': {
                return el.name.toUpperCase();
            }
            case 'href':
            case 'src': {
                const prop = (_a = el.attribs) === null || _a === void 0 ? void 0 : _a[name];
                /* eslint-disable node/no-unsupported-features/node-builtins */
                if (typeof URL !== 'undefined' &&
                    ((name === 'href' && (el.tagName === 'a' || el.name === 'link')) ||
                        (name === 'src' &&
                            (el.tagName === 'img' ||
                                el.tagName === 'iframe' ||
                                el.tagName === 'audio' ||
                                el.tagName === 'video' ||
                                el.tagName === 'source'))) &&
                    prop !== undefined &&
                    this.options.baseURI) {
                    return new URL(prop, this.options.baseURI).href;
                }
                /* eslint-enable node/no-unsupported-features/node-builtins */
                return prop;
            }
            case 'innerText': {
                return innerText(el);
            }
            case 'textContent': {
                return textContent(el);
            }
            case 'outerHTML':
                return this.clone().wrap('<container />').parent().html();
            case 'innerHTML':
                return this.html();
            default:
                return getProp(el, name, this.options.xmlMode);
        }
    }
    if (typeof name === 'object' || value !== undefined) {
        if (typeof value === 'function') {
            if (typeof name === 'object') {
                throw new Error('Bad combination of arguments.');
            }
            return domEach(this, (el, i) => {
                if (isTag(el)) {
                    setProp(el, name, value.call(el, i, getProp(el, name, this.options.xmlMode)), this.options.xmlMode);
                }
            });
        }
        return domEach(this, (el) => {
            if (!isTag(el))
                return;
            if (typeof name === 'object') {
                Object.keys(name).forEach((key) => {
                    const val = name[key];
                    setProp(el, key, val, this.options.xmlMode);
                });
            }
            else {
                setProp(el, name, value, this.options.xmlMode);
            }
        });
    }
    return undefined;
}
/**
 * Sets the value of a data attribute.
 *
 * @private
 * @param el - The element to set the data attribute on.
 * @param name - The data attribute's name.
 * @param value - The data attribute's value.
 */
function setData(el, name, value) {
    var _a;
    const elem = el;
    (_a = elem.data) !== null && _a !== void 0 ? _a : (elem.data = {});
    if (typeof name === 'object')
        Object.assign(elem.data, name);
    else if (typeof name === 'string' && value !== undefined) {
        elem.data[name] = value;
    }
}
/**
 * Read the specified attribute from the equivalent HTML5 `data-*` attribute,
 * and (if present) cache the value in the node's internal data store. If no
 * attribute name is specified, read _all_ HTML5 `data-*` attributes in this manner.
 *
 * @private
 * @category Attributes
 * @param el - Element to get the data attribute of.
 * @param name - Name of the data attribute.
 * @returns The data attribute's value, or a map with all of the data attributes.
 */
function readData(el, name) {
    let domNames;
    let jsNames;
    let value;
    if (name == null) {
        domNames = Object.keys(el.attribs).filter((attrName) => attrName.startsWith(dataAttrPrefix));
        jsNames = domNames.map((domName) => camelCase(domName.slice(dataAttrPrefix.length)));
    }
    else {
        domNames = [dataAttrPrefix + cssCase(name)];
        jsNames = [name];
    }
    for (let idx = 0; idx < domNames.length; ++idx) {
        const domName = domNames[idx];
        const jsName = jsNames[idx];
        if (hasOwn.call(el.attribs, domName) &&
            !hasOwn.call(el.data, jsName)) {
            value = el.attribs[domName];
            if (hasOwn.call(primitives, value)) {
                value = primitives[value];
            }
            else if (value === String(Number(value))) {
                value = Number(value);
            }
            else if (rbrace.test(value)) {
                try {
                    value = JSON.parse(value);
                }
                catch (e) {
                    /* Ignore */
                }
            }
            el.data[jsName] = value;
        }
    }
    return name == null ? el.data : value;
}
function data(name, value) {
    var _a;
    const elem = this[0];
    if (!elem || !isTag(elem))
        return;
    const dataEl = elem;
    (_a = dataEl.data) !== null && _a !== void 0 ? _a : (dataEl.data = {});
    // Return the entire data object if no data specified
    if (!name) {
        return readData(dataEl);
    }
    // Set the value (with attr map support)
    if (typeof name === 'object' || value !== undefined) {
        domEach(this, (el) => {
            if (isTag(el)) {
                if (typeof name === 'object')
                    setData(el, name);
                else
                    setData(el, name, value);
            }
        });
        return this;
    }
    if (hasOwn.call(dataEl.data, name)) {
        return dataEl.data[name];
    }
    return readData(dataEl, name);
}
function val(value) {
    const querying = arguments.length === 0;
    const element = this[0];
    if (!element || !isTag(element))
        return querying ? undefined : this;
    switch (element.name) {
        case 'textarea':
            return this.text(value);
        case 'select': {
            const option = this.find('option:selected');
            if (!querying) {
                if (this.attr('multiple') == null && typeof value === 'object') {
                    return this;
                }
                this.find('option').removeAttr('selected');
                const values = typeof value !== 'object' ? [value] : value;
                for (let i = 0; i < values.length; i++) {
                    this.find(`option[value="${values[i]}"]`).attr('selected', '');
                }
                return this;
            }
            return this.attr('multiple')
                ? option.toArray().map((el) => text(el.children))
                : option.attr('value');
        }
        case 'input':
        case 'option':
            return querying
                ? this.attr('value')
                : this.attr('value', value);
    }
    return undefined;
}
/**
 * Remove an attribute.
 *
 * @private
 * @param elem - Node to remove attribute from.
 * @param name - Name of the attribute to remove.
 */
function removeAttribute(elem, name) {
    if (!elem.attribs || !hasOwn.call(elem.attribs, name))
        return;
    delete elem.attribs[name];
}
/**
 * Splits a space-separated list of names to individual names.
 *
 * @category Attributes
 * @param names - Names to split.
 * @returns - Split names.
 */
function splitNames(names) {
    return names ? names.trim().split(rspace) : [];
}
/**
 * Method for removing attributes by `name`.
 *
 * @category Attributes
 * @example
 *
 * ```js
 * $('.pear').removeAttr('class').html();
 * //=> <li>Pear</li>
 *
 * $('.apple').attr('id', 'favorite');
 * $('.apple').removeAttr('id class').html();
 * //=> <li>Apple</li>
 * ```
 *
 * @param name - Name of the attribute.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/removeAttr/}
 */
function removeAttr(name) {
    const attrNames = splitNames(name);
    for (let i = 0; i < attrNames.length; i++) {
        domEach(this, (elem) => {
            if (isTag(elem))
                removeAttribute(elem, attrNames[i]);
        });
    }
    return this;
}
/**
 * Check to see if _any_ of the matched elements have the given `className`.
 *
 * @category Attributes
 * @example
 *
 * ```js
 * $('.pear').hasClass('pear');
 * //=> true
 *
 * $('apple').hasClass('fruit');
 * //=> false
 *
 * $('li').hasClass('pear');
 * //=> true
 * ```
 *
 * @param className - Name of the class.
 * @returns Indicates if an element has the given `className`.
 * @see {@link https://api.jquery.com/hasClass/}
 */
function hasClass(className) {
    return this.toArray().some((elem) => {
        const clazz = isTag(elem) && elem.attribs['class'];
        let idx = -1;
        if (clazz && className.length) {
            while ((idx = clazz.indexOf(className, idx + 1)) > -1) {
                const end = idx + className.length;
                if ((idx === 0 || rspace.test(clazz[idx - 1])) &&
                    (end === clazz.length || rspace.test(clazz[end]))) {
                    return true;
                }
            }
        }
        return false;
    });
}
/**
 * Adds class(es) to all of the matched elements. Also accepts a `function`.
 *
 * @category Attributes
 * @example
 *
 * ```js
 * $('.pear').addClass('fruit').html();
 * //=> <li class="pear fruit">Pear</li>
 *
 * $('.apple').addClass('fruit red').html();
 * //=> <li class="apple fruit red">Apple</li>
 * ```
 *
 * @param value - Name of new class.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/addClass/}
 */
function addClass(value) {
    // Support functions
    if (typeof value === 'function') {
        return domEach(this, (el, i) => {
            if (isTag(el)) {
                const className = el.attribs['class'] || '';
                addClass.call([el], value.call(el, i, className));
            }
        });
    }
    // Return if no value or not a string or function
    if (!value || typeof value !== 'string')
        return this;
    const classNames = value.split(rspace);
    const numElements = this.length;
    for (let i = 0; i < numElements; i++) {
        const el = this[i];
        // If selected element isn't a tag, move on
        if (!isTag(el))
            continue;
        // If we don't already have classes — always set xmlMode to false here, as it doesn't matter for classes
        const className = getAttr(el, 'class', false);
        if (!className) {
            setAttr(el, 'class', classNames.join(' ').trim());
        }
        else {
            let setClass = ` ${className} `;
            // Check if class already exists
            for (let j = 0; j < classNames.length; j++) {
                const appendClass = `${classNames[j]} `;
                if (!setClass.includes(` ${appendClass}`))
                    setClass += appendClass;
            }
            setAttr(el, 'class', setClass.trim());
        }
    }
    return this;
}
/**
 * Removes one or more space-separated classes from the selected elements. If no
 * `className` is defined, all classes will be removed. Also accepts a `function`.
 *
 * @category Attributes
 * @example
 *
 * ```js
 * $('.pear').removeClass('pear').html();
 * //=> <li class="">Pear</li>
 *
 * $('.apple').addClass('red').removeClass().html();
 * //=> <li class="">Apple</li>
 * ```
 *
 * @param name - Name of the class. If not specified, removes all elements.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/removeClass/}
 */
function removeClass(name) {
    // Handle if value is a function
    if (typeof name === 'function') {
        return domEach(this, (el, i) => {
            if (isTag(el)) {
                removeClass.call([el], name.call(el, i, el.attribs['class'] || ''));
            }
        });
    }
    const classes = splitNames(name);
    const numClasses = classes.length;
    const removeAll = arguments.length === 0;
    return domEach(this, (el) => {
        if (!isTag(el))
            return;
        if (removeAll) {
            // Short circuit the remove all case as this is the nice one
            el.attribs['class'] = '';
        }
        else {
            const elClasses = splitNames(el.attribs['class']);
            let changed = false;
            for (let j = 0; j < numClasses; j++) {
                const index = elClasses.indexOf(classes[j]);
                if (index >= 0) {
                    elClasses.splice(index, 1);
                    changed = true;
                    /*
                     * We have to do another pass to ensure that there are not duplicate
                     * classes listed
                     */
                    j--;
                }
            }
            if (changed) {
                el.attribs['class'] = elClasses.join(' ');
            }
        }
    });
}
/**
 * Add or remove class(es) from the matched elements, depending on either the
 * class's presence or the value of the switch argument. Also accepts a `function`.
 *
 * @category Attributes
 * @example
 *
 * ```js
 * $('.apple.green').toggleClass('fruit green red').html();
 * //=> <li class="apple fruit red">Apple</li>
 *
 * $('.apple.green').toggleClass('fruit green red', true).html();
 * //=> <li class="apple green fruit red">Apple</li>
 * ```
 *
 * @param value - Name of the class. Can also be a function.
 * @param stateVal - If specified the state of the class.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/toggleClass/}
 */
function toggleClass(value, stateVal) {
    // Support functions
    if (typeof value === 'function') {
        return domEach(this, (el, i) => {
            if (isTag(el)) {
                toggleClass.call([el], value.call(el, i, el.attribs['class'] || '', stateVal), stateVal);
            }
        });
    }
    // Return if no value or not a string or function
    if (!value || typeof value !== 'string')
        return this;
    const classNames = value.split(rspace);
    const numClasses = classNames.length;
    const state = typeof stateVal === 'boolean' ? (stateVal ? 1 : -1) : 0;
    const numElements = this.length;
    for (let i = 0; i < numElements; i++) {
        const el = this[i];
        // If selected element isn't a tag, move on
        if (!isTag(el))
            continue;
        const elementClasses = splitNames(el.attribs['class']);
        // Check if class already exists
        for (let j = 0; j < numClasses; j++) {
            // Check if the class name is currently defined
            const index = elementClasses.indexOf(classNames[j]);
            // Add if stateValue === true or we are toggling and there is no value
            if (state >= 0 && index < 0) {
                elementClasses.push(classNames[j]);
            }
            else if (state <= 0 && index >= 0) {
                // Otherwise remove but only if the item exists
                elementClasses.splice(index, 1);
            }
        }
        el.attribs['class'] = elementClasses.join(' ');
    }
    return this;
}

var Attributes = /*#__PURE__*/Object.freeze({
    __proto__: null,
    attr: attr,
    prop: prop,
    data: data,
    val: val,
    removeAttr: removeAttr,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass
});

/**
 * Methods for traversing the DOM structure.
 *
 * @module cheerio/traversing
 */
const reSiblingSelector = /^\s*[~+]/;
/**
 * Get the descendants of each element in the current set of matched elements,
 * filtered by a selector, jQuery object, or element.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').find('li').length;
 * //=> 3
 * $('#fruits').find($('.apple')).length;
 * //=> 1
 * ```
 *
 * @param selectorOrHaystack - Element to look for.
 * @returns The found elements.
 * @see {@link https://api.jquery.com/find/}
 */
function find(selectorOrHaystack) {
    var _a;
    if (!selectorOrHaystack) {
        return this._make([]);
    }
    const context = this.toArray();
    if (typeof selectorOrHaystack !== 'string') {
        const haystack = isCheerio(selectorOrHaystack)
            ? selectorOrHaystack.toArray()
            : [selectorOrHaystack];
        return this._make(haystack.filter((elem) => context.some((node) => contains(node, elem))));
    }
    const elems = reSiblingSelector.test(selectorOrHaystack)
        ? context
        : this.children().toArray();
    const options = {
        context,
        root: (_a = this._root) === null || _a === void 0 ? void 0 : _a[0],
        // Pass options that are recognized by `cheerio-select`
        xmlMode: this.options.xmlMode,
        lowerCaseTags: this.options.lowerCaseTags,
        lowerCaseAttributeNames: this.options.lowerCaseAttributeNames,
        pseudos: this.options.pseudos,
        quirksMode: this.options.quirksMode,
    };
    return this._make(select(selectorOrHaystack, elems, options));
}
/**
 * Creates a matcher, using a particular mapping function. Matchers provide a
 * function that finds elements using a generating function, supporting filtering.
 *
 * @private
 * @param matchMap - Mapping function.
 * @returns - Function for wrapping generating functions.
 */
function _getMatcher(matchMap) {
    return function (fn, ...postFns) {
        return function (selector) {
            var _a;
            let matched = matchMap(fn, this);
            if (selector) {
                matched = filterArray(matched, selector, this.options.xmlMode, (_a = this._root) === null || _a === void 0 ? void 0 : _a[0]);
            }
            return this._make(
            // Post processing is only necessary if there is more than one element.
            this.length > 1 && matched.length > 1
                ? postFns.reduce((elems, fn) => fn(elems), matched)
                : matched);
        };
    };
}
/** Matcher that adds multiple elements for each entry in the input. */
const _matcher = _getMatcher((fn, elems) => {
    const ret = [];
    for (let i = 0; i < elems.length; i++) {
        const value = fn(elems[i]);
        ret.push(value);
    }
    return new Array().concat(...ret);
});
/** Matcher that adds at most one element for each entry in the input. */
const _singleMatcher = _getMatcher((fn, elems) => {
    const ret = [];
    for (let i = 0; i < elems.length; i++) {
        const value = fn(elems[i]);
        if (value !== null) {
            ret.push(value);
        }
    }
    return ret;
});
/**
 * Matcher that supports traversing until a condition is met.
 *
 * @returns A function usable for `*Until` methods.
 */
function _matchUntil(nextElem, ...postFns) {
    // We use a variable here that is used from within the matcher.
    let matches = null;
    const innerMatcher = _getMatcher((nextElem, elems) => {
        const matched = [];
        domEach(elems, (elem) => {
            for (let next; (next = nextElem(elem)); elem = next) {
                // FIXME: `matched` might contain duplicates here and the index is too large.
                if (matches === null || matches === void 0 ? void 0 : matches(next, matched.length))
                    break;
                matched.push(next);
            }
        });
        return matched;
    })(nextElem, ...postFns);
    return function (selector, filterSelector) {
        // Override `matches` variable with the new target.
        matches =
            typeof selector === 'string'
                ? (elem) => is$1(elem, selector, this.options)
                : selector
                    ? getFilterFn(selector)
                    : null;
        const ret = innerMatcher.call(this, filterSelector);
        // Set `matches` to `null`, so we don't waste memory.
        matches = null;
        return ret;
    };
}
function _removeDuplicates(elems) {
    return Array.from(new Set(elems));
}
/**
 * Get the parent of each element in the current set of matched elements,
 * optionally filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').parent().attr('id');
 * //=> fruits
 * ```
 *
 * @param selector - If specified filter for parent.
 * @returns The parents.
 * @see {@link https://api.jquery.com/parent/}
 */
const parent = _singleMatcher(({ parent }) => (parent && !isDocument(parent) ? parent : null), _removeDuplicates);
/**
 * Get a set of parents filtered by `selector` of each element in the current
 * set of match elements.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.orange').parents().length;
 * //=> 2
 * $('.orange').parents('#fruits').length;
 * //=> 1
 * ```
 *
 * @param selector - If specified filter for parents.
 * @returns The parents.
 * @see {@link https://api.jquery.com/parents/}
 */
const parents = _matcher((elem) => {
    const matched = [];
    while (elem.parent && !isDocument(elem.parent)) {
        matched.push(elem.parent);
        elem = elem.parent;
    }
    return matched;
}, uniqueSort, (elems) => elems.reverse());
/**
 * Get the ancestors of each element in the current set of matched elements, up
 * to but not including the element matched by the selector, DOM node, or cheerio object.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.orange').parentsUntil('#food').length;
 * //=> 1
 * ```
 *
 * @param selector - Selector for element to stop at.
 * @param filterSelector - Optional filter for parents.
 * @returns The parents.
 * @see {@link https://api.jquery.com/parentsUntil/}
 */
const parentsUntil = _matchUntil(({ parent }) => (parent && !isDocument(parent) ? parent : null), uniqueSort, (elems) => elems.reverse());
/**
 * For each element in the set, get the first element that matches the selector
 * by testing the element itself and traversing up through its ancestors in the DOM tree.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.orange').closest();
 * //=> []
 *
 * $('.orange').closest('.apple');
 * // => []
 *
 * $('.orange').closest('li');
 * //=> [<li class="orange">Orange</li>]
 *
 * $('.orange').closest('#fruits');
 * //=> [<ul id="fruits"> ... </ul>]
 * ```
 *
 * @param selector - Selector for the element to find.
 * @returns The closest nodes.
 * @see {@link https://api.jquery.com/closest/}
 */
function closest(selector) {
    var _a;
    const set = [];
    if (!selector) {
        return this._make(set);
    }
    const selectOpts = {
        xmlMode: this.options.xmlMode,
        root: (_a = this._root) === null || _a === void 0 ? void 0 : _a[0],
    };
    const selectFn = typeof selector === 'string'
        ? (elem) => is$1(elem, selector, selectOpts)
        : getFilterFn(selector);
    domEach(this, (elem) => {
        while (elem && isTag(elem)) {
            if (selectFn(elem, 0)) {
                // Do not add duplicate elements to the set
                if (!set.includes(elem)) {
                    set.push(elem);
                }
                break;
            }
            elem = elem.parent;
        }
    });
    return this._make(set);
}
/**
 * Gets the next sibling of the first selected element, optionally filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.apple').next().hasClass('orange');
 * //=> true
 * ```
 *
 * @param selector - If specified filter for sibling.
 * @returns The next nodes.
 * @see {@link https://api.jquery.com/next/}
 */
const next = _singleMatcher((elem) => nextElementSibling(elem));
/**
 * Gets all the following siblings of the first selected element, optionally
 * filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.apple').nextAll();
 * //=> [<li class="orange">Orange</li>, <li class="pear">Pear</li>]
 * $('.apple').nextAll('.orange');
 * //=> [<li class="orange">Orange</li>]
 * ```
 *
 * @param selector - If specified filter for siblings.
 * @returns The next nodes.
 * @see {@link https://api.jquery.com/nextAll/}
 */
const nextAll = _matcher((elem) => {
    const matched = [];
    while (elem.next) {
        elem = elem.next;
        if (isTag(elem))
            matched.push(elem);
    }
    return matched;
}, _removeDuplicates);
/**
 * Gets all the following siblings up to but not including the element matched
 * by the selector, optionally filtered by another selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.apple').nextUntil('.pear');
 * //=> [<li class="orange">Orange</li>]
 * ```
 *
 * @param selector - Selector for element to stop at.
 * @param filterSelector - If specified filter for siblings.
 * @returns The next nodes.
 * @see {@link https://api.jquery.com/nextUntil/}
 */
const nextUntil = _matchUntil((el) => nextElementSibling(el), _removeDuplicates);
/**
 * Gets the previous sibling of the first selected element optionally filtered
 * by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.orange').prev().hasClass('apple');
 * //=> true
 * ```
 *
 * @param selector - If specified filter for siblings.
 * @returns The previous nodes.
 * @see {@link https://api.jquery.com/prev/}
 */
const prev = _singleMatcher((elem) => prevElementSibling(elem));
/**
 * Gets all the preceding siblings of the first selected element, optionally
 * filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').prevAll();
 * //=> [<li class="orange">Orange</li>, <li class="apple">Apple</li>]
 *
 * $('.pear').prevAll('.orange');
 * //=> [<li class="orange">Orange</li>]
 * ```
 *
 * @param selector - If specified filter for siblings.
 * @returns The previous nodes.
 * @see {@link https://api.jquery.com/prevAll/}
 */
const prevAll = _matcher((elem) => {
    const matched = [];
    while (elem.prev) {
        elem = elem.prev;
        if (isTag(elem))
            matched.push(elem);
    }
    return matched;
}, _removeDuplicates);
/**
 * Gets all the preceding siblings up to but not including the element matched
 * by the selector, optionally filtered by another selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').prevUntil('.apple');
 * //=> [<li class="orange">Orange</li>]
 * ```
 *
 * @param selector - Selector for element to stop at.
 * @param filterSelector - If specified filter for siblings.
 * @returns The previous nodes.
 * @see {@link https://api.jquery.com/prevUntil/}
 */
const prevUntil = _matchUntil((el) => prevElementSibling(el), _removeDuplicates);
/**
 * Get the siblings of each element (excluding the element) in the set of
 * matched elements, optionally filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').siblings().length;
 * //=> 2
 *
 * $('.pear').siblings('.orange').length;
 * //=> 1
 * ```
 *
 * @param selector - If specified filter for siblings.
 * @returns The siblings.
 * @see {@link https://api.jquery.com/siblings/}
 */
const siblings = _matcher((elem) => getSiblings(elem).filter((el) => isTag(el) && el !== elem), uniqueSort);
/**
 * Gets the element children of each element in the set of matched elements.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').children().length;
 * //=> 3
 *
 * $('#fruits').children('.pear').text();
 * //=> Pear
 * ```
 *
 * @param selector - If specified filter for children.
 * @returns The children.
 * @see {@link https://api.jquery.com/children/}
 */
const children = _matcher((elem) => getChildren(elem).filter(isTag), _removeDuplicates);
/**
 * Gets the children of each element in the set of matched elements, including
 * text and comment nodes.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').contents().length;
 * //=> 3
 * ```
 *
 * @returns The children.
 * @see {@link https://api.jquery.com/contents/}
 */
function contents() {
    const elems = this.toArray().reduce((newElems, elem) => hasChildren(elem) ? newElems.concat(elem.children) : newElems, []);
    return this._make(elems);
}
/**
 * Iterates over a cheerio object, executing a function for each matched
 * element. When the callback is fired, the function is fired in the context of
 * the DOM element, so `this` refers to the current element, which is equivalent
 * to the function parameter `element`. To break out of the `each` loop early,
 * return with `false`.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * const fruits = [];
 *
 * $('li').each(function (i, elem) {
 *   fruits[i] = $(this).text();
 * });
 *
 * fruits.join(', ');
 * //=> Apple, Orange, Pear
 * ```
 *
 * @param fn - Function to execute.
 * @returns The instance itself, useful for chaining.
 * @see {@link https://api.jquery.com/each/}
 */
function each(fn) {
    let i = 0;
    const len = this.length;
    while (i < len && fn.call(this[i], i, this[i]) !== false)
        ++i;
    return this;
}
/**
 * Pass each element in the current matched set through a function, producing a
 * new Cheerio object containing the return values. The function can return an
 * individual data item or an array of data items to be inserted into the
 * resulting set. If an array is returned, the elements inside the array are
 * inserted into the set. If the function returns null or undefined, no element
 * will be inserted.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li')
 *   .map(function (i, el) {
 *     // this === el
 *     return $(this).text();
 *   })
 *   .toArray()
 *   .join(' ');
 * //=> "apple orange pear"
 * ```
 *
 * @param fn - Function to execute.
 * @returns The mapped elements, wrapped in a Cheerio collection.
 * @see {@link https://api.jquery.com/map/}
 */
function map(fn) {
    let elems = [];
    for (let i = 0; i < this.length; i++) {
        const el = this[i];
        const val = fn.call(el, i, el);
        if (val != null) {
            elems = elems.concat(val);
        }
    }
    return this._make(elems);
}
/**
 * Creates a function to test if a filter is matched.
 *
 * @param match - A filter.
 * @returns A function that determines if a filter has been matched.
 */
function getFilterFn(match) {
    if (typeof match === 'function') {
        return (el, i) => match.call(el, i, el);
    }
    if (isCheerio(match)) {
        return (el) => Array.prototype.includes.call(match, el);
    }
    return function (el) {
        return match === el;
    };
}
function filter(match) {
    var _a;
    return this._make(filterArray(this.toArray(), match, this.options.xmlMode, (_a = this._root) === null || _a === void 0 ? void 0 : _a[0]));
}
function filterArray(nodes, match, xmlMode, root) {
    return typeof match === 'string'
        ? filter$1(match, nodes, { xmlMode, root })
        : nodes.filter(getFilterFn(match));
}
/**
 * Checks the current list of elements and returns `true` if _any_ of the
 * elements match the selector. If using an element or Cheerio selection,
 * returns `true` if _any_ of the elements match. If using a predicate function,
 * the function is executed in the context of the selected element, so `this`
 * refers to the current element.
 *
 * @category Attributes
 * @param selector - Selector for the selection.
 * @returns Whether or not the selector matches an element of the instance.
 * @see {@link https://api.jquery.com/is/}
 */
function is(selector) {
    const nodes = this.toArray();
    return typeof selector === 'string'
        ? some(nodes.filter(isTag), selector, this.options)
        : selector
            ? nodes.some(getFilterFn(selector))
            : false;
}
/**
 * Remove elements from the set of matched elements. Given a Cheerio object that
 * represents a set of DOM elements, the `.not()` method constructs a new
 * Cheerio object from a subset of the matching elements. The supplied selector
 * is tested against each element; the elements that don't match the selector
 * will be included in the result.
 *
 * The `.not()` method can take a function as its argument in the same way that
 * `.filter()` does. Elements for which the function returns `true` are excluded
 * from the filtered set; all other elements are included.
 *
 * @category Traversing
 * @example <caption>Selector</caption>
 *
 * ```js
 * $('li').not('.apple').length;
 * //=> 2
 * ```
 *
 * @example <caption>Function</caption>
 *
 * ```js
 * $('li').not(function (i, el) {
 *   // this === el
 *   return $(this).attr('class') === 'orange';
 * }).length; //=> 2
 * ```
 *
 * @param match - Value to look for, following the rules above.
 * @param container - Optional node to filter instead.
 * @returns The filtered collection.
 * @see {@link https://api.jquery.com/not/}
 */
function not(match) {
    let nodes = this.toArray();
    if (typeof match === 'string') {
        const matches = new Set(filter$1(match, nodes, this.options));
        nodes = nodes.filter((el) => !matches.has(el));
    }
    else {
        const filterFn = getFilterFn(match);
        nodes = nodes.filter((el, i) => !filterFn(el, i));
    }
    return this._make(nodes);
}
/**
 * Filters the set of matched elements to only those which have the given DOM
 * element as a descendant or which have a descendant that matches the given
 * selector. Equivalent to `.filter(':has(selector)')`.
 *
 * @category Traversing
 * @example <caption>Selector</caption>
 *
 * ```js
 * $('ul').has('.pear').attr('id');
 * //=> fruits
 * ```
 *
 * @example <caption>Element</caption>
 *
 * ```js
 * $('ul').has($('.pear')[0]).attr('id');
 * //=> fruits
 * ```
 *
 * @param selectorOrHaystack - Element to look for.
 * @returns The filtered collection.
 * @see {@link https://api.jquery.com/has/}
 */
function has(selectorOrHaystack) {
    return this.filter(typeof selectorOrHaystack === 'string'
        ? // Using the `:has` selector here short-circuits searches.
            `:has(${selectorOrHaystack})`
        : (_, el) => this._make(el).find(selectorOrHaystack).length > 0);
}
/**
 * Will select the first element of a cheerio object.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').children().first().text();
 * //=> Apple
 * ```
 *
 * @returns The first element.
 * @see {@link https://api.jquery.com/first/}
 */
function first() {
    return this.length > 1 ? this._make(this[0]) : this;
}
/**
 * Will select the last element of a cheerio object.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').children().last().text();
 * //=> Pear
 * ```
 *
 * @returns The last element.
 * @see {@link https://api.jquery.com/last/}
 */
function last() {
    return this.length > 0 ? this._make(this[this.length - 1]) : this;
}
/**
 * Reduce the set of matched elements to the one at the specified index. Use
 * `.eq(-i)` to count backwards from the last selected element.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').eq(0).text();
 * //=> Apple
 *
 * $('li').eq(-1).text();
 * //=> Pear
 * ```
 *
 * @param i - Index of the element to select.
 * @returns The element at the `i`th position.
 * @see {@link https://api.jquery.com/eq/}
 */
function eq(i) {
    var _a;
    i = +i;
    // Use the first identity optimization if possible
    if (i === 0 && this.length <= 1)
        return this;
    if (i < 0)
        i = this.length + i;
    return this._make((_a = this[i]) !== null && _a !== void 0 ? _a : []);
}
function get(i) {
    if (i == null) {
        return this.toArray();
    }
    return this[i < 0 ? this.length + i : i];
}
/**
 * Retrieve all the DOM elements contained in the jQuery set as an array.
 *
 * @example
 *
 * ```js
 * $('li').toArray();
 * //=> [ {...}, {...}, {...} ]
 * ```
 *
 * @returns The contained items.
 */
function toArray() {
    return Array.prototype.slice.call(this);
}
/**
 * Search for a given element from among the matched elements.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').index();
 * //=> 2 $('.orange').index('li');
 * //=> 1
 * $('.apple').index($('#fruit, li'));
 * //=> 1
 * ```
 *
 * @param selectorOrNeedle - Element to look for.
 * @returns The index of the element.
 * @see {@link https://api.jquery.com/index/}
 */
function index(selectorOrNeedle) {
    let $haystack;
    let needle;
    if (selectorOrNeedle == null) {
        $haystack = this.parent().children();
        needle = this[0];
    }
    else if (typeof selectorOrNeedle === 'string') {
        $haystack = this._make(selectorOrNeedle);
        needle = this[0];
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        $haystack = this;
        needle = isCheerio(selectorOrNeedle)
            ? selectorOrNeedle[0]
            : selectorOrNeedle;
    }
    return Array.prototype.indexOf.call($haystack, needle);
}
/**
 * Gets the elements matching the specified range (0-based position).
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').slice(1).eq(0).text();
 * //=> 'Orange'
 *
 * $('li').slice(1, 2).length;
 * //=> 1
 * ```
 *
 * @param start - A position at which the elements begin to be selected. If
 *   negative, it indicates an offset from the end of the set.
 * @param end - A position at which the elements stop being selected. If
 *   negative, it indicates an offset from the end of the set. If omitted, the
 *   range continues until the end of the set.
 * @returns The elements matching the specified range.
 * @see {@link https://api.jquery.com/slice/}
 */
function slice(start, end) {
    return this._make(Array.prototype.slice.call(this, start, end));
}
/**
 * End the most recent filtering operation in the current chain and return the
 * set of matched elements to its previous state.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').eq(0).end().length;
 * //=> 3
 * ```
 *
 * @returns The previous state of the set of matched elements.
 * @see {@link https://api.jquery.com/end/}
 */
function end() {
    var _a;
    return (_a = this.prevObject) !== null && _a !== void 0 ? _a : this._make([]);
}
/**
 * Add elements to the set of matched elements.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.apple').add('.orange').length;
 * //=> 2
 * ```
 *
 * @param other - Elements to add.
 * @param context - Optionally the context of the new selection.
 * @returns The combined set.
 * @see {@link https://api.jquery.com/add/}
 */
function add(other, context) {
    const selection = this._make(other, context);
    const contents = uniqueSort([...this.get(), ...selection.get()]);
    return this._make(contents);
}
/**
 * Add the previous set of elements on the stack to the current set, optionally
 * filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').eq(0).addBack('.orange').length;
 * //=> 2
 * ```
 *
 * @param selector - Selector for the elements to add.
 * @returns The combined set.
 * @see {@link https://api.jquery.com/addBack/}
 */
function addBack(selector) {
    return this.prevObject
        ? this.add(selector ? this.prevObject.filter(selector) : this.prevObject)
        : this;
}

var Traversing = /*#__PURE__*/Object.freeze({
    __proto__: null,
    find: find,
    parent: parent,
    parents: parents,
    parentsUntil: parentsUntil,
    closest: closest,
    next: next,
    nextAll: nextAll,
    nextUntil: nextUntil,
    prev: prev,
    prevAll: prevAll,
    prevUntil: prevUntil,
    siblings: siblings,
    children: children,
    contents: contents,
    each: each,
    map: map,
    filter: filter,
    filterArray: filterArray,
    is: is,
    not: not,
    has: has,
    first: first,
    last: last,
    eq: eq,
    get: get,
    toArray: toArray,
    index: index,
    slice: slice,
    end: end,
    add: add,
    addBack: addBack
});

/**
 * Get the parse function with options.
 *
 * @param parser - The parser function.
 * @returns The parse function with options.
 */
function getParse(parser) {
    /**
     * Parse a HTML string or a node.
     *
     * @param content - The HTML string or node.
     * @param options - The parser options.
     * @param isDocument - If `content` is a document.
     * @param context - The context node in the DOM tree.
     * @returns The parsed document node.
     */
    return function parse(content, options, isDocument$1, context) {
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(content)) {
            content = content.toString();
        }
        if (typeof content === 'string') {
            return parser(content, options, isDocument$1, context);
        }
        const doc = content;
        if (!Array.isArray(doc) && isDocument(doc)) {
            // If `doc` is already a root, just return it
            return doc;
        }
        // Add conent to new root element
        const root = new Document([]);
        // Update the DOM using the root
        update(doc, root);
        return root;
    };
}
/**
 * Update the dom structure, for one changed layer.
 *
 * @param newChilds - The new children.
 * @param parent - The new parent.
 * @returns The parent node.
 */
function update(newChilds, parent) {
    // Normalize
    const arr = Array.isArray(newChilds) ? newChilds : [newChilds];
    // Update parent
    if (parent) {
        parent.children = arr;
    }
    else {
        parent = null;
    }
    // Update neighbors
    for (let i = 0; i < arr.length; i++) {
        const node = arr[i];
        // Cleanly remove existing nodes from their previous structures.
        if (node.parent && node.parent.children !== arr) {
            removeElement(node);
        }
        if (parent) {
            node.prev = arr[i - 1] || null;
            node.next = arr[i + 1] || null;
        }
        else {
            node.prev = node.next = null;
        }
        node.parent = parent;
    }
    return parent;
}

/**
 * Methods for modifying the DOM structure.
 *
 * @module cheerio/manipulation
 */
/**
 * Create an array of nodes, recursing into arrays and parsing strings if necessary.
 *
 * @private
 * @category Manipulation
 * @param elem - Elements to make an array of.
 * @param clone - Optionally clone nodes.
 * @returns The array of nodes.
 */
function _makeDomArray(elem, clone) {
    if (elem == null) {
        return [];
    }
    if (isCheerio(elem)) {
        return clone ? cloneDom(elem.get()) : elem.get();
    }
    if (Array.isArray(elem)) {
        return elem.reduce((newElems, el) => newElems.concat(this._makeDomArray(el, clone)), []);
    }
    if (typeof elem === 'string') {
        return this._parse(elem, this.options, false, null).children;
    }
    return clone ? cloneDom([elem]) : [elem];
}
function _insert(concatenator) {
    return function (...elems) {
        const lastIdx = this.length - 1;
        return domEach(this, (el, i) => {
            if (!hasChildren(el))
                return;
            const domSrc = typeof elems[0] === 'function'
                ? elems[0].call(el, i, this._render(el.children))
                : elems;
            const dom = this._makeDomArray(domSrc, i < lastIdx);
            concatenator(dom, el.children, el);
        });
    };
}
/**
 * Modify an array in-place, removing some number of elements and adding new
 * elements directly following them.
 *
 * @private
 * @category Manipulation
 * @param array - Target array to splice.
 * @param spliceIdx - Index at which to begin changing the array.
 * @param spliceCount - Number of elements to remove from the array.
 * @param newElems - Elements to insert into the array.
 * @param parent - The parent of the node.
 * @returns The spliced array.
 */
function uniqueSplice(array, spliceIdx, spliceCount, newElems, parent) {
    var _a, _b;
    const spliceArgs = [
        spliceIdx,
        spliceCount,
        ...newElems,
    ];
    const prev = spliceIdx === 0 ? null : array[spliceIdx - 1];
    const next = spliceIdx + spliceCount >= array.length
        ? null
        : array[spliceIdx + spliceCount];
    /*
     * Before splicing in new elements, ensure they do not already appear in the
     * current array.
     */
    for (let idx = 0; idx < newElems.length; ++idx) {
        const node = newElems[idx];
        const oldParent = node.parent;
        if (oldParent) {
            const oldSiblings = oldParent.children;
            const prevIdx = oldSiblings.indexOf(node);
            if (prevIdx > -1) {
                oldParent.children.splice(prevIdx, 1);
                if (parent === oldParent && spliceIdx > prevIdx) {
                    spliceArgs[0]--;
                }
            }
        }
        node.parent = parent;
        if (node.prev) {
            node.prev.next = (_a = node.next) !== null && _a !== void 0 ? _a : null;
        }
        if (node.next) {
            node.next.prev = (_b = node.prev) !== null && _b !== void 0 ? _b : null;
        }
        node.prev = idx === 0 ? prev : newElems[idx - 1];
        node.next = idx === newElems.length - 1 ? next : newElems[idx + 1];
    }
    if (prev) {
        prev.next = newElems[0];
    }
    if (next) {
        next.prev = newElems[newElems.length - 1];
    }
    return array.splice(...spliceArgs);
}
/**
 * Insert every element in the set of matched elements to the end of the target.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('<li class="plum">Plum</li>').appendTo('#fruits');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //      <li class="plum">Plum</li>
 * //    </ul>
 * ```
 *
 * @param target - Element to append elements to.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/appendTo/}
 */
function appendTo(target) {
    const appendTarget = isCheerio(target) ? target : this._make(target);
    appendTarget.append(this);
    return this;
}
/**
 * Insert every element in the set of matched elements to the beginning of the target.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('<li class="plum">Plum</li>').prependTo('#fruits');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param target - Element to prepend elements to.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/prependTo/}
 */
function prependTo(target) {
    const prependTarget = isCheerio(target) ? target : this._make(target);
    prependTarget.prepend(this);
    return this;
}
/**
 * Inserts content as the _last_ child of each of the selected elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('ul').append('<li class="plum">Plum</li>');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //      <li class="plum">Plum</li>
 * //    </ul>
 * ```
 *
 * @see {@link https://api.jquery.com/append/}
 */
const append = _insert((dom, children, parent) => {
    uniqueSplice(children, children.length, 0, dom, parent);
});
/**
 * Inserts content as the _first_ child of each of the selected elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('ul').prepend('<li class="plum">Plum</li>');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @see {@link https://api.jquery.com/prepend/}
 */
const prepend = _insert((dom, children, parent) => {
    uniqueSplice(children, 0, 0, dom, parent);
});
function _wrap(insert) {
    return function (wrapper) {
        const lastIdx = this.length - 1;
        const lastParent = this.parents().last();
        for (let i = 0; i < this.length; i++) {
            const el = this[i];
            const wrap = typeof wrapper === 'function'
                ? wrapper.call(el, i, el)
                : typeof wrapper === 'string' && !isHtml(wrapper)
                    ? lastParent.find(wrapper).clone()
                    : wrapper;
            const [wrapperDom] = this._makeDomArray(wrap, i < lastIdx);
            if (!wrapperDom || !hasChildren(wrapperDom))
                continue;
            let elInsertLocation = wrapperDom;
            /*
             * Find the deepest child. Only consider the first tag child of each node
             * (ignore text); stop if no children are found.
             */
            let j = 0;
            while (j < elInsertLocation.children.length) {
                const child = elInsertLocation.children[j];
                if (isTag(child)) {
                    elInsertLocation = child;
                    j = 0;
                }
                else {
                    j++;
                }
            }
            insert(el, elInsertLocation, [wrapperDom]);
        }
        return this;
    };
}
/**
 * The .wrap() function can take any string or object that could be passed to
 * the $() factory function to specify a DOM structure. This structure may be
 * nested several levels deep, but should contain only one inmost element. A
 * copy of this structure will be wrapped around each of the elements in the set
 * of matched elements. This method returns the original set of elements for
 * chaining purposes.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * const redFruit = $('<div class="red-fruit"></div>');
 * $('.apple').wrap(redFruit);
 *
 * //=> <ul id="fruits">
 * //     <div class="red-fruit">
 * //      <li class="apple">Apple</li>
 * //     </div>
 * //     <li class="orange">Orange</li>
 * //     <li class="plum">Plum</li>
 * //   </ul>
 *
 * const healthy = $('<div class="healthy"></div>');
 * $('li').wrap(healthy);
 *
 * //=> <ul id="fruits">
 * //     <div class="healthy">
 * //       <li class="apple">Apple</li>
 * //     </div>
 * //     <div class="healthy">
 * //       <li class="orange">Orange</li>
 * //     </div>
 * //     <div class="healthy">
 * //        <li class="plum">Plum</li>
 * //     </div>
 * //   </ul>
 * ```
 *
 * @param wrapper - The DOM structure to wrap around each element in the selection.
 * @see {@link https://api.jquery.com/wrap/}
 */
const wrap = _wrap((el, elInsertLocation, wrapperDom) => {
    const { parent } = el;
    if (!parent)
        return;
    const siblings = parent.children;
    const index = siblings.indexOf(el);
    update([el], elInsertLocation);
    /*
     * The previous operation removed the current element from the `siblings`
     * array, so the `dom` array can be inserted without removing any
     * additional elements.
     */
    uniqueSplice(siblings, index, 0, wrapperDom, parent);
});
/**
 * The .wrapInner() function can take any string or object that could be passed
 * to the $() factory function to specify a DOM structure. This structure may be
 * nested several levels deep, but should contain only one inmost element. The
 * structure will be wrapped around the content of each of the elements in the
 * set of matched elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * const redFruit = $('<div class="red-fruit"></div>');
 * $('.apple').wrapInner(redFruit);
 *
 * //=> <ul id="fruits">
 * //     <li class="apple">
 * //       <div class="red-fruit">Apple</div>
 * //     </li>
 * //     <li class="orange">Orange</li>
 * //     <li class="pear">Pear</li>
 * //   </ul>
 *
 * const healthy = $('<div class="healthy"></div>');
 * $('li').wrapInner(healthy);
 *
 * //=> <ul id="fruits">
 * //     <li class="apple">
 * //       <div class="healthy">Apple</div>
 * //     </li>
 * //     <li class="orange">
 * //       <div class="healthy">Orange</div>
 * //     </li>
 * //     <li class="pear">
 * //       <div class="healthy">Pear</div>
 * //     </li>
 * //   </ul>
 * ```
 *
 * @param wrapper - The DOM structure to wrap around the content of each element
 *   in the selection.
 * @returns The instance itself, for chaining.
 * @see {@link https://api.jquery.com/wrapInner/}
 */
const wrapInner = _wrap((el, elInsertLocation, wrapperDom) => {
    if (!hasChildren(el))
        return;
    update(el.children, elInsertLocation);
    update(wrapperDom, el);
});
/**
 * The .unwrap() function, removes the parents of the set of matched elements
 * from the DOM, leaving the matched elements in their place.
 *
 * @category Manipulation
 * @example <caption>without selector</caption>
 *
 * ```js
 * const $ = cheerio.load(
 *   '<div id=test>\n  <div><p>Hello</p></div>\n  <div><p>World</p></div>\n</div>'
 * );
 * $('#test p').unwrap();
 *
 * //=> <div id=test>
 * //     <p>Hello</p>
 * //     <p>World</p>
 * //   </div>
 * ```
 *
 * @example <caption>with selector</caption>
 *
 * ```js
 * const $ = cheerio.load(
 *   '<div id=test>\n  <p>Hello</p>\n  <b><p>World</p></b>\n</div>'
 * );
 * $('#test p').unwrap('b');
 *
 * //=> <div id=test>
 * //     <p>Hello</p>
 * //     <p>World</p>
 * //   </div>
 * ```
 *
 * @param selector - A selector to check the parent element against. If an
 *   element's parent does not match the selector, the element won't be unwrapped.
 * @returns The instance itself, for chaining.
 * @see {@link https://api.jquery.com/unwrap/}
 */
function unwrap(selector) {
    this.parent(selector)
        .not('body')
        .each((_, el) => {
        this._make(el).replaceWith(el.children);
    });
    return this;
}
/**
 * The .wrapAll() function can take any string or object that could be passed to
 * the $() function to specify a DOM structure. This structure may be nested
 * several levels deep, but should contain only one inmost element. The
 * structure will be wrapped around all of the elements in the set of matched
 * elements, as a single group.
 *
 * @category Manipulation
 * @example <caption>With markup passed to `wrapAll`</caption>
 *
 * ```js
 * const $ = cheerio.load(
 *   '<div class="container"><div class="inner">First</div><div class="inner">Second</div></div>'
 * );
 * $('.inner').wrapAll("<div class='new'></div>");
 *
 * //=> <div class="container">
 * //     <div class='new'>
 * //       <div class="inner">First</div>
 * //       <div class="inner">Second</div>
 * //     </div>
 * //   </div>
 * ```
 *
 * @example <caption>With an existing cheerio instance</caption>
 *
 * ```js
 * const $ = cheerio.load(
 *   '<span>Span 1</span><strong>Strong</strong><span>Span 2</span>'
 * );
 * const wrap = $('<div><p><em><b></b></em></p></div>');
 * $('span').wrapAll(wrap);
 *
 * //=> <div>
 * //     <p>
 * //       <em>
 * //         <b>
 * //           <span>Span 1</span>
 * //           <span>Span 2</span>
 * //         </b>
 * //       </em>
 * //     </p>
 * //   </div>
 * //   <strong>Strong</strong>
 * ```
 *
 * @param wrapper - The DOM structure to wrap around all matched elements in the
 *   selection.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/wrapAll/}
 */
function wrapAll(wrapper) {
    const el = this[0];
    if (el) {
        const wrap = this._make(typeof wrapper === 'function' ? wrapper.call(el, 0, el) : wrapper).insertBefore(el);
        // If html is given as wrapper, wrap may contain text elements
        let elInsertLocation;
        for (let i = 0; i < wrap.length; i++) {
            if (wrap[i].type === 'tag')
                elInsertLocation = wrap[i];
        }
        let j = 0;
        /*
         * Find the deepest child. Only consider the first tag child of each node
         * (ignore text); stop if no children are found.
         */
        while (elInsertLocation && j < elInsertLocation.children.length) {
            const child = elInsertLocation.children[j];
            if (child.type === 'tag') {
                elInsertLocation = child;
                j = 0;
            }
            else {
                j++;
            }
        }
        if (elInsertLocation)
            this._make(elInsertLocation).append(this);
    }
    return this;
}
/* eslint-disable jsdoc/check-param-names*/
/**
 * Insert content next to each element in the set of matched elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('.apple').after('<li class="plum">Plum</li>');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="plum">Plum</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param content - HTML string, DOM element, array of DOM elements or Cheerio
 *   to insert after each element in the set of matched elements.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/after/}
 */
function after(...elems) {
    const lastIdx = this.length - 1;
    return domEach(this, (el, i) => {
        const { parent } = el;
        if (!hasChildren(el) || !parent) {
            return;
        }
        const siblings = parent.children;
        const index = siblings.indexOf(el);
        // If not found, move on
        /* istanbul ignore next */
        if (index < 0)
            return;
        const domSrc = typeof elems[0] === 'function'
            ? elems[0].call(el, i, this._render(el.children))
            : elems;
        const dom = this._makeDomArray(domSrc, i < lastIdx);
        // Add element after `this` element
        uniqueSplice(siblings, index + 1, 0, dom, parent);
    });
}
/* eslint-enable jsdoc/check-param-names*/
/**
 * Insert every element in the set of matched elements after the target.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('<li class="plum">Plum</li>').insertAfter('.apple');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="plum">Plum</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param target - Element to insert elements after.
 * @returns The set of newly inserted elements.
 * @see {@link https://api.jquery.com/insertAfter/}
 */
function insertAfter(target) {
    if (typeof target === 'string') {
        target = this._make(target);
    }
    this.remove();
    const clones = [];
    this._makeDomArray(target).forEach((el) => {
        const clonedSelf = this.clone().toArray();
        const { parent } = el;
        if (!parent) {
            return;
        }
        const siblings = parent.children;
        const index = siblings.indexOf(el);
        // If not found, move on
        /* istanbul ignore next */
        if (index < 0)
            return;
        // Add cloned `this` element(s) after target element
        uniqueSplice(siblings, index + 1, 0, clonedSelf, parent);
        clones.push(...clonedSelf);
    });
    return this._make(clones);
}
/* eslint-disable jsdoc/check-param-names*/
/**
 * Insert content previous to each element in the set of matched elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('.apple').before('<li class="plum">Plum</li>');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param content - HTML string, DOM element, array of DOM elements or Cheerio
 *   to insert before each element in the set of matched elements.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/before/}
 */
function before(...elems) {
    const lastIdx = this.length - 1;
    return domEach(this, (el, i) => {
        const { parent } = el;
        if (!hasChildren(el) || !parent) {
            return;
        }
        const siblings = parent.children;
        const index = siblings.indexOf(el);
        // If not found, move on
        /* istanbul ignore next */
        if (index < 0)
            return;
        const domSrc = typeof elems[0] === 'function'
            ? elems[0].call(el, i, this._render(el.children))
            : elems;
        const dom = this._makeDomArray(domSrc, i < lastIdx);
        // Add element before `el` element
        uniqueSplice(siblings, index, 0, dom, parent);
    });
}
/* eslint-enable jsdoc/check-param-names*/
/**
 * Insert every element in the set of matched elements before the target.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('<li class="plum">Plum</li>').insertBefore('.apple');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param target - Element to insert elements before.
 * @returns The set of newly inserted elements.
 * @see {@link https://api.jquery.com/insertBefore/}
 */
function insertBefore(target) {
    const targetArr = this._make(target);
    this.remove();
    const clones = [];
    domEach(targetArr, (el) => {
        const clonedSelf = this.clone().toArray();
        const { parent } = el;
        if (!parent) {
            return;
        }
        const siblings = parent.children;
        const index = siblings.indexOf(el);
        // If not found, move on
        /* istanbul ignore next */
        if (index < 0)
            return;
        // Add cloned `this` element(s) after target element
        uniqueSplice(siblings, index, 0, clonedSelf, parent);
        clones.push(...clonedSelf);
    });
    return this._make(clones);
}
/**
 * Removes the set of matched elements from the DOM and all their children.
 * `selector` filters the set of matched elements to be removed.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('.pear').remove();
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //    </ul>
 * ```
 *
 * @param selector - Optional selector for elements to remove.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/remove/}
 */
function remove(selector) {
    // Filter if we have selector
    const elems = selector ? this.filter(selector) : this;
    domEach(elems, (el) => {
        removeElement(el);
        el.prev = el.next = el.parent = null;
    });
    return this;
}
/**
 * Replaces matched elements with `content`.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * const plum = $('<li class="plum">Plum</li>');
 * $('.pear').replaceWith(plum);
 * $.html();
 * //=> <ul id="fruits">
 * //     <li class="apple">Apple</li>
 * //     <li class="orange">Orange</li>
 * //     <li class="plum">Plum</li>
 * //   </ul>
 * ```
 *
 * @param content - Replacement for matched elements.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/replaceWith/}
 */
function replaceWith(content) {
    return domEach(this, (el, i) => {
        const { parent } = el;
        if (!parent) {
            return;
        }
        const siblings = parent.children;
        const cont = typeof content === 'function' ? content.call(el, i, el) : content;
        const dom = this._makeDomArray(cont);
        /*
         * In the case that `dom` contains nodes that already exist in other
         * structures, ensure those nodes are properly removed.
         */
        update(dom, null);
        const index = siblings.indexOf(el);
        // Completely remove old element
        uniqueSplice(siblings, index, 1, dom, parent);
        if (!dom.includes(el)) {
            el.parent = el.prev = el.next = null;
        }
    });
}
/**
 * Empties an element, removing all its children.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('ul').empty();
 * $.html();
 * //=>  <ul id="fruits"></ul>
 * ```
 *
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/empty/}
 */
function empty() {
    return domEach(this, (el) => {
        if (!hasChildren(el))
            return;
        el.children.forEach((child) => {
            child.next = child.prev = child.parent = null;
        });
        el.children.length = 0;
    });
}
function html$1(str) {
    if (str === undefined) {
        const el = this[0];
        if (!el || !hasChildren(el))
            return null;
        return this._render(el.children);
    }
    return domEach(this, (el) => {
        if (!hasChildren(el))
            return;
        el.children.forEach((child) => {
            child.next = child.prev = child.parent = null;
        });
        const content = isCheerio(str)
            ? str.toArray()
            : this._parse(`${str}`, this.options, false, el).children;
        update(content, el);
    });
}
/**
 * Turns the collection to a string. Alias for `.html()`.
 *
 * @category Manipulation
 * @returns The rendered document.
 */
function toString() {
    return this._render(this);
}
function text$1(str) {
    // If `str` is undefined, act as a "getter"
    if (str === undefined) {
        return text(this);
    }
    if (typeof str === 'function') {
        // Function support
        return domEach(this, (el, i) => this._make(el).text(str.call(el, i, text([el]))));
    }
    // Append text node to each selected elements
    return domEach(this, (el) => {
        if (!hasChildren(el))
            return;
        el.children.forEach((child) => {
            child.next = child.prev = child.parent = null;
        });
        const textNode = new Text(`${str}`);
        update(textNode, el);
    });
}
/**
 * Clone the cheerio object.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * const moreFruit = $('#fruits').clone();
 * ```
 *
 * @returns The cloned object.
 * @see {@link https://api.jquery.com/clone/}
 */
function clone() {
    return this._make(cloneDom(this.get()));
}

var Manipulation = /*#__PURE__*/Object.freeze({
    __proto__: null,
    _makeDomArray: _makeDomArray,
    appendTo: appendTo,
    prependTo: prependTo,
    append: append,
    prepend: prepend,
    wrap: wrap,
    wrapInner: wrapInner,
    unwrap: unwrap,
    wrapAll: wrapAll,
    after: after,
    insertAfter: insertAfter,
    before: before,
    insertBefore: insertBefore,
    remove: remove,
    replaceWith: replaceWith,
    empty: empty,
    html: html$1,
    toString: toString,
    text: text$1,
    clone: clone
});

/**
 * Set multiple CSS properties for every matched element.
 *
 * @category CSS
 * @param prop - The names of the properties.
 * @param val - The new values.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/css/}
 */
function css(prop, val) {
    if ((prop != null && val != null) ||
        // When `prop` is a "plain" object
        (typeof prop === 'object' && !Array.isArray(prop))) {
        return domEach(this, (el, i) => {
            if (isTag(el)) {
                // `prop` can't be an array here anymore.
                setCss(el, prop, val, i);
            }
        });
    }
    if (this.length === 0) {
        return undefined;
    }
    return getCss(this[0], prop);
}
/**
 * Set styles of all elements.
 *
 * @private
 * @param el - Element to set style of.
 * @param prop - Name of property.
 * @param value - Value to set property to.
 * @param idx - Optional index within the selection.
 */
function setCss(el, prop, value, idx) {
    if (typeof prop === 'string') {
        const styles = getCss(el);
        const val = typeof value === 'function' ? value.call(el, idx, styles[prop]) : value;
        if (val === '') {
            delete styles[prop];
        }
        else if (val != null) {
            styles[prop] = val;
        }
        el.attribs['style'] = stringify(styles);
    }
    else if (typeof prop === 'object') {
        Object.keys(prop).forEach((k, i) => {
            setCss(el, k, prop[k], i);
        });
    }
}
function getCss(el, prop) {
    if (!el || !isTag(el))
        return;
    const styles = parse(el.attribs['style']);
    if (typeof prop === 'string') {
        return styles[prop];
    }
    if (Array.isArray(prop)) {
        const newStyles = {};
        prop.forEach((item) => {
            if (styles[item] != null) {
                newStyles[item] = styles[item];
            }
        });
        return newStyles;
    }
    return styles;
}
/**
 * Stringify `obj` to styles.
 *
 * @private
 * @category CSS
 * @param obj - Object to stringify.
 * @returns The serialized styles.
 */
function stringify(obj) {
    return Object.keys(obj).reduce((str, prop) => `${str}${str ? ' ' : ''}${prop}: ${obj[prop]};`, '');
}
/**
 * Parse `styles`.
 *
 * @private
 * @category CSS
 * @param styles - Styles to be parsed.
 * @returns The parsed styles.
 */
function parse(styles) {
    styles = (styles || '').trim();
    if (!styles)
        return {};
    const obj = {};
    let key;
    for (const str of styles.split(';')) {
        const n = str.indexOf(':');
        // If there is no :, or if it is the first/last character, add to the previous item's value
        if (n < 1 || n === str.length - 1) {
            const trimmed = str.trimEnd();
            if (trimmed.length > 0 && key !== undefined) {
                obj[key] += `;${trimmed}`;
            }
        }
        else {
            key = str.slice(0, n).trim();
            obj[key] = str.slice(n + 1).trim();
        }
    }
    return obj;
}

var Css = /*#__PURE__*/Object.freeze({
    __proto__: null,
    css: css
});

/*
 * https://github.com/jquery/jquery/blob/2.1.3/src/manipulation/var/rcheckableType.js
 * https://github.com/jquery/jquery/blob/2.1.3/src/serialize.js
 */
const submittableSelector = 'input,select,textarea,keygen';
const r20 = /%20/g;
const rCRLF = /\r?\n/g;
/**
 * Encode a set of form elements as a string for submission.
 *
 * @category Forms
 * @example
 *
 * ```js
 * $('<form><input name="foo" value="bar" /></form>').serialize();
 * //=> 'foo=bar'
 * ```
 *
 * @returns The serialized form.
 * @see {@link https://api.jquery.com/serialize/}
 */
function serialize() {
    // Convert form elements into name/value objects
    const arr = this.serializeArray();
    // Serialize each element into a key/value string
    const retArr = arr.map((data) => `${encodeURIComponent(data.name)}=${encodeURIComponent(data.value)}`);
    // Return the resulting serialization
    return retArr.join('&').replace(r20, '+');
}
/**
 * Encode a set of form elements as an array of names and values.
 *
 * @category Forms
 * @example
 *
 * ```js
 * $('<form><input name="foo" value="bar" /></form>').serializeArray();
 * //=> [ { name: 'foo', value: 'bar' } ]
 * ```
 *
 * @returns The serialized form.
 * @see {@link https://api.jquery.com/serializeArray/}
 */
function serializeArray() {
    // Resolve all form elements from either forms or collections of form elements
    return this.map((_, elem) => {
        const $elem = this._make(elem);
        if (isTag(elem) && elem.name === 'form') {
            return $elem.find(submittableSelector).toArray();
        }
        return $elem.filter(submittableSelector).toArray();
    })
        .filter(
    // Verify elements have a name (`attr.name`) and are not disabled (`:enabled`)
    '[name!=""]:enabled' +
        // And cannot be clicked (`[type=submit]`) or are used in `x-www-form-urlencoded` (`[type=file]`)
        ':not(:submit, :button, :image, :reset, :file)' +
        // And are either checked/don't have a checkable state
        ':matches([checked], :not(:checkbox, :radio))'
    // Convert each of the elements to its value(s)
    )
        .map((_, elem) => {
        var _a;
        const $elem = this._make(elem);
        const name = $elem.attr('name'); // We have filtered for elements with a name before.
        // If there is no value set (e.g. `undefined`, `null`), then default value to empty
        const value = (_a = $elem.val()) !== null && _a !== void 0 ? _a : '';
        // If we have an array of values (e.g. `<select multiple>`), return an array of key/value pairs
        if (Array.isArray(value)) {
            return value.map((val) => 
            /*
             * We trim replace any line endings (e.g. `\r` or `\r\n` with `\r\n`) to guarantee consistency across platforms
             * These can occur inside of `<textarea>'s`
             */
            ({ name, value: val.replace(rCRLF, '\r\n') }));
        }
        // Otherwise (e.g. `<input type="text">`, return only one key/value pair
        return { name, value: value.replace(rCRLF, '\r\n') };
    })
        .toArray();
}

var Forms = /*#__PURE__*/Object.freeze({
    __proto__: null,
    serialize: serialize,
    serializeArray: serializeArray
});

class Cheerio {
    /**
     * Instance of cheerio. Methods are specified in the modules. Usage of this
     * constructor is not recommended. Please use `$.load` instead.
     *
     * @private
     * @param elements - The new selection.
     * @param root - Sets the root node.
     * @param options - Options for the instance.
     */
    constructor(elements, root, options) {
        this.length = 0;
        this.options = options;
        this._root = root;
        if (elements) {
            for (let idx = 0; idx < elements.length; idx++) {
                this[idx] = elements[idx];
            }
            this.length = elements.length;
        }
    }
}
/** Set a signature of the object. */
Cheerio.prototype.cheerio = '[cheerio object]';
/*
 * Make cheerio an array-like object
 */
Cheerio.prototype.splice = Array.prototype.splice;
// Support for (const element of $(...)) iteration:
Cheerio.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
// Plug in the API
Object.assign(Cheerio.prototype, Attributes, Traversing, Manipulation, Css, Forms);

function getLoad(parse, render) {
    /**
     * Create a querying function, bound to a document created from the provided markup.
     *
     * Note that similar to web browser contexts, this operation may introduce
     * `<html>`, `<head>`, and `<body>` elements; set `isDocument` to `false` to
     * switch to fragment mode and disable this.
     *
     * @param content - Markup to be loaded.
     * @param options - Options for the created instance.
     * @param isDocument - Allows parser to be switched to fragment mode.
     * @returns The loaded document.
     * @see {@link https://cheerio.js.org#loading} for additional usage information.
     */
    return function load(content, options, isDocument = true) {
        if (content == null) {
            throw new Error('cheerio.load() expects a string');
        }
        const internalOpts = { ...defaultOpts, ...flatten(options) };
        const initialRoot = parse(content, internalOpts, isDocument, null);
        /** Create an extended class here, so that extensions only live on one instance. */
        class LoadedCheerio extends Cheerio {
            _make(selector, context) {
                const cheerio = initialize(selector, context);
                cheerio.prevObject = this;
                return cheerio;
            }
            _parse(content, options, isDocument, context) {
                return parse(content, options, isDocument, context);
            }
            _render(dom) {
                return render(dom, this.options);
            }
        }
        function initialize(selector, context, root = initialRoot, opts) {
            // $($)
            if (selector && isCheerio(selector))
                return selector;
            const options = {
                ...internalOpts,
                ...flatten(opts),
            };
            const r = typeof root === 'string'
                ? [parse(root, options, false, null)]
                : 'length' in root
                    ? root
                    : [root];
            const rootInstance = isCheerio(r)
                ? r
                : new LoadedCheerio(r, null, options);
            // Add a cyclic reference, so that calling methods on `_root` never fails.
            rootInstance._root = rootInstance;
            // $(), $(null), $(undefined), $(false)
            if (!selector) {
                return new LoadedCheerio(undefined, rootInstance, options);
            }
            const elements = typeof selector === 'string' && isHtml(selector)
                ? // $(<html>)
                    parse(selector, options, false, null).children
                : isNode(selector)
                    ? // $(dom)
                        [selector]
                    : Array.isArray(selector)
                        ? // $([dom])
                            selector
                        : undefined;
            const instance = new LoadedCheerio(elements, rootInstance, options);
            if (elements) {
                return instance;
            }
            if (typeof selector !== 'string') {
                throw new Error('Unexpected type of selector');
            }
            // We know that our selector is a string now.
            let search = selector;
            const searchContext = !context
                ? // If we don't have a context, maybe we have a root, from loading
                    rootInstance
                : typeof context === 'string'
                    ? isHtml(context)
                        ? // $('li', '<ul>...</ul>')
                            new LoadedCheerio([parse(context, options, false, null)], rootInstance, options)
                        : // $('li', 'ul')
                            ((search = `${context} ${search}`), rootInstance)
                    : isCheerio(context)
                        ? // $('li', $)
                            context
                        : // $('li', node), $('li', [nodes])
                            new LoadedCheerio(Array.isArray(context) ? context : [context], rootInstance, options);
            // If we still don't have a context, return
            if (!searchContext)
                return instance;
            /*
             * #id, .class, tag
             */
            return searchContext.find(search);
        }
        // Add in static methods & properties
        Object.assign(initialize, staticMethods, {
            load,
            // `_root` and `_options` are used in static methods.
            _root: initialRoot,
            _options: internalOpts,
            // Add `fn` for plugins
            fn: LoadedCheerio.prototype,
            // Add the prototype here to maintain `instanceof` behavior.
            prototype: LoadedCheerio.prototype,
        });
        return initialize;
    };
}
function isNode(obj) {
    return (!!obj.name ||
        obj.type === 'root' ||
        obj.type === 'text' ||
        obj.type === 'comment');
}

/**
 * Parse the content with `parse5` in the context of the given `ParentNode`.
 *
 * @param content - The content to parse.
 * @param options - A set of options to use to parse.
 * @param isDocument - Whether to parse the content as a full HTML document.
 * @param context - The context in which to parse the content.
 * @returns The parsed content.
 */
function parseWithParse5(content, options, isDocument, context) {
    const opts = {
        scriptingEnabled: typeof options.scriptingEnabled === 'boolean'
            ? options.scriptingEnabled
            : true,
        treeAdapter: adapter,
        sourceCodeLocationInfo: options.sourceCodeLocationInfo,
    };
    return isDocument
        ? parse$2(content, opts)
        : parseFragment(context, content, opts);
}
const renderOpts = { treeAdapter: adapter };
/**
 * Renders the given DOM tree with `parse5` and returns the result as a string.
 *
 * @param dom - The DOM tree to render.
 * @returns The rendered document.
 */
function renderWithParse5(dom) {
    /*
     * `dom-serializer` passes over the special "root" node and renders the
     * node's children in its place. To mimic this behavior with `parse5`, an
     * equivalent operation must be applied to the input array.
     */
    const nodes = 'length' in dom ? dom : [dom];
    for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        if (isDocument(node)) {
            Array.prototype.splice.call(nodes, index, 1, ...node.children);
        }
    }
    let result = '';
    for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        result += serializeOuter(node, renderOpts);
    }
    return result;
}

/**
 * Types used in signatures of Cheerio methods.
 *
 * @category Cheerio
 */
const parse$1 = getParse((content, options, isDocument, context) => options.xmlMode || options._useHtmlParser2
    ? parseDocument(content, options)
    : parseWithParse5(content, options, isDocument, context));
// Duplicate docs due to https://github.com/TypeStrong/typedoc/issues/1616
/**
 * Create a querying function, bound to a document created from the provided markup.
 *
 * Note that similar to web browser contexts, this operation may introduce
 * `<html>`, `<head>`, and `<body>` elements; set `isDocument` to `false` to
 * switch to fragment mode and disable this.
 *
 * @param content - Markup to be loaded.
 * @param options - Options for the created instance.
 * @param isDocument - Allows parser to be switched to fragment mode.
 * @returns The loaded document.
 * @see {@link https://cheerio.js.org#loading} for additional usage information.
 */
const load = getLoad(parse$1, (dom, options) => options.xmlMode || options._useHtmlParser2
    ? renderWithHtmlparser2(dom, options)
    : renderWithParse5(dom));
/**
 * The default cheerio instance.
 *
 * @deprecated Use the function returned by `load` instead.
 */
var index$1 = load([]);
/**
 * In order to promote consistency with the jQuery library, users are encouraged
 * to instead use the static method of the same name.
 *
 * @deprecated
 * @example
 *
 * ```js
 * const $ = cheerio.load('<div><p></p></div>');
 *
 * $.contains($('div').get(0), $('p').get(0));
 * //=> true
 *
 * $.contains($('p').get(0), $('div').get(0));
 * //=> false
 * ```
 *
 * @returns {boolean}
 */
const { contains: contains$1 } = staticMethods;
/**
 * In order to promote consistency with the jQuery library, users are encouraged
 * to instead use the static method of the same name.
 *
 * @deprecated
 * @example
 *
 * ```js
 * const $ = cheerio.load('');
 *
 * $.merge([1, 2], [3, 4]);
 * //=> [1, 2, 3, 4]
 * ```
 */
const { merge: merge$1 } = staticMethods;
/**
 * In order to promote consistency with the jQuery library, users are encouraged
 * to instead use the static method of the same name as it is defined on the
 * "loaded" Cheerio factory function.
 *
 * @deprecated See {@link static/parseHTML}.
 * @example
 *
 * ```js
 * const $ = cheerio.load('');
 * $.parseHTML('<b>markup</b>');
 * ```
 */
const { parseHTML: parseHTML$1 } = staticMethods;
/**
 * Users seeking to access the top-level element of a parsed document should
 * instead use the `root` static method of a "loaded" Cheerio function.
 *
 * @deprecated
 * @example
 *
 * ```js
 * const $ = cheerio.load('');
 * $.root();
 * ```
 */
const { root: root$1 } = staticMethods;

export default index$1;
export { contains$1 as contains, html, load, merge$1 as merge, parseHTML$1 as parseHTML, root$1 as root, text, xml };
