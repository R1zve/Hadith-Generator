import { SelectorType, parse, isTraversal } from '/_snowpack/pkg/css-what.v6.1.0.js';
import { _compileToken, prepareContext } from '/_snowpack/pkg/css-select.v5.1.0.js';
export { aliases, filters, pseudos } from '/_snowpack/pkg/css-select.v5.1.0.js';
import * as DomUtils from '/_snowpack/pkg/domutils.v3.1.0.js';
import { isTag, find as find$1, uniqueSort, getChildren } from '/_snowpack/pkg/domutils.v3.1.0.js';
import { trueFunc } from '/_snowpack/pkg/boolbase.v1.0.0.js';

const filterNames = new Set([
    "first",
    "last",
    "eq",
    "gt",
    "nth",
    "lt",
    "even",
    "odd",
]);
function isFilter(s) {
    if (s.type !== "pseudo")
        return false;
    if (filterNames.has(s.name))
        return true;
    if (s.name === "not" && Array.isArray(s.data)) {
        // Only consider `:not` with embedded filters
        return s.data.some((s) => s.some(isFilter));
    }
    return false;
}
function getLimit(filter, data, partLimit) {
    const num = data != null ? parseInt(data, 10) : NaN;
    switch (filter) {
        case "first":
            return 1;
        case "nth":
        case "eq":
            return isFinite(num) ? (num >= 0 ? num + 1 : Infinity) : 0;
        case "lt":
            return isFinite(num)
                ? num >= 0
                    ? Math.min(num, partLimit)
                    : Infinity
                : 0;
        case "gt":
            return isFinite(num) ? Infinity : 0;
        case "odd":
            return 2 * partLimit;
        case "even":
            return 2 * partLimit - 1;
        case "last":
        case "not":
            return Infinity;
    }
}

function getDocumentRoot(node) {
    while (node.parent)
        node = node.parent;
    return node;
}
function groupSelectors(selectors) {
    const filteredSelectors = [];
    const plainSelectors = [];
    for (const selector of selectors) {
        if (selector.some(isFilter)) {
            filteredSelectors.push(selector);
        }
        else {
            plainSelectors.push(selector);
        }
    }
    return [plainSelectors, filteredSelectors];
}

const UNIVERSAL_SELECTOR = {
    type: SelectorType.Universal,
    namespace: null,
};
const SCOPE_PSEUDO = {
    type: SelectorType.Pseudo,
    name: "scope",
    data: null,
};
function is(element, selector, options = {}) {
    return some([element], selector, options);
}
function some(elements, selector, options = {}) {
    if (typeof selector === "function")
        return elements.some(selector);
    const [plain, filtered] = groupSelectors(parse(selector));
    return ((plain.length > 0 && elements.some(_compileToken(plain, options))) ||
        filtered.some((sel) => filterBySelector(sel, elements, options).length > 0));
}
function filterByPosition(filter, elems, data, options) {
    const num = typeof data === "string" ? parseInt(data, 10) : NaN;
    switch (filter) {
        case "first":
        case "lt":
            // Already done in `getLimit`
            return elems;
        case "last":
            return elems.length > 0 ? [elems[elems.length - 1]] : elems;
        case "nth":
        case "eq":
            return isFinite(num) && Math.abs(num) < elems.length
                ? [num < 0 ? elems[elems.length + num] : elems[num]]
                : [];
        case "gt":
            return isFinite(num) ? elems.slice(num + 1) : [];
        case "even":
            return elems.filter((_, i) => i % 2 === 0);
        case "odd":
            return elems.filter((_, i) => i % 2 === 1);
        case "not": {
            const filtered = new Set(filterParsed(data, elems, options));
            return elems.filter((e) => !filtered.has(e));
        }
    }
}
function filter(selector, elements, options = {}) {
    return filterParsed(parse(selector), elements, options);
}
/**
 * Filter a set of elements by a selector.
 *
 * Will return elements in the original order.
 *
 * @param selector Selector to filter by.
 * @param elements Elements to filter.
 * @param options Options for selector.
 */
