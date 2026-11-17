// Render one actual frame from every authored view, including every dispatch type.
const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill}=require('@remotion/renderer');
const fs=require('fs');const path=require('path');
(async()=>{
 const edition=process.argv[2]||'v2';
 if(!['v2','v3'].includes(edition))throw new Error('Use v2 or v3');
 const shots=JSON.parse(fs.readFileSync('src/moneyStoryboard.json','utf8'));
 const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
 const browser=await openBrowser('chrome');
 try {
  const composition=await selectComposition({serveUrl,id:edition==='v3'?'MoneyHabitsV3':'MoneyHabitsV2',puppeteerInstance:browser});
  const folder=`out/money-habits-${edition}-frames`;fs.mkdirSync(folder,{recursive:true});
  for(let i=0;i<shots.length;i+=4){
   await Promise.all(shots.slice(i,i+4).map((s,j)=>renderStill({serveUrl,composition,puppeteerInstance:browser,
    frame:Math.min(s.endFrame-1,s.startFrame+Math.round((s.endFrame-s.startFrame)*.67)),
    output:path.resolve(folder,`${String(i+j).padStart(3,'0')}.jpg`),imageFormat:'jpeg',scale:.5,logLevel:'error'})));
   console.log(`Reviewed renderer coverage ${Math.min(i+4,shots.length)}/${shots.length}`);
  }
 } finally {await browser.close({silent:true});}
})().catch(e=>{console.error(e);process.exit(1)});
