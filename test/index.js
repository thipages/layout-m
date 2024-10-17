import {} from './../src/index.js'

const allLists =  [...document.getElementsByTagName('list-m')]
const descriptions = [
    'test with inner content',
    'test with json file',
]
const allExpected = [
    'name1,1,name2,2,name3,3',
    'fname1,1,fname2,2,fname3,3'
]
setTimeout(run, 1000)
function run() {
    const allObserved = allLists.map(
        list => [... list.children].map(infoList => {
            return [... infoList.children].map (
                div => {
                    return div.textContent
                }
            ).join(',')
        }).join(',')
    )

    
    for (const [index, expected] of allExpected.entries() ) {
        const isOk = expected === allObserved[index]
        add(index, descriptions[index], isOk)
    }
}
function add(index, message, isOk) {
    const p = document.createElement("p")
    const ok = isOk? 'OK': 'NOK'
    p.textContent = `${index+1}. ${ok} - ${message}`
    results.append(p)
}
