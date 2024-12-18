import {} from './../src/index.js'

const layouts1 =  [...document.getElementsByTagName('layout-m')]
const tests = [
    ['test with json file', 'fname1,1,fname2,2,fname3,3'],
    ['test with offset json file', 'offset1,1,offset2,2,offset3,3'],
    ['test with custom path of json file', 'fname1,1,fname2,2,fname3,3'],
    ['test with non existing file', ''],
    ['test with text file', ''],
    ['test with embedded json', 'ename1,1,ename2,2'],
    ['test with embedded offset json', 'offset1,1,offset2,2']
    //['test with embedded json + level-up', 'ename1,1,ename2,2']
]
setTimeout(run, 1500)
function run() {
    const allObserved = layouts1.map(
        list => [... list.children].map(infoList => {
            return [... infoList.children].map (
                div => {
                    return div.textContent
                }
            ).join(',')
        }).join(',')
    )
    for (const [index, [description, expected]] of tests.entries() ) {
        const isOk = expected === allObserved[index]
        add(index, description, isOk)
    }
}
function add(index, message, isOk) {
    const p = document.createElement("p")
    const ok = isOk? 'OK': 'NOK'
    p.textContent = `${index+1}. ${ok} - ${message}`
    results.append(p)
}
