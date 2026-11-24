import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,BookOpen,Flame,Volume2,VolumeX,Trash2} from 'lucide-react';
import './cigarette-break.css';

export const CIGARETTES=[
 {id:'classic',name:'CLASSIC',unlocked:true,paper:'#d7c69b',filter:'#a97843',ember:'#e84c28',pack:'#76613d',description:'淡い紙と琥珀色のフィルター。いつもの静かな一本。'},
 {id:'night',name:'NIGHT',unlocked:true,paper:'#b5c3c0',filter:'#526b6c',ember:'#d76a42',pack:'#344e50',description:'夜の窓辺を思わせる、青灰色の紙と深い色合い。'},
 {id:'vintage',name:'VINTAGE',unlocked:true,paper:'#c9aa76',filter:'#704739',ember:'#f09a42',pack:'#68443a',description:'古い紙箱のような色。火先は少し明るい琥珀色。'},
];
const FLAMES={orange:'#ff9b28',steady:'#ffb343',red:'#ef5430',blue:'#43c4e9',platinum:'#fff0a1',cosmic:'#dc79eb'};
const WOOD={wood:'#b8793f',grain:'#bd8b50',black:'#3f3832',blue:'#315b7a',metal:'#9e9b86',ultimate:'#654d83'};
const PREF_KEY='match-incremental-cigarette-break-v1';
function readPrefs(){try{const p=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return {muted:typeof p.muted==='boolean'?p.muted:true,volume:Number.isFinite(p.volume)?Math.min(1,Math.max(0,p.volume)):.35};}catch{return {muted:true,volume:.35};}}

function PixelSmoke({puffs}){return <div className="cb-smoke" aria-hidden="true">{puffs.map(p=><i key={p.id} style={{left:`${p.left}%`,bottom:`${p.bottom}%`,'--drift':`${p.drift}px`,'--rise':`${p.rise}px`,'--smoke-time':`${p.duration}ms`,'--smoke-delay':`${p.delay}ms`}}/>)}</div>}
function CigaretteStick({className='',lit=false,inhaling=false,finished=false,progress=0}){return <span className={`cb-cigarette-sprite ${className} ${lit?'lit':''} ${inhaling?'inhaling':''} ${finished?'finished':''}`} style={{'--cigarette-length':`${66-progress*31}px`}} aria-label={lit?'火のついたタバコ':'タバコ'}><i className="cb-cig-ash"/><b className="cb-cig-paper"/><em className="cb-cig-filter"/><strong className="cb-cig-ember"/><small className="cb-cig-spark"/></span>}
function PixelProfile(){return <svg className="cb-profile" viewBox="0 0 128 160" role="img" aria-label="暖炉の光に浮かぶ人物の横顔" shapeRendering="crispEdges">
 <path fill="#28221c" d="M20 142h20v-10h16v-12h20v-8h20v8h16v28H20z"/>
 <path fill="#30251c" d="M48 108h28v22H64v18H40v-20h8z"/>
 <path fill="#191715" d="M44 12h36v4h12v8h8v12h8v16h-8v8h-8v4l12 4-8 4 8 4-12 4h-8v8h-8v12H72v12H60v8H44v-8H36v-8H28V96H24v-8h-8l-4-8 8-4 4-8-4-4V52h8V40h4V24h8z"/>
 <path fill="#100f0e" d="M40 16h40v4h12v8h8v12h-8v-4H80v-4H68v4H56v-4H44v8H32v8h-8V36h4V24h8v-4h4z"/>
 <path fill="#151311" d="M88 32h8v16h8v8h-8v8h-8v-8H80V48h8z"/>
 <path fill="#241d17" d="M44 48h20v-4h16v8h8v8h-8v8H72v12H60v8H48V76h-8V64h4z"/>
 <path fill="#32251b" d="M68 56h8v8h-8zm-8 20h8v4h-8zm-8 28h12v4H52z"/>
 <path fill="#5f4934" d="M32 56h4v4h-4z" opacity=".55"/>
 <path className="cb-profile-eye" fill="#72563a" d="M32 60h4v4h-4z"/>
 <path fill="#100f0e" d="M36 20h8v4h-8zm-8 20h8v4h-8zm52-20h8v4h-8zm12 8h8v8h-8z"/>
 <path className="cb-face-light" fill="#ce8c4d" d="M32 48h4v12h-4zm-4 12h4v8h-4zm-4 8h-8v4h12v4h-8v4h8v4h-8v4h12v8h8v4h12v-4H44v-4h-8v-8h-4v-8h-4v-4h4v-4h-4z"/>
 <path className="cb-face-light" fill="#e7ad65" d="M16 68h8v4h-8zm4 16h8v4h-8zm4 8h8v4h-8zm40 52h20v4H64z" opacity=".65"/>
 <path className="cb-face-light" fill="#b8733c" d="M24 52h4v8h-4zm4 36h4v8h-4zm12 24h8v4h-8z" opacity=".7"/>
 </svg>}

