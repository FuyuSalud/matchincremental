import React from 'react';

const STYLES = {
  wood: { shaft: '#b8793f', light: '#e4b367', dark: '#704125', head: '#d64e35', headLight: '#f17a44', flame: ['#f84b25','#ffad35','#fff07a'], effect: '#ffe267' },
  grain: { shaft: '#bd8b50', light: '#ebc779', dark: '#765231', head: '#d65339', headLight: '#ff8a50', flame: ['#f85929','#ffc64e','#fff3a0'], effect: '#ffcf59' },
  black: { shaft: '#3f3832', light: '#6b5a4a', dark: '#211e1c', head: '#8b3037', headLight: '#bd4540', flame: ['#a4202b','#ef5430','#ffd26a'], effect: '#ff5b38' },
  blue: { shaft: '#315b7a', light: '#6396ae', dark: '#192d43', head: '#b8e9ef', headLight: '#f0ffff', flame: ['#2369bd','#43c4e9','#d9ffff'], effect: '#86eaff' },
  metal: { shaft: '#9e9b86', light: '#e2d4a6', dark: '#625d50', head: '#dfa938', headLight: '#ffdf6c', flame: ['#a9c7c8','#e7f0d8','#fff9c7'], effect: '#fff0a1' },
  ultimate: { shaft: '#654d83', light: '#bd8dcc', dark: '#302442', head: '#da84e5', headLight: '#ffcff7', flame: ['#844ee0','#dc79eb','#fff0ff'], effect: '#ffd4ff' },
  silhouette: { shaft: '#292922', light: '#34342d', dark: '#1b1c19', head: '#3b3a31', headLight: '#444237', flame: ['#3b3328','#4a3c2a','#51452b'], effect: '#51452b' },
};
const px = (x,y,color,w=1,h=1,key=`${x}-${y}`) => <rect key={key} x={x} y={y} width={w} height={h} fill={color}/>;

function PixelMatchArt({ match, phase, progress, upgrade }) {
  const palette = STYLES[match.wood] || STYLES.wood;
  const burning = phase === 'burning' || phase === 'ignite';
  const front = burning ? 130 - Math.max(0,Math.min(1,progress))*100 : 130;
  const blocks = [];
  // The shaft has a one-pixel ink outline and a blocky wood grain unique to each match.
  blocks.push(px(14,27,palette.dark,118,10,'shaft-outline'));
  for (let x=15; x<131; x++) {
    if (burning && x > front + 5) continue;
    const charred = burning && x >= front;
    const wood = palette.shaft;
    for (let y=28; y<36; y++) {
      let color = charred ? (y===30 || y===33 ? '#49352b' : '#292421') : wood;
      if (!charred) {
        if (y===28 || y===35) color=palette.dark;
        else if (y===29 && (x%13<3 || match.wood==='metal')) color=palette.light;
        else if ((match.wood==='grain' || upgrade>0) && (y===32 && (x%11<4) || y===30 && x%19<5)) color=palette.light;
        else if (match.wood==='black' && y===33 && x%9<3) color=palette.dark;
        else if (match.wood==='blue' && y===31 && x%14<5) color=palette.light;
        else if (match.wood==='metal' && y===31) color=palette.light;
        else if (match.wood==='ultimate' && y===32 && x%10<3) color='#e1a8e6';
      } else if (y===29 && x%7<2) color='#a94b32';
      blocks.push(px(x,y,color,1,1,`wood-${x}-${y}`));
    }
  }
  // A stepped, separate match head. It disappears as the burn front travels down the shaft.
  const headWidths=[4,8,12,15,17,18,18,17,15,12,8,4];
  if (!burning || progress < .09) headWidths.forEach((width,row)=>{
    const y=22+row, x=137-Math.floor(width/2);
    blocks.push(px(x,y,palette.dark,width,1,`head-edge-${row}`));
    blocks.push(px(x+1,y+1,palette.head,width-2,1,`head-${row}`));
    if(row<4 && width>7) blocks.push(px(x+3,y+1,palette.headLight,Math.max(2,Math.floor(width/3)),1,`head-glint-${row}`));
  });

  const sparks=[];
  if (phase==='ignite') {
    [[-5,-7],[-2,-11],[3,-8],[7,-4],[-7,0],[5,2],[1,-14]].forEach(([dx,dy],i)=>{
      const colors=[palette.effect,palette.effect,'#fff0a2'];
      sparks.push(px(130+dx,29+dy,colors[i%3],i%3===0?2:1,i%2===0?2:1,`spark-${i}`));
    });
  }
  if (phase==='burning') {
    const flameX=Math.max(22,Math.round(front)-3);
    const frames=[
      ['....##....','...####...','..######..','.########.','##########','##########','.########.','..######..','...####...','....##....'],
      ['.....##...','....####..','...######.','..########','.##########','##########','##########','.########.','..######..','...####...'],
    ];
    const outer=frames.map((frame,fi)=><g key={`flame-frame-${fi}`} className={`pixel-flame-frame frame-${fi}`}>
      {frame.flatMap((row,ry)=>[...row].flatMap((cell,rx)=>cell==='#'?[px(flameX+rx,17+ry,palette.flame[0],1,1,`o-${fi}-${rx}-${ry}`)]:[]))}
      {['....##....','...####...','..######..','...####...','....##....'].flatMap((row,ry)=>[...row].flatMap((cell,rx)=>cell==='#'?[px(flameX+rx+2,21+ry,palette.flame[1],1,1,`m-${fi}-${rx}-${ry}`)]:[]))}
      {[px(flameX+4,25,palette.flame[2],2,2,`core-a-${fi}`),px(flameX+5,27,palette.flame[2],1,1,`core-b-${fi}`)]}
    </g>);
    sparks.push(...outer);
    // Ember and ash flecks trail behind the animated flame.
    sparks.push(px(flameX-4,34,palette.effect,1,2,'burn-spark-a'),px(flameX+8,37,'#f4a640',1,1,'burn-spark-b'));
  }
  if (phase==='done') {
    sparks.push(px(126,39,'#292421',4,3,'cinder'),px(132,44,'#a94b32',2,2,'ember-drop'),px(125,51,'#c5beb0',1,2,'ash-a'),px(135,53,'#aaa596',2,1,'ash-b'),px(130,57,'#ddd5c3',1,1,'ash-c'));
  }
  return <svg className="pixel-match-svg" viewBox="0 0 160 64" role="img" aria-label={match.name} shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <g className="pixel-sprite" style={{opacity:phase==='done'?0:1}}>{blocks}</g><g className={`pixel-effects effects-${phase}`}>{sparks}</g>
  </svg>;
}

