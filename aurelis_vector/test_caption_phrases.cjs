const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const sandbox={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/captionPhrases.ts','utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText,sandbox);
const group=sandbox.exports.captionPhrases;
const words=['The','Rothschilds','ruled','finance.','Five','brothers,','five','cities.'].map((word,i)=>({word,startFrame:i*12,endFrame:i*12+11}));
const result=group(words,[{startFrame:0,endFrame:48},{startFrame:48,endFrame:96}]);
assert.equal(result.flatMap(p=>p.words.map(w=>w.word)).join(' '),words.map(w=>w.word).join(' '));
for(let i=0;i<result.length-1;i++) assert.ok(result[i].end<=result[i+1].start,'caption phrases overlap');
for(const p of result) {
  assert.ok(p.words.length<=4);
  assert.ok(p.words.every(w=>w.startFrame<48) || p.words.every(w=>w.startFrame>=48),'crossed scene');
}
const pause=group([{word:'Trust.',startFrame:0,endFrame:9},{word:'Changed.',startFrame:60,endFrame:75}],[{startFrame:0,endFrame:90}]);
assert.ok(!pause.some(p=>30>=p.start && 30<p.end),'stale caption through silence');
console.log('Caption phrase checks passed: lossless words, stable groups, no overlaps, scene boundaries and silence.');