export default function CigaretteBreak({match,onBack}){
 const [phase,setPhase]=useState('idle'),[tab,setTab]=useState('scene'),[selected,setSelected]=useState('classic');
 const [burnProgress,setBurnProgress]=useState(0),[litAt,setLitAt]=useState(0),[puffs,setPuffs]=useState([]),[inhale,setInhale]=useState(false);
 const [ash,setAsh]=useState(0),[butts,setButts]=useState(0),[flash,setFlash]=useState(false),[prefs,setPrefs]=useState(readPrefs);
 const drag=useRef(null),puffId=useRef(0),finished=useRef(false),ashStage=useRef(0),audio=useRef(null),puffTimers=useRef(new Set()),flashTimer=useRef(),inhaleTimer=useRef();
 const tobacco=CIGARETTES.find(c=>c.id===selected)||CIGARETTES[0];
 const flame=FLAMES[match?.flame]||FLAMES.orange,wood=WOOD[match?.wood]||WOOD.wood;
 useEffect(()=>{try{localStorage.setItem(PREF_KEY,JSON.stringify(prefs));}catch{}},[prefs]);
 useEffect(()=>{if(phase!=='lightingCig')return;const id=setTimeout(()=>{setPhase('smoking');setBurnProgress(0);setLitAt(Date.now());},900);return()=>clearTimeout(id);},[phase]);
 useEffect(()=>{if(phase!=='smoking')return;const id=setInterval(()=>{const p=Math.min(1,(Date.now()-litAt)/18000);setBurnProgress(p);addAshForProgress(p);if(p>=1){clearInterval(id);finishCigarette();}},100);return()=>clearInterval(id);},[phase,litAt]);
 useEffect(()=>{if(phase!=='smoking')return;let live=true;let timer;const add=()=>{if(!live)return;emitPuff();timer=setTimeout(add,1250+Math.random()*1650);};add();return()=>{live=false;clearTimeout(timer);};},[phase]);
 useEffect(()=>()=>{puffTimers.current.forEach(clearTimeout);clearTimeout(flashTimer.current);clearTimeout(inhaleTimer.current);audio.current?.close?.();},[]);
 function playSound(kind){if(prefs.muted||prefs.volume<=0)return;try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;const ctx=audio.current||(audio.current=new Ctx());if(ctx.state==='suspended')ctx.resume();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=kind==='strike'?'sawtooth':'triangle';osc.frequency.setValueAtTime(kind==='strike'?110:kind==='ignite'?520:190,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(kind==='strike'?55:kind==='ignite'?260:110,ctx.currentTime+.12);gain.gain.setValueAtTime(prefs.volume*(kind==='strike'?.045:.035),ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.17);}catch{}}
 function emitPuff(){const id=++puffId.current;setPuffs(prev=>[...prev,{id,left:53+Math.random()*5,bottom:43+Math.random()*5,drift:Math.round(-22+Math.random()*54),rise:55+Math.round(Math.random()*45),duration:2100+Math.round(Math.random()*1900),delay:Math.round(Math.random()*180)}].slice(-9));const timer=setTimeout(()=>{puffTimers.current.delete(timer);setPuffs(prev=>prev.filter(p=>p.id!==id));},4600);puffTimers.current.add(timer);}
 function takePuff(){if(phase!=='smoking')return;emitPuff();setInhale(true);clearTimeout(inhaleTimer.current);inhaleTimer.current=setTimeout(()=>setInhale(false),700);playSound('inhale');}
 function startCigarette(){setBurnProgress(0);ashStage.current=0;finished.current=false;setPuffs([]);setPhase('hand');}
 function pulseLight(duration){setFlash(true);clearTimeout(flashTimer.current);flashTimer.current=setTimeout(()=>setFlash(false),duration);}
 function lightMatch(){if(phase!=='matchReady')return;setPhase('matchLit');playSound('strike');pulseLight(650);}
 function lightTobacco(){if(phase!=='matchLit')return;setPhase('lightingCig');playSound('ignite');pulseLight(850);}
 function addAshForProgress(progress,finishing=false){const target=Math.min(3,Math.max(finishing?1:0,Math.floor(progress*3)));if(target<=ashStage.current)return;const gained=target-ashStage.current;ashStage.current=target;setAsh(n=>n+gained);}
 function finishCigarette(){if(finished.current)return;finished.current=true;addAshForProgress(burnProgress,true);setPhase('spent');setBurnProgress(1);setButts(n=>n+1);setPuffs([]);}
 function emptyTray(){setAsh(0);setButts(0);}
 function pointerDown(e){if(phase!=='matchReady')return;e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);drag.current={x:e.clientX,distance:0};}
 function pointerMove(e){if(!drag.current)return;const dx=Math.abs(e.clientX-drag.current.x);drag.current.distance+=dx;drag.current.x=e.clientX;if(drag.current.distance>25){drag.current=null;lightMatch();}}
 function pointerUp(){drag.current=null;}
 function toggleSound(){setPrefs(p=>({...p,muted:!p.muted}));}
 const status={idle:'机の上に、静かな時間がある。',hand:'紙巻きを口元へ運ぶ。',mouth:'マッチを取り出そう。',matchReady:'擦り面を左右にスワイプして火をつける。',matchLit:'小さな火を、タバコの先に近づける。',lightingCig:'タバコに火が移り、マッチが燃え尽きる。',smoking:'火先が赤く残る。煙はゆっくり部屋へ流れる。',spent:'吸い殻と灰が灰皿に残った。'}[phase];
 return <main className="cigarette-break" style={{'--match-flame':flame,'--match-wood':wood,'--tobacco-paper':tobacco.paper,'--tobacco-filter':tobacco.filter,'--tobacco-ember':tobacco.ember,'--pack-color':tobacco.pack}}>
  <header className="cb-topbar"><button className="cb-back" onClick={onBack}><ArrowLeft size={16}/> 戻る</button><div className="cb-title"><small>QUIET INTERLUDE</small><h1>CIGARETTE BREAK <span>タバコ休憩</span></h1></div><div className="cb-volume"><button aria-label={prefs.muted?'音声をオン':'音声をミュート'} onClick={toggleSound}>{prefs.muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button><input aria-label="音量" type="range" min="0" max="1" step=".05" value={prefs.volume} onChange={e=>setPrefs(p=>({...p,volume:Number(e.target.value)}))}/></div></header>
  <section className={`cb-room ${flash?'is-flashing':''}`} aria-label="雨の降る夜の部屋">
   <div className="cb-window"><div className="cb-sky"><span className="cb-moon"/><i className="city city-a"/><i className="city city-b"/><i className="city city-c"/>{Array.from({length:22},(_,i)=><b key={i} className={`rain rain-${i%5}`} style={{left:`${(i*37+7)%100}%`,animationDelay:`-${(i%7)*.42}s`}}/>)}</div><span className="window-cross vertical"/><span className="window-cross horizontal"/></div>
   <div className="cb-lamp"><i/><b/><span/></div><div className="cb-wall-shadow"/>
   <div className="cb-person"><div className={`cb-head ${inhale?'breathing':''} ${flash?'lit-profile':''}`}><PixelProfile/><CigaretteStick className={`${['mouth','matchReady','matchLit','lightingCig','smoking','spent'].includes(phase)?'at-mouth':''} ${phase==='lightingCig'||phase==='smoking'?'mouth-lit':''}`} lit={phase==='lightingCig'||phase==='smoking'} inhaling={inhale} finished={phase==='spent'} progress={burnProgress}/></div><PixelSmoke puffs={puffs}/><span className="cb-puff-label">{inhale?'ひと息':''}</span></div>
   {phase==='hand'&&<div className="cb-hand-cig"><CigaretteStick className="in-hand"/></div>}
   {(phase==='matchReady'||phase==='matchLit'||phase==='lightingCig')&&<div className={`cb-hand-match ${phase==='matchLit'?'lit':''} ${phase==='lightingCig'?'burning-out':''}`}><i/><b/></div>}
   <div className="cb-desk"><div className="cb-desk-edge"/><div className="cb-pack" aria-label={`${tobacco.name}のタバコ箱`}><i/><b>{tobacco.name}</b></div><div className="cb-matchbox"><span>MATCHES</span><i/></div><div className="cb-ashtray"><span className="cb-ash-pile" style={{height:`${Math.min(22,ash*2+2)}px`}}/>{Array.from({length:Math.min(butts,4)},(_,i)=><i key={i} className="cb-butt" style={{left:`${18+i*18}%`,transform:`rotate(${-15+i*8}deg)`}}/>)}<small>ASH</small></div>{phase==='spent'&&<span className="cb-fresh-butt" aria-label="吸い終わったタバコ"/>}</div>
  </section>
  <div className="cb-caption"><span className="cb-live-dot"/>{status}<span>{phase==='smoking'?`${Math.max(0,Math.ceil(18*(1-burnProgress)))} 秒`:match?.name||'普通のマッチ'}</span></div>
  <section className="cb-controls">
   <div className="cb-stepper" aria-label="休憩の操作">
    {(phase==='idle'||phase==='spent')&&<button className="cb-action primary" onClick={startCigarette}>{phase==='spent'?'次のタバコを取り出す':'タバコを取り出す'}</button>}
    {phase==='hand'&&<button className="cb-action primary" onClick={()=>setPhase('mouth')}>口元にくわえる</button>}
    {phase==='mouth'&&<button className="cb-action primary" onClick={()=>setPhase('matchReady')}>マッチを取り出す</button>}
    {phase==='matchReady'&&<button className="cb-action primary" onClick={lightMatch}>マッチを擦る</button>}
    {phase==='matchLit'&&<button className="cb-action primary" onClick={lightTobacco}>火を近づける</button>}
    {phase==='lightingCig'&&<span className="cb-transfer-label">火が移る…</span>}
    {phase==='smoking'&&<><button className="cb-action" onClick={takePuff}>ひと吸いする</button><button className="cb-action" onClick={finishCigarette}>灰皿に置く</button></>}
    {phase==='smoking'&&<div className="cb-progress"><span style={{width:`${burnProgress*100}%`}}/></div>}
    {phase==='matchReady'&&<div className="cb-strike-pad" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();lightMatch();}}}><span>STRIKE ZONE</span><small>ここを左右にスワイプ</small></div>}
   </div>
   <div className="cb-library"><div className="cb-library-head"><BookOpen size={15}/><span>タバコ図鑑</span><button className="cb-tab-toggle" onClick={()=>setTab(t=>t==='scene'?'book':'scene')}>{tab==='scene'?'ひらく':'とじる'}</button></div>{tab==='book'&&<div className="cb-tobaccos">{CIGARETTES.map(c=><button key={c.id} disabled={!c.unlocked} className={`cb-tobacco-card ${selected===c.id?'selected':''} ${!c.unlocked?'locked':''}`} onClick={()=>c.unlocked&&setSelected(c.id)}><span className="cb-mini-pack" style={{'--pack-color':c.pack}}><i style={{background:c.filter}}/></span><span><b>{c.name}</b><small>{c.description}</small></span><em>{c.unlocked?'解放済み':'未解放'}</em></button>)}</div>}</div>
   <div className="cb-tray-status"><div><small>灰皿 · 演出用</small><span>灰 {ash}　/　吸い殻 {butts}</span></div><button className="cb-action" disabled={!ash&&!butts} onClick={emptyTray}><Trash2 size={14}/> 灰皿を空にする</button></div>
   <p className="cb-note">架空のタバコを使った短い演出です。本編の資源・マッチ在庫・燃焼報酬には影響しません。</p>
  </section>
 </main>;
}
