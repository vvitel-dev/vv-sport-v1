const fs=require('fs'); let code=fs.readFileSync('app.js','utf8');
code += `
function __debugVisual(){
  const samples=[
    ['Ring push-ups tempo','ring_push'],['Ring rows technique','ring_row'],['Rowing aux anneaux','ring_row'],['Dips anneaux assistés/progression','ring_dip'],['Support hold sur supports','support_hold'],['Support hold anneaux','ring_support'],['Rowing haltères 5 kg tempo lent','db_row'],['Circuit complet','circuit'],['Vélo zone 2','bike'],['Mobilité épaules','mobility'],['Mobilité poignets','wrist_mobility'],['Étirements dos/pecs','stretch_back'],['Élévations latérales 5 kg tempo','lateral_raise'],['Tractions progression','pull'],['Finisher abdos','crunch']];
  let out=[]; for(const [name,expected] of samples){const key=chooseExerciseVisual({name,type:'compose'}); out.push({name, expected, key, exists:!!SVGS[key]});}
  return out;
}
console.log(JSON.stringify(__debugVisual(),null,2));`;
class CL{constructor(){this.s=new Set()}add(x){this.s.add(x)}remove(x){this.s.delete(x)}toggle(x,v){v===undefined?(this.s.has(x)?this.s.delete(x):this.s.add(x)):(v?this.s.add(x):this.s.delete(x))}contains(x){return this.s.has(x)}}
function el(id){return {id,textContent:'',innerHTML:'',hidden:false,value:'',dataset:{},style:{setProperty(){},width:'',display:''},classList:new CL(),querySelector(){return {textContent:'',classList:new CL(),style:{},dataset:{}}},querySelectorAll(){return []},appendChild(){},remove(){},addEventListener(){},setAttribute(){},getAttribute(){return null},closest(){return null}}}
const ids={}; global.document={readyState:'complete',hidden:false,body:el('body'),getElementById(id){if(!ids[id])ids[id]=el(id);return ids[id]},querySelectorAll(){return []},querySelector(){return el('q')},createElement(){return el('created')},addEventListener(){}};
global.window={localStorage:null,addEventListener(){},AudioContext:function(){return fakeCtx()},webkitAudioContext:function(){return fakeCtx()}};
function fakeCtx(){return {state:'running',currentTime:0,resume(){return Promise.resolve()},createOscillator(){return {type:'',frequency:{value:0,setValueAtTime(){}},connect(){},start(){},stop(){}}},createGain(){return {gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}};}
const ls={m:{},getItem(k){return this.m[k]??null},setItem(k,v){this.m[k]=String(v)},removeItem(k){delete this.m[k]}}; global.localStorage=ls; global.window.localStorage=ls;
global.navigator={serviceWorker:{register(){return Promise.resolve()}},vibrate(){}}; global.Audio=function(){return {preload:'',volume:1,muted:false,currentTime:0,cloneNode(){return this},play(){return Promise.resolve()},pause(){}}};
global.alert=function(){}; global.setInterval=function(){return 1}; global.clearInterval=function(){}; global.setTimeout=function(){return 1};
eval(code);
