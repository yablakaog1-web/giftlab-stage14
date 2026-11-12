import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {execFileSync} from 'node:child_process';
const cwd=process.cwd();
const repoRoot=path.resolve(cwd,'../..');
const target=path.join(cwd,'server.js');
const indexPath=path.join(cwd,'public','index.html');
if(fs.existsSync(target)&&fs.existsSync(indexPath)){
  const complete=()=>fs.readFileSync(indexPath,'utf8').includes('app.js?v=17.2') && fs.existsSync(path.join(cwd,'credit-shop.js')) && fs.readFileSync(target,'utf8').includes('/api/avatar/me');
  if(!complete()){
    const prefix=path.relative(repoRoot,cwd).split(path.sep).join('/');
    if(prefix!=='_giftlab/GiftLab-Stage14-GreenLab')throw Error('Unexpected GiftLab build directory');
    for(const release of ['17.1','17.2']){
      const src=path.resolve(repoRoot,'deploy','stage'+release+'.patch.gz.b64');
      const base64=fs.readFileSync(src,'utf8').trim();
      const patch=zlib.gunzipSync(Buffer.from(base64,'base64'));
      execFileSync('git',['apply','--binary','--whitespace=nowarn','--directory='+prefix,'-'],{cwd:repoRoot,input:patch,timeout:20000});
      console.log('[GiftLab] Applied source patch '+release);
    }
  }
  if(!complete())throw new Error('GiftLab 17.2 verification failed: refusing to run incomplete release');
  console.log('[GiftLab] Verified Stage 17.2 source and Telegram avatar fix');
}