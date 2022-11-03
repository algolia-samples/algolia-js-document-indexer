
const container = document.getElementById('readme-container');
const title = document.querySelector('#readme-container .title');
const loader = document.querySelector('#readme-container .loader');
const body = document.querySelector('#readme-container .body');
const error = document.querySelector('#readme-container .error');
async function openDoc(id, count, name) {

    title.innerHTML = `Showing documentation for repo '${name}'`;
    loader.style.display = 'block';
    body.style.display = 'none';
    error.style.display = 'none';
    container.style.display = 'grid';
    console.log(id, count, name);

    const baseIdRegex = /^(.+)_\d+$/.exec(id);
    if (!baseIdRegex || !baseIdRegex[1]) {
        error.style.display = 'block';
        error.innerHTML = 'Failed to parse Object ID';
        loader.style.display = 'none';
        return;
    }
    const baseId = baseIdRegex[1];
    const promises = [];
    for (let i = 0; i < count; i++) {
         promises.push(window.searchClient.customRequest({
            method: 'GET',
            path: `/1/indexes/${window.searchIndexName}/${baseId}_${i}`
        }).then(e => ({
            id: i,
            result: e
        })))
    }
    let results = undefined;
    try {
        results = await Promise.all(promises);
        console.log(results);
    } catch (e) {
        console.error('Failed to get doc', e);
        error.style.display = 'block';
        error.innerHTML = 'Failed to get documentation, check browser logs.';
        loader.style.display = 'none';
        return;
    }
    const doc = results.sort((a, b) => {
        if (a.id < b.id) {
            return -1;
        }
        if (a.id > b.id) {
            return 1;
        }
        return 0;
    }).map(e => e.result.readme).join('');
   
    
    body.innerHTML = doc;
    loader.style.display = 'none';
    body.style.display = 'block';
    await new Promise(res => window.requestAnimationFrame(() => res()));
    body.scrollTop = 0;
    
}

function closeDocDialog() {
    container.style.display = 'none';
    return false;
}



window.openDoc = openDoc;
window.closeDocDialog = closeDocDialog;