import {defineCustomElement} from 'dry-html'
import fetch from 'fetch'
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
    const data =  !source
        ? parseContent(that.textContent)
        : await getSourceContent(source)
    that.data = data
}
function parseContent(initialContent) {
    let header, fieldNum, propCount = 0, dataCount = 0, data = [{}]
    for (const line of initialContent.split('\n')) {
        const trimmedLine = extendedTrim(line)
        if (trimmedLine.replace(/\s/g, '') !=='') {
            if (!header) {
                header = line.split(',').map(v => extendedTrim(v))
                fieldNum = header.length
            } else {
                if (propCount === fieldNum) {
                    propCount = 1
                    dataCount++
                    data.push({[header[0]]: trimmedLine})
                } else {
                    propCount++
                    data[dataCount][header[propCount-1]]= trimmedLine
                }
            }
        }
    }
    return data
}
function getSourceContent(source) {
    return fetch(source).json()
}
function extendedTrim(s) {
    return s.replace(/^\s+|\s+$/g, '')
}