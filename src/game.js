export const MATCHES = [
  { id:'common', name:'普通のマッチ', subtitle:'The familiar one', desc:'静かな火花から始まる、すべての物語。', burn:5, chance:0.72, ember:1, ash:1, unlock:'最初から使用可能', wood:'wood', flame:'orange', cost:0 },
  { id:'fine', name:'高品質マッチ', subtitle:'Kiln-dried birch', desc:'木目の美しい軸と、長く安定した炎。', burn:8, chance:0.82, ember:2, ash:1, unlock:'燃え殻 12 個を集める', wood:'grain', flame:'steady', cost:12 },
  { id:'black', name:'黒色マッチ', subtitle:'Cinderwood', desc:'炭化木の軸に、赤熱する火花が散る。', burn:11, chance:0.86, ember:4, ash:2, unlock:'燃え殻 45 個を集める', wood:'black', flame:'red', cost:45 },
  { id:'blue', name:'青炎マッチ', subtitle:'Cryo-flare', desc:'深い藍の軸から、澄んだ青い炎が立つ。', burn:14, chance:0.90, ember:7, ash:3, unlock:'灰 20 個を集める', wood:'blue', flame:'blue', cost:20, currency:'ash' },
  { id:'metal', name:'金属製マッチ', subtitle:'Aurum alloy', desc:'磨かれた金属と白金色の炎。', burn:18, chance:0.94, ember:12, ash:5, unlock:'燃え殻 180 個を集める', wood:'metal', flame:'platinum', cost:180 },
  { id:'ultimate', name:'究極のマッチ', subtitle:'The last spark', desc:'未知の素材が星のように燃え続ける。', burn:24, chance:0.98, ember:22, ash:10, unlock:'灰 100 個を集める', wood:'ultimate', flame:'cosmic', cost:100, currency:'ash' },
];
export const UPGRADES = {
  points:[
    {id:'grip',name:'擦りやすさ',desc:'着火率 +4%',currency:'points',base:12,effect:'+4%', max:8},
    {id:'primer',name:'着火補助',desc:'着火率 +5%',currency:'points',base:22,effect:'+5%', max:8},
    {id:'stock',name:'マッチの在庫',desc:'着火成功時のポイント +1',currency:'points',base:30,effect:'+1 pt',max:6},
    {id:'box',name:'マッチ箱の拡張',desc:'擦るたびの固定ポイント +1',currency:'points',base:55,effect:'+1 pt',max:10},
  ],
  embers:[
    {id:'density',name:'木材密度',desc:'燃焼時間 +12%',currency:'embers',base:4,effect:'+12%',max:8},
    {id:'head',name:'頭薬改良',desc:'着火率 +3%、頭薬が成長',currency:'embers',base:6,effect:'+3%',max:8},
    {id:'core',name:'芯の構造',desc:'燃え殻 +1 / 周',currency:'embers',base:10,effect:'+1',max:8},
    {id:'hardwood',name:'高品質木材',desc:'軸の木目と艶が増す',currency:'embers',base:15,effect:'見た目',max:5},
    {id:'stable',name:'炎の安定化',desc:'燃焼時間 +15%',currency:'embers',base:18,effect:'+15%',max:8},
    {id:'efficiency',name:'燃焼効率',desc:'灰 +1 / 周',currency:'embers',base:28,effect:'+1',max:8},
  ],
  ash:[
    {id:'collector',name:'灰回収装置',desc:'灰 +1 / 周',currency:'ash',base:5,effect:'+1',max:8},
    {id:'autoignite',name:'自動着火装置',desc:'購入すると8秒ごとに自動で着火',currency:'ash',base:12,effect:'8秒間隔',max:1},
    {id:'storage',name:'マッチ保管庫',desc:'自動着火の間隔を少し短縮',currency:'ash',base:20,effect:'-5%',max:8},
    {id:'line',name:'生産ライン',desc:'自動着火の間隔を短縮',currency:'ash',base:35,effect:'-15%',max:1},
    {id:'simul',name:'同時燃焼数',desc:'灰の獲得が増加',currency:'ash',base:50,effect:'+1灰',max:5},
    {id:'factory',name:'自動生産設備',desc:'自動着火の間隔を短縮',currency:'ash',base:90,effect:'-15%',max:6},
  ]
};
export const JOURNAL = [
  {id:'first-ash',title:'最初の灰',text:'火は手のひらを離れた。残ったものは、思っていたより軽い。'},
  {id:'ten-fires',title:'同じ長さの夜',text:'何度灯しても、一本は二度と戻らない。'},
  {id:'first-machine',title:'手を離れた火',text:'装置は誰も見ていない夜にも、律儀に火を灯した。'},
  {id:'many-machines',title:'休まない炉',text:'火は増えた。静けさのほうが、先に減っていった。'},
  {id:'all-matches',title:'図鑑の余白',text:'遠い火を集めるほど、最初の一本の記憶は淡くなる。'},
  {id:'last-call',title:'最後の火種',text:'機械を止める時が来た。最後の一本だけは、自分の手で。'},
  {id:'new-era',title:'冷えた灰の底',text:'灰は終わりの形をしていた。けれど、指先に小さな熱が戻る。'},
];
export const fresh = () => ({points:0,embers:0,ash:0,upgrades:{},unlocked:['common'],selected:'common',totalIgnitions:0,totalBurns:0,eraIgnitions:0,eraBurns:0,era:0,eraHistory:[],journal:[],ending:null,factoryPaused:false,tab:'points'});
export function loadGame(){try{const raw=JSON.parse(localStorage.getItem('match-incremental-v02'));return {...fresh(),...raw,ending:raw?.ending==='afterglow'?'ashes':raw?.ending||null,upgrades:raw?.upgrades||{},unlocked:raw?.unlocked||['common'],eraIgnitions:raw?.eraIgnitions??raw?.totalIgnitions??0,eraBurns:raw?.eraBurns??raw?.totalBurns??0,eraHistory:Array.isArray(raw?.eraHistory)?raw.eraHistory:[],journal:Array.isArray(raw?.journal)?raw.journal:[]};}catch{return fresh();}}
export function saveGame(state){localStorage.setItem('match-incremental-v02',JSON.stringify(state));}
export function level(state,id){return state.upgrades?.[id]||0;}
export function cost(upgrade,state){return Math.ceil(upgrade.base*Math.pow(1.62,level(state,upgrade.id)));}
export function matchStats(state,match=MATCHES.find(m=>m.id===state.selected)||MATCHES[0]){
  const lv=id=>level(state,id);
  return {burn:match.burn*(1+lv('density')*.12+lv('stable')*.15), chance:Math.min(.99,match.chance+lv('grip')*.04+lv('primer')*.05+lv('head')*.03), ember:match.ember+lv('core')+lv('simul'), ash:match.ash+lv('efficiency')+lv('collector')+lv('simul')};
}
export function canUnlock(state,m){if(state.unlocked.includes(m.id))return false;if(m.currency==='ash')return state.ash>=m.cost;return state.embers>=m.cost;}
export function canBeginFinale(state){return !state.ending&&MATCHES.every(m=>state.unlocked.includes(m.id))&&state.eraBurns>=30&&level(state,'autoignite')>0&&level(state,'line')>0&&level(state,'factory')>0;}
export function availableJournal(state){
  const allMatches=MATCHES.every(m=>state.unlocked.includes(m.id));
  const conditions={
    'first-ash':state.eraBurns>=1,
    'ten-fires':state.eraBurns>=10,
    'first-machine':level(state,'autoignite')>0&&level(state,'line')>0,
    'many-machines':level(state,'factory')>=3||state.eraBurns>=20,
    'all-matches':allMatches,
    'last-call':canBeginFinale(state)||state.ending==='awaiting-last-match',
    'new-era':state.era>0,
  };
  return JOURNAL.filter(entry=>conditions[entry.id]&&!state.journal.includes(entry.id));
}
export function beginNewEra(state){
  const carriedAsh=Math.max(1,Math.floor(Math.sqrt(Math.max(0,state.ash))));
  return {...state,points:0,embers:0,ash:carriedAsh,upgrades:{},unlocked:['common'],selected:'common',era:state.era+1,eraIgnitions:0,eraBurns:0,eraHistory:[...state.eraHistory,{era:state.era,ash:state.ash,totalBurns:state.totalBurns}],ending:null,factoryPaused:false,tab:'points'};
}
