import { TIMEOUT_SEC } from "./config";

const timeout = function (s) {
    return new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error(`Request took too long! Timeout after ${s} second`));
        }, s * 1000);
    });
};

export const AJAX = async function (url, uploadData = undefined) {
    try {
        const fetchPro = uploadData ? fetch(url, {
            method: 'POST',
            headers: {                                      //*Snippets of text containing information about the request itself
                'Content-Type': 'application/json',     //*specifies that data we send is in JSON format, then API can accept and create recipe in dataBase.
            },
            body: JSON.stringify(uploadData),
        }) : fetch(url);

        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();

        if (!res.ok) throw new Error(`${data.message} (${res.status})`)
        return data;
    } catch (err) {
        throw err   //throws/propagates error to model.js.. *catch block in model.js
    }
};




// export const getJSON = async function (url) {
//     try {
//         const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
//         const data = await res.json();
//         if (!res.ok) throw new Error(`${data.message} (${res.status})`)
//         return data;
//     } catch (err) {
//         throw err   //throws/propagates error to model.js.. *catch block in model.js
//     }
// };

// export const sendJSON = async function (url, uploadData) {
//     try {
//         const fetchPro = fetch(url, {
//             method: 'POST',
//             headers: {                                      //*Snippets of text containing information about the request itself
//                 'Content-Type': 'application/json',     //*specifies that data we send is in JSON format, then API can accept and create recipe in dataBase.
//             },
//             body: JSON.stringify(uploadData),
//         });

//         const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
//         const data = await res.json();

//         if (!res.ok) throw new Error(`${data.message} (${res.status})`)
//         return data;
//     } catch (err) {
//         throw err   //throws/propagates error to model.js.. *catch block in model.js
//     }
// }; 