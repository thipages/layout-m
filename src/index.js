import {defineCustomElement, getAttributes} from '@titsoft/dry-html'
import fetch from '@webreflection/fetch'
import MElement from '@titsoft/m-element'
customElements.define(
    'layout-m', class extends MElement {
        #tProps
        constructor() {
            super()
        }
        async init() {
            this.#tProps = getTAttribute(this)
            await initialize(this)
        }
        set data(d) {
            const tag = this.getAttribute('template')
            if (tag) {
                // remove t- prefix of template attributes
                const keys = getAttributes(tag).map(v=>v.substring(2))
                try {
                    defineCustomElement(tag)
                } catch (e) {}
                const root = this.getAttribute('root')
                const data = repath(d, root, keys, this.#tProps)
                this.innerHTML = this.createList(tag, data)
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
)
function allAttrs(props) {
    return Object.entries(props).map (
        ([name, value]) => `t-${name}="${value}"`
    )
}
function repath(data, root, keys, tProps) {
    const d = root ? data[root] : data
    const tPropsKeys = Object.keys(tProps)
    const _ = d.map(item => repathItem(item, keys, tPropsKeys, tProps))
    console.log(d)
    return _
}
function repathItem(item, keys, tPropsKeys, tProps) {
    return keys.reduce(
        (acc, key) => {
            if (tPropsKeys.includes(key)) {
                acc[key] = getObjectValueFromPath(item, tProps[key]) || ''
            } else {
                acc[key] = item[key] || ''
            }
            return acc
        }, {}
    )
}
const getObjectValueFromPath = (obj, path) => {
    const pathParts = path.split('.')
    console.log('yu',path)
    let o = obj
    while (pathParts.length && o) {
      o = o[pathParts.shift()]
    }
    return o
}
async function initialize(that) {
    const source = that.getAttribute('source')
    if (!source) return
    const data = await getSourceContent(source)
    if (!data) return
    that.data = data
}
async function getSourceContent(source) {
    if (source.substring(0,1) === '#') {
        const el = document.getElementById(source.substring(1))
        if (el) {
            try {
                const data = JSON.parse(el.textContent)
                return data//root ? data[root] : data
            } catch (e) {
                return false
            }
        }
    } else {
        try {
            const data = await fetch(source).json()
            return data//root ? data[root] : data 
        } catch (e) {
            return false
        }
    }
}

const pattern = /(?<content>t-\w[\-\w]+)/
function getTAttribute(element) {
    const tProps = {}
    const attributes = element.attributes
    for (let i = 0, len = attributes.length; i < len; i++) {
      const {nodeName, nodeValue} = attributes.item(i)
      const match = nodeName.match(pattern)
      if (match) {
        tProps[match.groups.content.substring(2)] = nodeValue
      }
    }
    return tProps
}