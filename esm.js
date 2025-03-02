/*! (c) Andrea Giammarchi - ISC */
const HTMLParsedElement = (() => {
  const DCL = 'DOMContentLoaded';
  const init = new WeakMap;
  const queue = [];
  const isParsed = el => {
    do {
      if (el.nextSibling)
        return true;
    } while (el = el.parentNode);
    return false;
  };
  const upgrade = () => {
    queue.splice(0).forEach(info => {
      if (init.get(info[0]) !== true) {
        init.set(info[0], true);
        info[0][info[1]]();
      }
    });
  };
  document.addEventListener(DCL, upgrade);
  class HTMLParsedElement extends HTMLElement {
    static withParsedCallback(Class, name = 'parsed') {
      const {prototype} = Class;
      const {connectedCallback} = prototype;
      const method = name + 'Callback';
      const cleanUp = (el, observer, ownerDocument, onDCL) => {
        observer.disconnect();
        ownerDocument.removeEventListener(DCL, onDCL);
        parsedCallback(el);
      };
      const parsedCallback = el => {
        if (!queue.length)
          requestAnimationFrame(upgrade);
        queue.push([el, method]);
      };
      Object.defineProperties(
        prototype,
        {
          connectedCallback: {
            configurable: true,
            writable: true,
            value() {
              if (connectedCallback)
                connectedCallback.apply(this, arguments);
              if (method in this && !init.has(this)) {
                const self = this;
                const {ownerDocument} = self;
                init.set(self, false);
                if (ownerDocument.readyState === 'complete' || isParsed(self))
                  parsedCallback(self);
                else {
                  const onDCL = () => cleanUp(self, observer, ownerDocument, onDCL);
                  ownerDocument.addEventListener(DCL, onDCL);
                  const observer = new MutationObserver(() => {
                    /* istanbul ignore else */
                    if (isParsed(self))
                      cleanUp(self, observer, ownerDocument, onDCL);
                  });
                  observer.observe(self.parentNode, {childList: true, subtree: true});
                }
              }
            }
          },
          [name]: {
            configurable: true,
            get() {
              return init.get(this) === true;
            }
          }
        }
      );
      return Class;
    }
  }
  return HTMLParsedElement.withParsedCallback(HTMLParsedElement);
})();

