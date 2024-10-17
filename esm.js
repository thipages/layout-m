import { getAttributes } from 'dry-html';

customElements.define(
    'list-m', class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.style.display = 'block';
        }
        set data(d) {
            const tag = this.getAttribute('template');
            this.createList(tag, d);
        }
        createList(tag, d) {
            let html = '';
            const namesWithNoPrefix = getAttributes(tag).map (v=>v.substring(2));
            for (const item of d) {
                html += `
                    <${tag}
                        ${allAttrs(namesWithNoPrefix, item).join('\n')}
                    ></${tag}>
                `;
            }
            this.innerHTML = html;
        }
    }
);
function allAttrs(props, obj) {
    return props.map (
        prop => attr(prop, obj[prop])
    )
}
function attr (name, value) {
    return `t-${name}="${value}"`
}
