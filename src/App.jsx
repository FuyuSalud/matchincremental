import React,{useEffect,useMemo,useRef,useState} from 'react';
import { Flame, Sparkles, CircleDollarSign, BookOpen, Zap, LockKeyhole, Check, ChevronRight, RotateCcw, MousePointer2, Info, X } from 'lucide-react';
import {MATCHES,UPGRADES,JOURNAL,fresh,loadGame,saveGame,level,cost,matchStats,canUnlock,canBeginFinale,availableJournal,beginNewEra} from './game.js';
import {AshPile,PixelIcon,PixelMatch} from './PixelArt.jsx';
import CigaretteBreak from './CigaretteBreak.jsx';
function Resource({label,value,color}){return <div className="resource"><span className={`resource-icon ${color}`}><PixelIcon type={color}/></span><div><small>{label}</small><strong>{Math.floor(value).toLocaleString('ja-JP')}</strong></div></div>}
function SaveTransfer({onImported}){
 const picker=useRef(null);
 function exportSave(){const state=JSON.parse(localStorage.getItem('match-incremental-v02')||'{}');const payload={format:'match-incremental-save',version:1,state};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='match-incremental-save.json';link.click();URL.revokeObjectURL(url)}
 async function importSave(event){const file=event.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const incoming=parsed?.format==='match-incremental-save'?parsed.state:parsed;if(!incoming||typeof incoming!=='object'||!['points','embers','ash','upgrades','unlocked'].every(key=>key in incoming)||![incoming.points,incoming.embers,incoming.ash].every(value=>Number.isFinite(Number(value)))||!Array.isArray(incoming.unlocked)||typeof incoming.upgrades!=='object')throw new Error('invalid save');const state={...fresh(),...incoming,upgrades:{...incoming.upgrades},unlocked:incoming.unlocked};localStorage.setItem('match-incremental-v02',JSON.stringify(state));onImported(loadGame());window.alert('セーブデータを読み込みました。');}catch{window.alert('このファイルは有効なMATCH INCREMENTALセーブではありません。');}finally{event.target.value=''}}
 return <div className="save-transfer"><button onClick={exportSave}>セーブをエクスポート</button><button onClick={()=>picker.current?.click()}>インポート</button><input ref={picker} type="file" accept="application/json,.json" onChange={importSave} hidden/></div>
}
function UpgradeCard({item,state,buy}){const lv=level(state,item.id),price=cost(item,state),have=state[item.currency];return <article className="upgrade-card">
  <div className="upgrade-icon">{item.currency==='points'?<Zap size={18}/>:item.currency==='embers'?<Flame size={18}/>:<Sparkles size={18}/>}</div><div className="upgrade-copy"><div className="upgrade-title">{item.name}<span>Lv. {lv}/{item.max}</span></div><p>{item.desc}</p><small>{item.effect}</small></div>
  <button className="buy-button" disabled={lv>=item.max||have<price} onClick={()=>buy(item)}>{lv>=item.max?'MAX':<>{price} <b>{item.currency==='points'?'pt':item.currency==='embers'?'✦':'灰'}</b><ChevronRight size={14}/></>}</button>
</article>}
function Collection({state,onSelect,onUnlock}){return <div className="collection-grid">{MATCHES.map((m,i)=>{const unlocked=state.unlocked.includes(m.id);const can=canUnlock(state,m);return <article className={`match-card ${!unlocked?'locked':''} ${state.selected===m.id?'selected':''}`} key={m.id}>
  <div className="card-art">{unlocked?<PixelMatch match={m} small/>:<div className="silhouette"><PixelMatch match={{...m,wood:'silhouette',flame:'none'}} small/></div>}</div>
  <div className="card-head"><div><small>STAGE 0{i+1}</small><h3>{unlocked?m.name:'？？？'}</h3></div>{unlocked?<Check size={16}/>:<LockKeyhole size={16}/>}</div>
  <p>{unlocked?m.desc:m.unlock}</p><div className="card-stats"><span><Flame size={12}/> {m.burn}s</span><span><Zap size={12}/> {Math.round(m.chance*100)}%</span><span>✦ {m.ember}</span></div>
  {unlocked?<button className={`select-match ${state.selected===m.id?'active':''}`} onClick={()=>onSelect(m.id)}>{state.selected===m.id?'使用中':'このマッチを使う'}</button>:<button className="unlock-button" disabled={!can} onClick={()=>onUnlock(m)}>{m.currency==='ash'?m.cost+' 灰':m.cost+' 燃え殻'}で解放</button>}
 </article>})}</div>}
