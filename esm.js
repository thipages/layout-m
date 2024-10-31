import { defineCustomElement } from '@titsoft/dry-html';

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

customElements.define(
    'layout-m', class extends HTMLParsedElement {
        constructor() {
            super();
        }
        parsedCallback() {
            this.style.display = 'block';
            init(this);
            // DEV: need to add setTimeout otherwise the node dies with its children
            if (this.hasAttribute('level-up')) {
                setTimeout(() => this.replaceWith(...this.children));
            }
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