const isAsyncFunction$1 = fn => fn.constructor.name === 'AsyncFunction';
const replace = (that) => {
    if (that.hasAttribute('level-up')) {
        that.replaceWith(...that.children);
    }
};
let MElement$1 = class MElement extends HTMLParsedElement {
    #config
    constructor(config = {}) {
        super();
        this.#config = config;
    }
    connectedCallback() {
        if (this.parsed && this.#config.oneConnect) return
        super.connectedCallback();
    }
    parsedCallback() {
        if (this.init) {
            if (isAsyncFunction$1(this.init)) {
                this.init().then (
                    () => replace(this)
                );
            } else {
                this.init();
                replace(this);
            } 
        }                   
    }
};

// Id generator
const fixedId = ('dry-'+Math.random()).replace('.', '');
let count = 1;
const uid = ()  => fixedId + (count++);
//
const INNER = '#inner#';
// Placeholders matching any ASCII chars and dashed with  a t- prefix
const pattern$1 = /\{(?<content>t-\w[\-\w]+)\}/;
//
function getAttributes(templateId) {
    return setup(templateId).attributes
}
/**
 * refData is a Map
 *  key:  uniqueId
 *  value = array of placeholers properties <prop, map, event>
 *    - prop is either INNER or attributeName
 *    - map is the placeholder name (t-*)
 *    - event is the event name (attribute starting with on)
 * 
 * refClone is a clone of the template.
 * - it will be cloned for creating new instances
 */
function setup(templateId) {
    const template = document.getElementById(templateId);
    const tClass = template.getAttribute('class');
    const refClone = template.content.cloneNode(true);
    const refData = computeAttributes(refClone);
    computeInnerText(refClone, refData);
    const attributes = new Set;
    for (const [, props] of refData) {
        for (const [type, map, event] of props) {
            attributes.add(map);
        }
    }
    return {refClone, refData, attributes:[...attributes], tClass}
}
function checkTemplateIdValidity(templateId) {
    if (!templateId) return false
    const dashIndex = templateId.indexOf('-');
    return dashIndex !==0 & dashIndex !== -1
}
function defineCustomElement(templateId) {
    if (!checkTemplateIdValidity(templateId)) return
    const {refClone, refData, tClass} = setup(templateId);
    //
    customElements.define(templateId,
        class extends MElement$1 {
            constructor() {
                super();
            }
            init() {
                this.style.display = 'block';
                if (!this.hasAttribute('class')) this.setAttribute('class', tClass);
                this.tRefs = structuredClone(refData);
                this.append(refClone.cloneNode(true));
                setData(this);     
            }
        }
    );
}
function updateElement(el, prop, value) {
    if (prop === INNER) {
        el.innerText = value;
    } else {
        if (prop === 'class') {
            el.classList.remove(...el.classList);
            el.classList.add(value);
        } else {
            el.setAttribute(prop, value);
        }
    }
}
function setData(that) {
    const newIds = [];
    for (const d of that.tRefs) {
        const [id, subset] = d;
        const el = that.querySelector('#'+id);
        for (const [prop, map, event] of subset) {
            const value = that.getAttribute(map);
            updateElement(el, prop, value);
        }
        newIds.push([el, subset, id]);
    }
    // Renew ids, keeping them separated from refClone and refData
    for (const [el, subset, id] of newIds) {
        const newId = uid();
        el.setAttribute('id', newId);
        that.tRefs.set(newId, subset);
        that.tRefs.delete(id);
    }
}
function computeAttributes(clone) {
  const elements = clone.querySelectorAll('*');
  const map = new Map;
  for (const element of elements) {
    const attributes = element.attributes;
    for (let i = 0, len = attributes.length; i <len; i++) {
      const {nodeName, nodeValue} = attributes.item(i);
      const match = nodeValue.match(pattern$1);
      if (match) {
        const id = createIdIfNotExisting(element);
        if (!map.get(id)) map.set(id, []);
        // Event are identified and stored but not (yet) used
        const event = nodeName.substring(0,2) === 'on' ? {type: nodeName.substring(2)} : null;
        map.get(id).push([nodeName, match.groups.content, event]);
      }
    }
  }
  return map
}
function computeInnerText(clone, data) {
    walkHtmlElements(clone, function(element) {
        if (element.childElementCount === 0) {
            const match = element.textContent.match(pattern$1);
            if (match) {
                const id = createIdIfNotExisting(element);
                if (!data.get(id)) data.set(id, []);
                data.get(id).push([INNER, match.groups.content]);
            }
        }
    });
}
function createIdIfNotExisting(node) {
    let id = node.getAttribute('id');
    if (!id) {
        id = uid();
        node.setAttribute('id', id);
    }
    return id
}
function walkHtmlElements(element, callback) {
    callback(element);
    if (element.firstElementChild) {
        walkHtmlElements(element.firstElementChild, callback);
    }
    if (element.nextElementSibling) {
        walkHtmlElements(element.nextElementSibling, callback);
    }
}

// a bit terser code than I usually write but it's 10 LOC within 80 cols
// if you are struggling to follow the code you can replace 1-char
// references around with the following one, hoping that helps :-)

// d => descriptors
// k => key
// p => promise
// r => response

const d = Object.getOwnPropertyDescriptors(Response.prototype);

const isFunction = value => typeof value === 'function';

const bypass = (p, k, { get, value }) => get || !isFunction(value) ?
                p.then(r => r[k]) :
                (...args) => p.then(r => r[k](...args));

const direct = (p, value) => isFunction(value) ? value.bind(p) : value;

const handler = {
    get: (p, k) => d.hasOwnProperty(k) ? bypass(p, k, d[k]) : direct(p, p[k])
};

/**
 * @param {RequestInfo | URL} input
 * @param  {...RequestInit} init
 * @returns {Promise<Response> & Response}
 */
var fetch$1 = (input, ...init) => new Proxy(fetch(input, ...init), handler);

// Atribute
const LEVEL_UP = 'level-up';
// load/error status
const LOADED = 'loaded';
const ON_ERROR = 'onError';
// constructor config properties
const ON_LOAD_HTML = 'onLoadHtml';
const ON_ERROR_HTML = 'onErrorHtml';
// Error message for async init
const ERROR = 'm-element error';
//
const isAsyncFunction = fn => fn.constructor.name === 'AsyncFunction';
class MElement extends HTMLParsedElement {
    #config
    #fragment
    #slots
    constructor(config) {
        super();
        this.#config = config || {};
        this[ON_ERROR] = false;
        this[LOADED] = false;
    }
    #content(remove, textOnly) {
        const _ = this.#fragment;
        if (!_) return
        if (remove) this.#fragment = null;
        return textOnly ?  _.textContent : _
    }
    #finish (error) {
        this[LOADED] = true;
        this[ON_ERROR] = !!error;
        // Any errors will display onErrorHtml config property
        if (this[ON_ERROR]) {
            this.innerHTML = this.#config[ON_ERROR_HTML] || '';
        }
        if (this.hasAttribute(LEVEL_UP)) {
            this.replaceWith(...this.children);
        }
        // DEV: dispatchEvent runs after all changes
        this.dispatchEvent(new Event('load'));
    }
    originalFragment(remove = true) {
        return this.#content(remove, false)
    }
    originalText(remove = true) {
        return this.#content(remove, true)
    }
    parsedCallback() {
        const that = this;
        const end = (e) => that.#finish(e);
        // slots removal and storage
        this.#slots = this.querySelectorAll('slot');
        this.#slots.forEach(e => e.remove());
        // move childNodes to a fragment
        this.#fragment = document.createDocumentFragment();
        this.#fragment.append(...this.childNodes);
        // display onLoadHtml
        this.innerHTML = this.#config[ON_LOAD_HTML] || '';
        // manage async/sync init function
        if (this.init) {
            if (isAsyncFunction(this.init)) {
                this.init()
                    .then(() => end())
                    .catch((e)=> {
                        end(new Error(ERROR, {cause: e}));
                    });
            } else {
                this.init();
                end();
            } 
        } else {
            end();
        } 
    }
    getSlotByName(name) {
        return [...this.#slots].filter(e => name && e.name === name) [0]
    }
}