function ResearchArchive({state}){const known=JOURNAL.filter(entry=>state.journal.includes(entry.id));return <section className="research-archive"><div className="archive-heading"><small>RESEARCH RECORDS</small><span>{known.length} / {JOURNAL.length}</span></div>{known.length?known.map(entry=><article className="record-entry" key={entry.id}><span className="record-mark"/><div><h3>{entry.title}</h3><p>{entry.text}</p></div></article>):<p className="archive-empty">火を灯すたび、余白に何かが残る。</p>}</section>}
function App(){
 const [game,setGame]=useState(loadGame),[burn,setBurn]=useState(null),[message,setMessage]=useState('ドラッグして、マッチを擦ろう'),[gesture,setGesture]=useState(null),[sparks,setSparks]=useState(false),[toast,setToast]=useState(''),[notice,setNotice]=useState(null),[now,setNow]=useState(0),[breakOpen,setBreakOpen]=useState(false);
 const drag=useRef(null),lastAuto=useRef(0),timeout=useRef(),burnPaid=useRef(false),lastJournalToast=useRef('');
 const match=MATCHES.find(m=>m.id===game.selected)||MATCHES[0],stats=useMemo(()=>matchStats(game,match),[game,match]);
 useEffect(()=>{saveGame(game)},[game]);
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),100);return()=>clearInterval(id)},[]);
 useEffect(()=>{if(burn?.phase!=='burning')return;const id=setInterval(()=>{const progress=Math.min(1,(Date.now()-burn.started)/burn.duration);if(progress>=1){clearInterval(id);if(!burnPaid.current){burnPaid.current=true;finishBurn(burn)}}else setBurn({...burn,progress})},50);return()=>clearInterval(id)},[burn?.phase,burn?.started,burn?.duration]);
 useEffect(()=>{if(burn?.phase!=='done')return;const id=setTimeout(()=>{setBurn(null);if(burn.final)setGame(g=>g.ending==='afterglow'?{...g,ending:'ashes'}:g)},900);return()=>clearTimeout(id)},[burn?.phase,burn?.started]);
 useEffect(()=>{if(game.factoryPaused||game.ending||!level(game,'autoignite'))return;const interval=Math.max(1800,8000*(.95**level(game,'storage'))*(.85**level(game,'line'))*(.85**level(game,'factory')));if(Date.now()-lastAuto.current>=interval&&!burn){lastAuto.current=Date.now();ignite(true)}},[now,game,burn]);
 useEffect(()=>()=>clearTimeout(timeout.current),[]);
 const flash=(t)=>{setToast(t);clearTimeout(timeout.current);timeout.current=setTimeout(()=>setToast(''),2100)};
 useEffect(()=>{const entries=availableJournal(game);if(!entries.length)return;setGame(g=>{const newlyAvailable=availableJournal(g);return newlyAvailable.length?{...g,journal:[...g.journal,...newlyAvailable.map(entry=>entry.id)]}:g});if(lastJournalToast.current!==entries[0].id){lastJournalToast.current=entries[0].id;flash(`研究記録 · ${entries[0].title}`)}},[game.era,game.eraBurns,game.eraIgnitions,game.upgrades,game.unlocked,game.ending,game.journal]);
 function ignite(automatic=false){if(burn||game.ending==='ashes'||game.ending==='afterglow')return;setGesture(null);const success=Math.random()<stats.chance;if(!success){setMessage(automatic?'自動着火に失敗… 次の間隔で再試行します':'火花が消えた… もう一度擦ってみよう');setSparks(true);setTimeout(()=>setSparks(false),500);if(!automatic)flash('着火失敗 · 報酬なし');return false}
   burnPaid.current=false;const pts=1+level(game,'box')+level(game,'stock'),final=game.ending==='awaiting-last-match';setGame(g=>({...g,points:g.points+pts,totalIgnitions:g.totalIgnitions+1,eraIgnitions:g.eraIgnitions+1}));setMessage(final?'最後の一本に、火が移った。':automatic?`自動着火 · +${pts} ポイント`:`${pts} ポイント獲得 · 炎が灯った`);setBurn({phase:'ignite',started:Date.now(),duration:stats.burn*1000,progress:0,ember:stats.ember,ash:stats.ash,final});if(!final)flash(`${automatic?'自動着火':'着火成功'} · +${pts} ポイント`);setTimeout(()=>setBurn(prev=>prev?{...prev,phase:'burning'}:prev),470);return true;
 }
 function finishBurn(completed){setGame(g=>completed.final?{...g,points:0,embers:0,ash:g.ash+completed.ash+Math.floor(g.embers/10)+Math.floor(g.points/100),totalBurns:g.totalBurns+1,eraBurns:g.eraBurns+1,ending:'afterglow',factoryPaused:true}:{...g,embers:g.embers+completed.ember,ash:g.ash+completed.ash,totalBurns:g.totalBurns+1,eraBurns:g.eraBurns+1});setMessage(completed.final?'火が消えた。机には灰だけが残った。':`燃え殻 +${completed.ember} · 灰 +${completed.ash}`);if(!completed.final)flash(`燃焼完了 · +${completed.ember} 燃え殻 / +${completed.ash} 灰`);setBurn({...completed,phase:'done',started:Date.now(),duration:900,progress:1});}
 function down(e){if(burn)return;e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);drag.current={x:e.clientX,y:e.clientY,distance:0,last:e.clientX,time:Date.now(),count:0};setGesture({x:e.clientX,y:e.clientY});setMessage('摩擦面で左右にすばやく擦ってください')}
 function move(e){if(!drag.current)return;const d=drag.current;const dx=Math.abs(e.clientX-d.last);d.distance+=dx;d.last=e.clientX;d.count++;setGesture({x:e.clientX,y:e.clientY});if(d.distance>34&&d.count>1){drag.current=null;setGesture(null);ignite();}}
 function up(){drag.current=null;setGesture(null)}
 function buy(item){if(game.ending)return;const price=cost(item,game);setGame(g=>({...g,[item.currency]:g[item.currency]-price,upgrades:{...g.upgrades,[item.id]:level(g,item.id)+1}}));flash(item.id==='autoignite'?'自動着火を開始 · 基本8秒間隔':`${item.name} を強化しました`)}
 function unlock(m){if(game.ending)return;const currency=m.currency||'embers';setGame(g=>({...g,[currency]:g[currency]-m.cost,unlocked:[...g.unlocked,m.id],selected:m.id}));setNotice(m);}
 function startFinale(){if(!canBeginFinale(game))return;setGame(g=>({...g,factoryPaused:true,ending:'awaiting-last-match',selected:'ultimate'}));setMessage('工場が止まった。最後の一本を、手で擦る。');}
 function toggleFactory(){setGame(g=>({...g,factoryPaused:!g.factoryPaused}));flash(game.factoryPaused?'生産設備が再び動き出した':'生産設備が静まった');}
 function startNewEra(){setGame(g=>beginNewEra(g));setBurn(null);setMessage('灰の底に、新しい火種がある。');setToast('灰から、新しい火種が生まれた');}
 function reset(){if(confirm('セーブデータをリセットしますか？')){const n=fresh();setGame(n);setBurn(null);localStorage.removeItem('match-incremental-v02')}}
 const tabs=[['points','ポイント強化',CircleDollarSign],['embers','燃え殻強化',Flame],['ash','灰強化',Sparkles],['book','マッチ図鑑',BookOpen]];
 const elapsed=burn?Math.max(0,1-(Date.now()-burn.started)/burn.duration):0;
 if(breakOpen)return <CigaretteBreak match={match} onBack={()=>setBreakOpen(false)}/>;
 if(game.ending==='ashes')return <main className="ending-screen"><div className="ending-grain"/><div className="ending-content"><small>ERA {game.era+1} · THE FIRE HAS PASSED</small><AshPile/><h1>火は消えた。</h1><p>熱は去り、ここには灰だけが残る。<br/>終わりの底に、まだ小さな種が眠っている。</p><button className="new-era-button" onClick={startNewEra}>NEW ERA <ChevronRight size={16}/></button><span className="next-era-ash">灰の火種　{Math.max(1,Math.floor(Math.sqrt(game.ash)))}</span></div></main>;
 return <main className="app-shell">
  <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><Flame size={21}/></span><span><b>MATCH</b> INCREMENTAL<small>VISUAL EVOLUTION <i>v0.2</i></small></span></a><div className="resources"><Resource label="ポイント" value={game.points} color="gold"/><Resource label="燃え殻" value={game.embers} color="ember"/><Resource label="灰" value={game.ash} color="ash"/></div><button className="cigarette-break-entry" onClick={()=>setBreakOpen(true)}>CIGARETTE BREAK</button><button className="icon-button reset" aria-label="リセット" onClick={reset}><RotateCcw size={16}/></button></header>
  <div className="save-transfer-row"><SaveTransfer onImported={setGame}/></div>
  <section className={`hero ${level(game,'factory')>=3?'factory-developed':''}`}><div className="eyebrow"><span className="live-dot"/>{game.ending==='awaiting-last-match'?'THE LAST MATCH':burn?'BURNING IN PROGRESS':'YOUR WORKBENCH'}<span className="eyeline"/></div><h1>{game.ending==='awaiting-last-match'?<>最後の火を、<em>手の中に。</em></>:<>一本の火を、<em>育てる。</em></>}</h1><p className="intro">{game.ending==='awaiting-last-match'?'工場は止まった。静けさの中で、最後の一本を擦る。':game.eraBurns>=20?'工場の音が、机まで届いている。':'擦って、灯して、育てよう。火が消えたあとには、次の成長の種が残る。'}</p>
    <div className={`workbench ${burn?'is-burning':''}`}>
      <div className="bench-meta"><span><span className="mini-dot"/>{match.name}</span><span>{burn?`残り ${Math.max(0,((burn.duration-(Date.now()-burn.started))/1000)).toFixed(1)} 秒`:'READY TO STRIKE'}</span></div>
      <div className="stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="spotlight"/><div className="match-shadow"/><PixelMatch match={match} phase={burn?.phase||'idle'} progress={burn?1-elapsed:0} upgrade={level(game,'head')+level(game,'hardwood')}/>
        <div className={`striker ${gesture?'active':''}`}><span className="striker-grit"/><span className="striker-label">STRIKE ZONE</span></div>
        {gesture&&<span className="gesture-cursor" style={{left:gesture.x,top:gesture.y}}><MousePointer2 size={18}/></span>}
        {sparks&&<div className="failed-sparks">✦　·　✧</div>}
        {!burn&&!gesture&&<div className="swipe-hint"><span>←</span><MousePointer2 size={15}/><span>→</span></div>}
      </div>
      <div className="burn-info"><span className="status-message">{burn?<><span className="burn-dot"/> {burn.phase==='ignite'?'着火中…':'マッチが燃えています'}</>:message}</span><span className="burn-time">{burn?`${Math.round(stats.burn)}s 燃焼`:`着火率 ${Math.round(stats.chance*100)}%`}</span></div>
      <div className="burn-bar"><span style={{width:burn?`${elapsed*100}%`:'0%'}}/></div>
      <div className="bench-bottom"><span><Info size={13}/> 端から端へドラッグ / スワイプ</span><span>{burn?`燃焼報酬　✦ ${burn.ember}　·　灰 ${burn.ash}`:`着火報酬　+${1+level(game,'box')+level(game,'stock')} pt`}</span></div>
    </div>
    {game.ending==='awaiting-last-match'?<div className="last-match-note"><span>THE LAST MATCH</span><p>燃え尽きたあと、ポイントも燃え殻も手放す。灰だけを残して、新しい火を待つ。</p></div>:<div className="quick-stats"><div><span>生涯着火数</span><b>{game.totalIgnitions}</b></div><div><span>燃焼完了</span><b>{game.totalBurns}</b></div><div><span>現在のマッチ</span><b>{match.subtitle}</b></div><div className="next-unlock"><span>次の発見</span><b>{MATCHES.find(m=>!game.unlocked.includes(m.id))?.name||'全種発見！'}</b></div></div>}
    {canBeginFinale(game)&&<div className="finale-invitation"><div><small>A QUIET ENDING</small><p>すべての火を見届けた。工場を止め、最後の一本を手で灯すことができる。</p></div><button onClick={startFinale}>工場を止める <ChevronRight size={15}/></button></div>}
  </section>
  {game.ending!=='awaiting-last-match'&&<section className="growth"><div className="section-heading"><div><div className="eyebrow muted">GROW YOUR COLLECTION</div><h2>火を育てる</h2></div><span className="section-caption">強化はマッチの姿と炎にも反映されます</span></div>
    <nav className="tabs">{tabs.map(([id,label,Icon])=><button key={id} className={game.tab===id?'selected':''} onClick={()=>setGame(g=>({...g,tab:id}))}><Icon size={15}/>{label}{id==='book'&&<span className="tab-count">{game.unlocked.length}/{MATCHES.length}</span>}</button>)}</nav>
    {game.tab==='book'?<><div className="collection-note"><BookOpen size={15}/> マッチ図鑑 <span>新しい種類を解放すると、見た目・着火率・燃焼時間が進化します。</span></div><Collection state={game} onSelect={id=>!game.ending&&setGame(g=>({...g,selected:id}))} onUnlock={unlock}/><ResearchArchive state={game}/></>:<>
      <div className="upgrade-intro"><div className={`upgrade-resource ${game.tab}`}><span>{game.tab==='points'?<CircleDollarSign size={18}/>:game.tab==='embers'?<Flame size={18}/>:<Sparkles size={18}/>}</span><div><small>使用できる資源</small><b>{game[game.tab].toLocaleString('ja-JP')} <i>{game.tab==='points'?'ポイント':game.tab==='embers'?'燃え殻':'灰'}</i></b></div></div><p>{game.tab==='points'?'擦る力を磨いて、火花をもっと確かに。':game.tab==='embers'?'燃え殻を素材に、マッチそのものを鍛える。':'灰から設備を作り、火の仕事を自動化する。'}</p></div>
      {game.tab==='ash'&&<div className="factory-control"><div><small>自動着火の状態</small><p>{game.factoryPaused?'停止中。工場を再開すると自動着火します。':game.ending?'エンディング中は自動着火しません。':!level(game,'autoignite')?'未稼働。自動着火装置を購入すると、基本8秒間隔で始まります。':burn?'稼働中。燃焼完了後、次の間隔で着火します。':`稼働中 · 約${(8*(.95**level(game,'storage'))*(.85**level(game,'line'))*(.85**level(game,'factory'))).toFixed(1)}秒ごとに着火します。`}</p></div><button onClick={toggleFactory}>{game.factoryPaused?'工場を再開':'工場を止める'}</button></div>}
      <div className="upgrade-list">{UPGRADES[game.tab].map(item=><UpgradeCard key={item.id} item={item} state={game} buy={buy}/>)}</div>
    </>}
  </section>}
  {game.ending!=='awaiting-last-match'&&<footer><span>一度灯した火は、あなたの机に残り続ける。</span><span>A SMALL FIRE, A LONG WAY. <button onClick={reset}>データをリセット</button></span></footer>}
  {toast&&<div className="toast"><span><Check size={14}/></span>{toast}</div>}
  {notice&&<div className="unlock-overlay"><div className="unlock-modal"><button className="modal-close" onClick={()=>setNotice(null)}><X size={16}/></button><div className="unlock-spark"><Sparkles size={23}/></div><small>NEW MATCH UNLOCKED</small><PixelMatch match={notice}/><h2>{notice.name}</h2><p>{notice.desc}</p><div className="modal-stats"><span>燃焼 {notice.burn}秒</span><span>着火率 {Math.round(notice.chance*100)}%</span><span>燃え殻 +{notice.ember}</span></div><button className="modal-continue" onClick={()=>setNotice(null)}>火を灯す <ChevronRight size={15}/></button></div></div>}
 </main>
}
export default App;
