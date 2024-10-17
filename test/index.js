import {} from './../src/index.js'

const allLists =  [...document.getElementsByTagName('list-m')]

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
    console.log(allObserved)

    for (const [index, expected] of allExpected.entries() ) {
        const isOk = expected === allObserved[index]
        console.log(isOk)
    }
}
