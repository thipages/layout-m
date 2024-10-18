// Id generator
const fixedId = ('dry-'+Math.random()).replace('.', '');
let count = 1;
const uid = ()  => fixedId + (count++);
//
const INNER = '#inner#';
// Placeholders matching any ASCII chars and dashed with  a t- prefix
const pattern = /\{(?<content>t-\w[\-\w]+)\}/;
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
    const refClone = template.content.cloneNode(true);
    const refData = computeAttributes(refClone);
    computeInnerText(refClone, refData);
    const attributes = new Set;
    for (const [, props] of refData) {
        for (const [type, map, event] of props) {
            attributes.add(map);
        }
    }
    return {refClone, refData, attributes:[...attributes]}
}
function checkTemplateIdValidity(templateId) {
    if (!templateId) return false
    const dashIndex = templateId.indexOf('-');
    return dashIndex !==0 & dashIndex !== -1
}
function defineCustomElement(templateId) {
    if (!checkTemplateIdValidity(templateId)) return
    const {refClone, refData} = setup(templateId);
    //
    customElements.define(templateId,
        class extends HTMLElement {
            constructor() {
                super();
            }
            connectedCallback() {
                this.style.display = 'block';
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
      const match = nodeValue.match(pattern);
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
            const match = element.textContent.match(pattern);
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

customElements.define(
    'list-m', class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.style.display = 'block';
            init(this);
        }
        set data(d) {
            const tag = this.getAttribute('template');
            try {
                defineCustomElement(tag);
            } catch (e) {}
            this.innerHTML = this.createList(tag, d);
        }
        createList(tag, d) {
            return d.map (
                props => `
                    <${tag}
                        ${allAttrs(props).join('\n')}
                    ></${tag}>
                `
            ).join('\n')
        }
    }
);
function allAttrs(props) {
    return Object.entries(props).map (
        ([name, value]) => `t-${name}="${value}"`
    )
}
async function init(that) {
    const source = that.getAttribute('source');
    if (!source) return
    const data = await getSourceContent(source);
    if (!data) return 
    that.data = data;
}
async function getSourceContent(source) {
    const el = document.getElementById(source);
    if (el) {
        try {
            const data = JSON.parse(el.textContent);
            return data
        } catch (e) {
            return false
        }
        
    } else {
        try {
            return await fetch$1(source).json()
        } catch (e) {
            return false
        }
    }

}