customElements.define(
    'layout-m', class extends MElement {
        #tProps
        constructor() {
            super();
        }
        async init() {
            this.#tProps = getTAttribute(this);
            await initialize(this);
        }
        set data(d) {
            const tag = this.getAttribute('template');
            if (tag) {
                // remove t- prefix of template attributes
                const keys = getAttributes(tag).map(v=>v.substring(2));
                try {
                    defineCustomElement(tag);
                } catch (e) {}
                const root = this.getAttribute('root');
                const data = repath(d, root, keys, this.#tProps);
                this.innerHTML = this.createList(tag, data);
            }
        }
        createList(tag, data) {
            return data.map (
                props => {
                    return `
                        <${tag}
                            ${allAttrs(props).join('\n')}
                        ></${tag}>
                    `
                }
            ).join('\n')
        }
    }
);
function allAttrs(props) {
    return Object.entries(props).map (
        ([name, value]) => `t-${name}="${value}"`
    )
}
function repath(data, root, keys, tProps) {
    const d = root ? data[root] : data;
    const tPropsKeys = Object.keys(tProps);
    const _ = d.map(item => repathItem(item, keys, tPropsKeys, tProps));
    return _
}
function repathItem(item, keys, tPropsKeys, tProps) {
    return keys.reduce(
        (acc, key) => {
            if (tPropsKeys.includes(key)) {
                acc[key] = getObjectValueFromPath(item, tProps[key]) || '';
            } else {
                acc[key] = item[key] || '';
            }
            return acc
        }, {}
    )
}
const getObjectValueFromPath = (obj, path) => {
    const pathParts = path.split('.');
    let o = obj;
    while (pathParts.length && o) {
      o = o[pathParts.shift()];
    }
    return o
};
async function initialize(that) {
    const source = that.getAttribute('source');
    if (!source) return
    const data = await getSourceContent(source);
    if (!data) return
    that.data = data;
}
async function getSourceContent(source) {
    if (source.substring(0,1) === '#') {
        const el = document.getElementById(source.substring(1));
        if (el) {
            try {
                const data = JSON.parse(el.textContent);
                return data//root ? data[root] : data
            } catch (e) {
                return false
            }
        }
    } else {
        try {
            const data = await fetch$1(source).json();
            return data//root ? data[root] : data 
        } catch (e) {
            return false
        }
    }
}

const pattern = /(?<content>t-\w[\-\w]+)/;
function getTAttribute(element) {
    const tProps = {};
    const attributes = element.attributes;
    for (let i = 0, len = attributes.length; i < len; i++) {
      const {nodeName, nodeValue} = attributes.item(i);
      const match = nodeName.match(pattern);
      if (match) {
        tProps[match.groups.content.substring(2)] = nodeValue;
      }
    }
    return tProps
}
