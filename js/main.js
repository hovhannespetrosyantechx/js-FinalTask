

// function makeUrl(baseUrl, params){
//     const url = new URL(baseUrl);

//     if (params && typeof params === 'object'){
//         Object.keys(params).forEach(key => {
//             const value = params[key];
            
//             if (value !== null && value !== undefined){
//                 url.searchParams.append(key, value);
//             }
//         });
//     }
// }

// const mycostomurl = makeUrl('http exaple com', {name: 'ashout', age:'30', city:null});
// fetch(mycostomurl)