function filterParsed(selector, elements, options) {
    if (elements.length === 0)
        return [];
    const [plainSelectors, filteredSelectors] = groupSelectors(selector);
    let found;
    if (plainSelectors.length) {
        const filtered = filterElements(elements, plainSelectors, options);
        // If there are no filters, just return
        if (filteredSelectors.length === 0) {
            return filtered;
        }
        // Otherwise, we have to do some filtering
        if (filtered.length) {
            found = new Set(filtered);
        }
    }
    for (let i = 0; i < filteredSelectors.length && (found === null || found === void 0 ? void 0 : found.size) !== elements.length; i++) {
        const filteredSelector = filteredSelectors[i];
        const missing = found
            ? elements.filter((e) => isTag(e) && !found.has(e))
            : elements;
        if (missing.length === 0)
            break;
        const filtered = filterBySelector(filteredSelector, elements, options);
        if (filtered.length) {
            if (!found) {
                /*
                 * If we haven't found anything before the last selector,
                 * just return what we found now.
                 */
                if (i === filteredSelectors.length - 1) {
                    return filtered;
                }
                found = new Set(filtered);
            }
            else {
                filtered.forEach((el) => found.add(el));
            }
        }
    }
    return typeof found !== "undefined"
        ? (found.size === elements.length
            ? elements
            : // Filter elements to preserve order
                elements.filter((el) => found.has(el)))
        : [];
}
function filterBySelector(selector, elements, options) {
    var _a;
    if (selector.some(isTraversal)) {
        /*
         * Get root node, run selector with the scope
         * set to all of our nodes.
         */
        const root = (_a = options.root) !== null && _a !== void 0 ? _a : getDocumentRoot(elements[0]);
        const opts = { ...options, context: elements, relativeSelector: false };
        selector.push(SCOPE_PSEUDO);
        return findFilterElements(root, selector, opts, true, elements.length);
    }
    // Performance optimization: If we don't have to traverse, just filter set.
    return findFilterElements(elements, selector, options, false, elements.length);
}
function select(selector, root, options = {}, limit = Infinity) {
    if (typeof selector === "function") {
        return find(root, selector);
    }
    const [plain, filtered] = groupSelectors(parse(selector));
    const results = filtered.map((sel) => findFilterElements(root, sel, options, true, limit));
    // Plain selectors can be queried in a single go
    if (plain.length) {
        results.push(findElements(root, plain, options, limit));
    }
    if (results.length === 0) {
        return [];
    }
    // If there was only a single selector, just return the result
    if (results.length === 1) {
        return results[0];
    }
    // Sort results, filtering for duplicates
    return uniqueSort(results.reduce((a, b) => [...a, ...b]));
}
/**
 *
 * @param root Element(s) to search from.
 * @param selector Selector to look for.
 * @param options Options for querying.
 * @param queryForSelector Query multiple levels deep for the initial selector, even if it doesn't contain a traversal.
 */
function findFilterElements(root, selector, options, queryForSelector, totalLimit) {
    const filterIndex = selector.findIndex(isFilter);
    const sub = selector.slice(0, filterIndex);
    const filter = selector[filterIndex];
    // If we are at the end of the selector, we can limit the number of elements to retrieve.
    const partLimit = selector.length - 1 === filterIndex ? totalLimit : Infinity;
    /*
     * Set the number of elements to retrieve.
     * Eg. for :first, we only have to get a single element.
     */
    const limit = getLimit(filter.name, filter.data, partLimit);
    if (limit === 0)
        return [];
    /*
     * Skip `findElements` call if our selector starts with a positional
     * pseudo.
     */
    const elemsNoLimit = sub.length === 0 && !Array.isArray(root)
        ? getChildren(root).filter(isTag)
        : sub.length === 0
            ? (Array.isArray(root) ? root : [root]).filter(isTag)
            : queryForSelector || sub.some(isTraversal)
                ? findElements(root, [sub], options, limit)
                : filterElements(root, [sub], options);
    const elems = elemsNoLimit.slice(0, limit);
    let result = filterByPosition(filter.name, elems, filter.data, options);
    if (result.length === 0 || selector.length === filterIndex + 1) {
        return result;
    }
    const remainingSelector = selector.slice(filterIndex + 1);
    const remainingHasTraversal = remainingSelector.some(isTraversal);
    if (remainingHasTraversal) {
        if (isTraversal(remainingSelector[0])) {
            const { type } = remainingSelector[0];
            if (type === SelectorType.Sibling ||
                type === SelectorType.Adjacent) {
                // If we have a sibling traversal, we need to also look at the siblings.
                result = prepareContext(result, DomUtils, true);
            }
            // Avoid a traversal-first selector error.
            remainingSelector.unshift(UNIVERSAL_SELECTOR);
        }
        options = {
            ...options,
            // Avoid absolutizing the selector
            relativeSelector: false,
            /*
             * Add a custom root func, to make sure traversals don't match elements
             * that aren't a part of the considered tree.
             */
            rootFunc: (el) => result.includes(el),
        };
    }
    else if (options.rootFunc && options.rootFunc !== trueFunc) {
        options = { ...options, rootFunc: trueFunc };
    }
    /*
     * If we have another filter, recursively call `findFilterElements`,
     * with the `recursive` flag disabled. We only have to look for more
     * elements when we see a traversal.
     *
     * Otherwise,
     */
    return remainingSelector.some(isFilter)
        ? findFilterElements(result, remainingSelector, options, false, totalLimit)
        : remainingHasTraversal
            ? // Query existing elements to resolve traversal.
                findElements(result, [remainingSelector], options, totalLimit)
            : // If we don't have any more traversals, simply filter elements.
                filterElements(result, [remainingSelector], options);
}
function findElements(root, sel, options, limit) {
    const query = _compileToken(sel, options, root);
    return find(root, query, limit);
}
function find(root, query, limit = Infinity) {
    const elems = prepareContext(root, DomUtils, query.shouldTestNextSiblings);
    return find$1((node) => isTag(node) && query(node), elems, true, limit);
}
function filterElements(elements, sel, options) {
    const els = (Array.isArray(elements) ? elements : [elements]).filter(isTag);
    if (els.length === 0)
        return els;
    const query = _compileToken(sel, options);
    return query === trueFunc ? els : els.filter(query);
}

export { filter, is, select, some };
