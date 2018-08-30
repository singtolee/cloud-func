"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const request = require('request');
const API = "https://api.shenjian.io/?appid=1498f414e1d727e07af7462caf475502&scanUrl=";
exports.apicall = functions.https.onRequest((req, res) => {
    const url = req.query.text;
    const enco = encodeURIComponent(url);
    const address = API.concat(enco);
    request(address, function (err, resp, body) {
        if (!err) {
            res.send(handlePrd(JSON.parse(body)));
        }
        else {
            res.send({ error: true });
            console.log('ERROR', err);
        }
    });
    //res.send("Hello from Firebase!");
});
function handlePrd(data) {
    if (data.error_code === 0) {
        //successfully get prd,
        const prd = data.data.product_details;
        //gether necessary fields
        const images = prd.images.map(item => item.image_url);
        const name = prd.name;
        const thName = cn2th(prd.name);
        const original_price = prd.original_price;
        const pid = prd.product_id;
        const price = prd.current_price;
        const score = prd.score;
        const sku_detail = prd.product_sku_detail;
        const skus = prd.sku;
        const myPrd = {
            images: images,
            name: name,
            thName: thName,
            original_price: original_price,
            pid: pid,
            price: price,
            score: score,
            sku_detail: sku_detail,
            skus: skus,
        };
        return { loaded: true, data: myPrd };
    }
    else {
        //did not get prd
        return { loaded: false, error_code: data.error_code };
    }
}
function cn2th(str) {
    return str;
}
//# sourceMappingURL=index.js.map