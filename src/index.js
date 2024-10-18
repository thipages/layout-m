import {defineCustomElement} from 'dry-html'
import fetch from '@webreflection/fetch'
customElements.define(
    'list-m', class extends HTMLElement {
        constructor() {
            super()
        }
        connectedCallback() {
            this.style.display = 'block'
            init(this)
        }
        set data(d) {
            const tag = this.getAttribute('template')
            try {
                defineCustomElement(tag)
            } catch (e) {}
            this.innerHTML = this.createList(tag, d)
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
async function init(that) {
    const source = that.getAttribute('source')
    if (!source) return
    const data = await getSourceContent(source)
    if (!data) return 
    that.data = data
}
async function getSourceContent(source) {
    const el = document.getElementById(source)
    if (el) {
        try {
            const data = JSON.parse(el.textContent)
            console.log('data', data)
            return data
        } catch (e) {
            return false
        }
        
    } else {
        try {
            return await fetch(source).json()
        } catch (e) {
            return false
        }
    }

}