
let db;

const request = indexedDB.open('track_my_budget', 1)

request.onupgradeneeded = e => {
    const db = e.target.result;
}

request.onsuccess = e => {
 db = e.target.result
 if (navigator.onLine) {
     // upload
 }
}

request.onerror = e => {
    console.log(e.target.errorCode)
}

const saveRecord = record => {
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    store.add(record)
}

const checkDatabase = () => {
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    const getAll = store.getAll()

    getAll.onsucess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: 'POST',
                body: JSON.stringify(getAll.results),
                headers : {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse)
                }
                const transaction = db.transaction(['pending'], 'readwrite');
                const store = transaction.objectStore('pending');
                store.clear();
            })
            .catch(err => {
                console.log(err)
            })
        }
    }
}
window.addEventListener('online', checkDatabase)