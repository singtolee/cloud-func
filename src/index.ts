import * as functions from 'firebase-functions';
var MsTranslator = require('mstranslator');
var client = new MsTranslator({
    api_key: "1307c5de96104ac9b96fbb83878d4bdd"
  }, true);
const request = require('request');
const API = "https://api.shenjian.io/?appid=1498f414e1d727e07af7462caf475502&scanUrl="
export const apicall = functions.https.onRequest((req, res) => {
    const url = req.query.text;
    const enco = encodeURIComponent(url);
    const address = API.concat(enco);
    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    request(address,function(err,resp,body){
        console.log('RESP', resp)
        if(!err){
            handlePrd(JSON.parse(body)).then((dd)=>{
                res.send(dd)
            }).catch(er=>{
                res.send({loaded:false,error_code:er})
            })
        }else {
            console.log('ERROR',err)
            res.send({loaded:false,error_code:err})
        }
    })
 });

 async function handlePrd(data){
     if(data.error_code === 0){
         const prd = data.data.product_details;
         //gether necessary fields
         const images = prd.images; //.map(item=>item.image_url);
         const name = prd.name;
         const thName = await callapi(prd.name);
         const original_price = prd.original_price;
         const pid = prd.product_id;
         const price = prd.current_price;
         const score = prd.score;
         let sku_detail = prd.product_sku_detail;
         for (const sku of sku_detail){
             if(isOne(sku.sku_name)){
                 if(isNumber(sku.sku_name)){
                    sku.sku_thName = sku.sku_name
                 }else {
                    sku.sku_thName = await callapi(sku.sku_name)
                 }
             }else {
                sku.sku_thName = sku.sku_name
             }
         }
         let skus = prd.sku;
         for (const val of skus[0].values){
             if(isNumber(val.desc)){
                 val.thDesc = val.desc
             }else {
                val.thDesc = await callapi(val.desc);
             }
         } 
         const myPrd = {
             images:images,
             name:name,
             thName:thName,
             original_price:original_price,
             pid:pid,
             price:price,
             score:score,
             sku_detail:sku_detail,
             skus:skus,
         }
         return {loaded:true,error_code:0,data:myPrd}
     }else {
         //did not get prd
         return {loaded:false,error_code:data.error_code}
     }

 }

 function isNumber(str:string){
    let reg = /^\w+$/;
    return reg.test(str)
 }

 function isOne(str:string){
     const cc = str.split(/\>|\s/);
     if(cc.length==1){
         return true
     }else {
         return false
     }
 }

 function callapi(text) {
    return new Promise(resolve=>{
        client.translate({text:text,from:'zh-cn',to:'th'},function(err,data){
            if(err){
                console.error("ERROR",err)
                resolve(err)
            }else{
                resolve(data)
            }
        })
    })
}

