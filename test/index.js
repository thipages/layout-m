import {} from './../src/index.js'

const allLists =  [...document.getElementsByTagName('layout-m')]
const descriptions = [
    'test with json file',
    'test with non existing file',
    'test with text file',
    'test with embedded json'
]
const allExpected = [
    'fname1,1,fname2,2,fname3,3',
    '',
    '',
    'ename1,1,ename2,2'
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
