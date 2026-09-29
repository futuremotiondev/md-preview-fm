// Runs the actual release executable and inspects its WebView2 via local CDP.
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, toNamespacedPath } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)('playwright');
if (process.platform !== 'win32') throw new Error('This test requires real Windows WebView2');
const exe = resolve(process.argv[2] || 'target/release/md-preview-fm.exe');
const root = await mkdtemp(join(tmpdir(), 'mdp-startup-'));
const large = join(root, '中文 大文件.md');
const start = '# START_MARKER\n\n', end = '\nEND_MARKER\n';
const raw = start + 'plain text line\n'.repeat(209716).slice(0, 3*1024*1024-start.length-end.length) + end;
assert.equal(Buffer.byteLength(raw), 3*1024*1024);
await writeFile(large, raw);
const small = join(root, '中文 small.md');
await writeFile(small, '# SMALL_MARKER');
async function port() {
 const server = createServer(); await new Promise(r=>server.listen(0, '127.0.0.1', r));
 const result=server.address().port; await new Promise(r=>server.close(r)); return result;
}
async function run(name, args, saved, check) {
 const config=join(root,name); await mkdir(config);
 await writeFile(join(config,'.md-preview-fm-registered'),'');
 if(saved) await writeFile(join(config,'session.json'),JSON.stringify({version:1,active:0,tabs:saved}));
 // Stale endpoint files must not prevent a fresh primary process.
 await writeFile(join(config,'instance.lock'),'stale');
 await writeFile(join(config,'instance.json'),JSON.stringify({port:1,token:'stale'}));
 const debugPort=await port();
 const env={...process.env, MD_PREVIEW_CONFIG_DIR:config,
  WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:`--remote-debugging-port=${debugPort}`};
 const child=spawn(exe,args,{env,stdio:['ignore','pipe','pipe']});
 let output=''; child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
 let launchError; child.on('error',e=>launchError=e);
 let browser;
 let connectionError;
 try {
  const deadline=Date.now()+60000;
  while(!browser && Date.now()<deadline){
   if(launchError) throw launchError;
   if(child.exitCode!==null) throw new Error(`${name}: process exited ${child.exitCode}: ${output}`);
   try { browser=await chromium.connectOverCDP(`http://127.0.0.1:${debugPort}`,{timeout:1500}); }
   catch (error) { connectionError=error.message; await new Promise(r=>setTimeout(r,300)); }
  }
  assert.ok(browser, `${name}: CDP unavailable: ${connectionError}; ${output}`);
  const context=browser.contexts()[0];
  let page;
  while(Date.now()<deadline){page=context.pages()[0];if(page)break;await new Promise(r=>setTimeout(r,100));}
  assert.ok(page, `${name}: no WebView page`);
  page.setDefaultTimeout(30000);
  await page.waitForFunction(()=>typeof window.__setContent==='function');
  await check(page,env,config);
  assert.equal(child.exitCode,null, `${name}: app crashed`);
  console.log(`PASS ${name}`);
 } catch(error) {
  const diagnostic=spawnSync('powershell',['-NoProfile','-Command',
   "Get-Process md-preview-fm,msedgewebview2 -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,MainWindowTitle | Format-Table -AutoSize; Get-CimInstance Win32_Process -Filter 'name = \"msedgewebview2.exe\"' | Select-Object CommandLine | Format-List"],{encoding:'utf8'});
  console.error(diagnostic.stdout, diagnostic.stderr);
  throw error;
 } finally {
  if(child.exitCode===null) spawnSync('taskkill',['/pid',String(child.pid),'/t','/f']);
  if(browser) await browser.close().catch(()=>{});
 }
}
async function largeVisible(page){
 await page.waitForFunction(expected=>document.querySelector('#editor').value===expected,raw);
 assert.ok((await page.locator('#preview').innerText()).includes('END_MARKER'));
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
 assert.ok(await page.evaluate(()=>window.scrollY>0));
}
await run('cold-large',[large],null,largeVisible);
await run('restore-large',[],[toNamespacedPath(large)],largeVisible);
await run('cold-edit',['--edit',large],null,async page=>{
 await largeVisible(page);await page.waitForFunction(()=>document.body.classList.contains('editing'));
});
await run('running-open',[small],null,async(page,env)=>{
 await page.waitForFunction(()=>document.querySelector('#editor').value.includes('SMALL_MARKER'));
 const second=spawn(exe,[large],{env});
 const code=await new Promise((r,j)=>{second.on('error',j);second.on('exit',r);});
 assert.equal(code,0); await largeVisible(page);
});
await run('missing-history',[],[toNamespacedPath(join(root,'已删除.md'))],async page=>{
 await page.waitForFunction(()=>document.body.classList.contains('missing'));
 assert.ok(await page.locator('[data-locate-tab]').count());
});
await run('chinese-history',[],[toNamespacedPath(small)],async page=>{
 await page.waitForFunction(()=>document.querySelector('#editor').value.includes('SMALL_MARKER'));
});
await run('directory-history',[],[root],async page=>{
 await page.waitForFunction(()=>document.body.classList.contains('missing'));
 assert.equal(await realpath(await page.locator('#preview code').innerText()), await realpath(root));
 await page.locator('#preview [data-close-tab]').click();
 await page.waitForFunction(()=>document.body.classList.contains('empty'));
});
console.log('Windows startup regression suite passed');
