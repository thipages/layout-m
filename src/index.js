import {defineCustomElement} from '@titsoft/dry-html'
import fetch from '@webreflection/fetch'
import MElement from '@titsoft/m-element'
customElements.define(
    'layout-m', class extends MElement {
        constructor() {
            super()
        }
        async init() {
            await initialize(this)
        }
        set data(d) {
            const tag = this.getAttribute('template')
            if (tag) {
                try {
                    defineCustomElement(tag)
                } catch (e) {}
                this.innerHTML = this.createList(tag, d)
            }
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
)
function allAttrs(props) {
    return Object.entries(props).map (
        ([name, value]) => `t-${name}="${value}"`
    )
}
async function initialize(that) {
    const source = that.getAttribute('source')
    if (!source) return
    const data = await getSourceContent(source, that.getAttribute('root'))
    if (!data) return
    that.data = data
}
async function getSourceContent(source, root) {
    if (source.substring(0,1) === '#') {
        const el = document.getElementById(source.substring(1))
        if (el) {
            try {
                const data = JSON.parse(el.textContent)
                return root ? data[root] : data
            } catch (e) {
                return false
            }
        }
    } else {
        try {
            const data = await fetch(source).json()
            return root ? data[root] : data 
        } catch (e) {
            return false
        }
    }
}