export function PixelIcon({ type }) {
  const color = type==='gold' ? '#f2cf59' : type==='ember' ? '#e86438' : '#c9c8bd';
  const dark = type==='gold' ? '#815a25' : type==='ember' ? '#762d25' : '#777970';
  let cells=[];
  if(type==='gold') {
    cells=[px(5,1,dark,6,1),px(3,2,color,10,1),px(2,3,color,12,9),px(3,12,color,10,2),px(5,14,dark,6,1),px(6,4,'#fff0a0',1,1),px(7,5,'#fff0a0',3,1),px(9,8,dark,2,1),px(7,10,dark,4,1)];
  } else if(type==='ember') {
    cells=[px(7,1,dark,3,2),px(5,3,color,7,2),px(3,5,color,11,4),px(4,9,color,9,3),px(6,12,dark,5,2),px(7,5,'#ffb54e',2,2),px(6,9,'#ffb54e',2,1)];
  } else {
    cells=[px(4,11,dark,8,2),px(3,9,color,10,2),px(5,7,color,6,2),px(6,5,color,4,2),px(7,3,color,2,2),px(1,13,'#777970',2,1),px(13,12,'#777970',2,1),px(8,4,'#f1eee3',1,1)];
  }
  return <svg className="pixel-icon-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">{cells}</svg>;
}

export function AshPile() {
  const flecks=[[5,8,2,1],[35,5,2,1],[10,14,2,1],[31,12,1,2],[2,18,2,1],[41,16,2,1]];
  const mound=[[13,18,21,2],[9,20,29,2],[6,22,35,2],[3,24,41,2],[8,26,32,2],[14,28,20,2]];
  return <svg className="ash-pile" viewBox="0 0 48 32" role="img" aria-label="灰の山" shapeRendering="crispEdges">
    {flecks.map(([x,y,w,h],i)=>px(x,y,i%2?'#77756d':'#aaa395',w,h,`fleck-${i}`))}
    {mound.map(([x,y,w,h],i)=>px(x,y,['#77756d','#969186','#c3bbab','#a8a194','#77756d','#4a4842'][i],w,h,`ash-${i}`))}
    {px(13,22,'#ded6c4',5,1,'ash-glint-a')}{px(23,24,'#d5cdbd',3,1,'ash-glint-b')}
  </svg>;
}

export function PixelMatch({match,phase='idle',progress=0,upgrade=0,small=false}) {
  return <div className={`match-art ${small?'small':''} wood-${match.wood} phase-${phase} ${upgrade?'wood-enhanced':''}`}>
    <PixelMatchArt match={match} phase={phase} progress={progress} upgrade={upgrade}/>
  </div>;
}
