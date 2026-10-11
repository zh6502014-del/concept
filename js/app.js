
'use strict';
(() => {
// Independent portfolio reader: story, rules and game screenshot presentation.
const STORE='nightfall.portfolio.storybook.v0.1';
// Public contact details supplied by the author. No contact data is collected.
const {AUTHOR,CHAPTERS,CHARACTERS,WORLD,THEMES,ASSETS}=window.ND_DATA;
// All URLs resolve relative to index.html; no leading slash or runtime fetch.
const icon=(key,size=28)=>{const card=['attack','defense','dodge','back'].includes(key);const aliases={book:'journal',menu:'rules',arrow:'right'};return `<img class="icon ${card?'card-art':''}" src="./assets/${card?'images/cards/'+key+'.webp':'svg/icons/'+(aliases[key]||key)+'.svg'}" width="${size}" height="${size}" alt="" aria-hidden="true">`};
const art=(id,cls='',alt='',priority=false)=>{const a=ASSETS[id];if(!a)return '';return `<img class="art-image ${cls}" src="./${a.path}" width="${a.width}" height="${a.height}" loading="${priority?'eager':'lazy'}" decoding="async" ${priority?'fetchpriority="high"':''} alt="${alt||a.title}">`};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const newState=()=>({version:3,page:0,world:0,rulesMode:0,char:0,hotspot:'door',theme:0,reflection:'',focusTheme:null,visited:[]});
let storageOK=true, saved=null;
try{saved=JSON.parse(localStorage.getItem(STORE)||'null');localStorage.setItem(STORE+'.check','1');localStorage.removeItem(STORE+'.check')}catch(e){storageOK=false}
let S=newState();
// Restore only validated reader preferences and page state.
if(saved?.version===1||saved?.version===2||saved?.version===3){
 const migratePage=n=>saved.version===1?(n>=7?n-2:n>=5?4:n):saved.version===2?(n>=9?n+1:n):n;
 const int=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
 if(int(saved.page,0,saved.version===1?14:saved.version===2?12:13))S.page=migratePage(saved.page);
 for(const [k,max]of[['world',2],['char',CHARACTERS.length-1],['theme',2]])if(int(saved[k],0,max))S[k]=saved[k];
 if(['door','bench','sample'].includes(saved.hotspot))S.hotspot=saved.hotspot;
 S.reflection=typeof saved.reflection==='string'?saved.reflection.slice(0,500):'';
 S.focusTheme=int(saved.focusTheme,0,2)?saved.focusTheme:null;

 S.visited=Array.isArray(saved.visited)?[...new Set(saved.visited.filter(x=>int(x,0,saved.version===1?14:saved.version===2?12:13)).map(migratePage))]:[];

}
let toastTimer=null,focusBeforeModal=null;
let pageTurning=false,navigationSerial=0;
let contentObserver;
let tipPage=-1,scrollTipDismissed=false;
function observeContent(){
 contentObserver?.disconnect();
 const scroller=$('#book-content');
 if(tipPage!==S.page){tipPage=S.page;scrollTipDismissed=false}
 const update=()=>{
  if(scroller.scrollTop>0)scrollTipDismissed=true;
  const tip=$('#scroll-status');
  tip.textContent='向下捲動閱讀 ↓';
  tip.hidden=scrollTipDismissed||scroller.scrollHeight-scroller.clientHeight<=3;
 };
 scroller.addEventListener('scroll',update,{passive:true});
 contentObserver=new ResizeObserver(update);contentObserver.observe(scroller);
 for(const child of scroller.children)contentObserver.observe(child);
 update();
}
const $=s=>document.querySelector(s);
const readerFooter=$('.reader-footer');
const persist=()=>{if(!storageOK)return;try{const data=structuredClone(S);localStorage.setItem(STORE,JSON.stringify(data))}catch(e){storageOK=false}};
const announce=t=>{$('#announcer').textContent=t};
function toast(t){clearTimeout(toastTimer);$('#toast').textContent=t;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800)}
const btn=(text,action,cls='primary',extra='')=>`<button class="btn ${cls}" data-action="${action}" ${extra}>${text}</button>`;
const goBtn=(text,page,cls='primary')=>`<button class="btn ${cls}" data-go="${page}">${text}</button>`;
const label=(a,b)=>`<div class="spread-label"><span>${a}</span><span>${b}</span></div>`;
const worldGraphic=(final=false)=>`<figure class="world-art ${final?'return-art':''}">${art('vesperland','','維斯珀蘭全景：群山、河流與各地聚落',true)}<figcaption>${final?'同一片燈火。這一次，也看見光之外的人。':'維斯珀蘭 / 八座城市所在的土地'}</figcaption></figure>`;
const worldStack=()=>`<div class="world-photo-stack" aria-label="夜域、暮晶與暮鐘的原遊戲美術">${[
 ['world-nightfall.webp','夜域','夜域逼近城鎮，荒地上留下紫色結晶'],
 ['world-crystal.webp','暮晶','原遊戲中的紫色暮晶素材'],
 ['world-bell.webp','暮鐘','暮鐘下的祭司與祈福人群']
].map(([file,title,alt],i)=>`<figure class="world-photo world-photo-${i} ${S.world===i?'is-front':''}"><img src="./assets/images/scenes/${file}" alt="${alt}" decoding="async"><figcaption>${String(i+1).padStart(2,'0')} ／ ${title}</figcaption></figure>`).join('')}</div>`;
const VIEWS=[
 {chapter:-1,title:'封面',type:'單張封面',class:'dark art-cover',html:()=>`<div class="fullspread">${label('AN INTERACTIVE PORTFOLIO','VOL. 03 / PAGE-TURN EDITION')}<div class="cover-grid"><div><div class="eyebrow">A WORLD BUILT ON SURVIVAL</div><h1 class="cover-title" id="view-title" tabindex="-1">NIGHTFALL<br>DUEL</h1><p class="cover-sub">把故事，翻成一次體驗。</p><p class="cover-copy">這不是整部劇情的重述。四個章節，帶你認識世界、理解玩法、閱讀故事，最後回到故事最初的提問。</p><div class="actions">${goBtn('翻開故事書 →',1,'light')}</div><p class="note" style="margin-top:17px">翻頁、看見角色與世界。從一個問題開始。</p></div><div class="cover-index">${CHAPTERS.map(c=>`<div class="cover-item"><span>${c.n}</span><div><strong>${c.name}</strong><small>${c.full}</small></div></div>`).join('')}</div></div></div>`},
 {chapter:0,title:'故事設定',type:'跨頁滿版',class:'',html:()=>`<div class="fullspread">${label('CHAPTER 01 / WORLD','故事設定')}<div class="world-layout world-intro"><div><h2 class="statement" id="view-title" tabindex="-1">故事設定</h2><p class="world-caption">在 NIGHTFALL DUEL 的世界裡，人們仰望暮鐘，依靠暮晶，也試著在夜域來臨以前找到庇護。</p><div class="tabs-row" aria-label="世界設定">${WORLD.map((w,i)=>`<button id="world-${i}" class="tab" aria-pressed="${S.world===i}" data-world="${i}">${String(i+1).padStart(2,'0')} ${w.title}</button>`).join('')}</div><div class="tab-content"><h3>${WORLD[S.world].title}</h3><p>${WORLD[S.world].text}</p></div></div>${worldStack()}</div></div>`},
 {chapter:0,title:'角色設定',type:'左右對頁',class:'',html:()=>{const c=CHARACTERS[S.char];return `<div class="pair"><section class="leaf">${label('CHAPTER 01 / CHARACTERS','職業與技能設計')}<h2 id="view-title" tabindex="-1">四種職業<br>四種戰鬥節奏</h2><p class="muted" style="margin-top:15px;">從閃避反擊、蓄勢爆發到承傷控制與持續傷害，四位角色各有不同的戰鬥定位。以下以故事模式技能為例。</p><div class="character-list" aria-label="選擇人物">${CHARACTERS.map((x,i)=>`<button class="character-choice" id="char-${i}" data-char="${i}" aria-pressed="${i===S.char}"><span class="mono">${x.code}</span><strong>${x.name}</strong><small>${x.job}</small></button>`).join('')}</div></section><section class="leaf character-detail" aria-label="職業與技能介紹"><span class="eyebrow">${c.code} / ${c.job}</span><figure class="portrait-art">${art(c.id,'',c.name+'的角色肖像',true)}<figcaption>${c.job} / ${c.name}</figcaption></figure><h2>${c.name} <span style="font:12px var(--sans);letter-spacing:0">${c.role}</span></h2><p style="margin-top:15px">${c.desc}</p><div class="rules-scope"><strong>故事模式技能</strong><p>${c.play}</p></div></section></div>`}},
 {chapter:0,title:'遊戲機制',type:'單頁・詳細規則',class:'single',html:()=>renderRules()},
 {chapter:1,title:'主線任務',type:'左右對頁・對話與戰鬥截圖',class:'',html:()=>`<div class="pair"><section class="leaf">${label('CHAPTER 02 / MAIN QUEST','故事模式')}<h2 id="view-title" tabindex="-1">對話鋪陳情境<br>戰鬥承接衝突</h2><div class="scene-meta"><span class="tag">劇情對話</span><span class="tag">戰棋式對戰</span></div><p>故事模式透過逐步推進的對話與戰棋式對戰，帶動劇情發展。玩家隨著角色的交談與行動，認識世界、理解人物關係。</p><p class="note" style="margin-top:24px">右側以研究室事件為例，呈現原遊戲中的對話過程與戰鬥畫面。</p></section><section class="leaf">${label('STORY / BATTLE','原遊戲畫面')}<div class="story-photo-stack lab-photo-stack" aria-label="研究室對話與戰鬥截圖"><figure class="story-photo"><img src="./assets/images/screenshots/lab-dialogue.webp" width="1440" height="900" alt="原遊戲研究室對話：凜與赫爾曼的對峙" decoding="async"><figcaption>01 ／ 對話過程</figcaption></figure><figure class="story-photo"><img src="./assets/images/screenshots/lab-battle.webp" width="1440" height="900" alt="原遊戲故事戰鬥：凜對戰赫爾曼博士" decoding="async"><figcaption>02 ／ 戰鬥畫面</figcaption></figure></div></section></div>`},
 {chapter:2,title:'副本任務',type:'左右對頁・遊戲畫面介紹',class:'',html:()=>`<div class="pair"><section class="leaf">${label('CHAPTER 03 / SIDE QUESTS','副本任務')}<h2 id="view-title" tabindex="-1">推進劇情不只有一種方式</h2><div class="scene-meta"><span class="tag">情境解謎</span><span class="tag">劇情連動</span></div><p style="margin-top:21px">副本任務將劇情中的行動轉化為小遊戲。每一種玩法都對應角色當下的處境，讓玩家透過規劃、比對與組裝，親自參與故事的推進。</p><div class="quest-story-links"><p><strong>01 ／ 逃生地圖</strong><br>旋轉路口，替朔接通逃生路線。</p><p><strong>02 ／ 拼接地圖</strong><br>拼回地圖，整理納爾瓦留下的礦坑線索。</p><p><strong>03 ／ 組合槍</strong><br>組合零件，協助伊芙完成暮晶銃。</p></div><p class="note" style="margin-top:22px">右側為原遊戲實際畫面，呈現三種玩法與劇情的連結。</p></section><section class="leaf">${label('THREE SIDE QUESTS','副本任務一覽')}<div class="story-photo-stack quest-photo-stack" aria-label="逃生地圖、拼接地圖與組合槍的遊戲截圖">${[['story-route.webp','01 ／ 逃生地圖','原遊戲鐘樓逃生路線規劃'],['story-map-puzzle.webp','02 ／ 拼接地圖','原遊戲礦坑地圖拼合'],['story-gun.webp','03 ／ 組合槍','原遊戲暮晶銃組裝，機匣與銃管已放入']].map(([file,title,alt])=>`<figure class="story-photo"><img src="./assets/images/screenshots/${file}" width="1440" height="900" alt="${alt}" decoding="async"><figcaption>${title}</figcaption></figure>`).join('')}</div></section></div>`},
 {chapter:2,title:'路線規劃',type:'遊戲截圖介紹',class:'',html:()=>`<div class="fullspread">${label('CHAPTER 03 / CONNECT','朔・鐘樓逃生路線')}<div class="screenshot-feature"><section><p class="eyebrow">SIDE QUEST 01</p><h2 id="view-title" tabindex="-1">把逃生的路，<br>先在圖上接起來。</h2><p>朔需要把握守衛換班的空檔，替朋友找出離開鐘樓的路。</p><p>原遊戲使用 5 × 5 街區圖。玩家旋轉路口，將左上方的鐘樓側門，接到右下方的換班出口，再確認路線。</p><div class="quote">讓「安排逃離」<br>成為看得見的路徑。</div><p class="note">路線接通代表完成規劃，並不保證途中沒有守衛。</p></section><figure class="game-screenshot">${art('story-route','','Game_claude 遊戲截圖：5×5 鐘樓逃生街區圖，入口、出口、旋轉路口與確認路線介面',true)}<figcaption>Game_claude｜鐘樓逃生路線實際畫面・靜態截圖</figcaption></figure></div></div>`},
 {chapter:2,title:'地圖拼合',type:'遊戲截圖介紹',class:'',html:()=>`<div class="fullspread">${label('CHAPTER 03 / ASSEMBLE','迪普霍姆・礦坑地圖')}<div class="screenshot-feature"><section><p class="eyebrow">SIDE QUEST 02</p><h2 id="view-title" tabindex="-1">把分散的線索，<br>放回原來的位置。</h2><p>玩家整理納爾瓦筆記中的礦坑地圖，逐一比對礦坑口、主坑道、崩塌區與結晶洞室。</p><p>原遊戲透過拖曳，或先選圖塊再選輪廓，把四塊地圖放回對應位置。玩家在比對形狀的同時，也逐步讀出坑道之間的關係。</p><div class="quote">從一塊地圖，<br>讀出通往深處的方向。</div><p class="note">截圖呈現拼合過程；完成地圖後，故事才接續比對坑道線索。</p></section><figure class="game-screenshot">${art('story-map-puzzle','','Game_claude 遊戲截圖：礦坑地圖輪廓配對，已放入兩塊，另兩塊留在圖塊區',true)}<figcaption>Game_claude｜礦坑地圖工坊試玩畫面・靜態截圖</figcaption></figure></div></div>`},
 {chapter:2,title:'撐盾救援',type:'遊戲截圖介紹',class:'',html:()=>`<div class="fullspread">${label('CHAPTER 03 / HOLD','格蘭・撐盾救援')}<div class="screenshot-feature"><section><p class="eyebrow">SIDE QUEST 03</p><h2 id="view-title" tabindex="-1">盾只能撐幾秒，<br>要撐在對的時機。</h2><p>第三章，格蘭在城門防線插下救援盾，替落後的母女爭取離開的時間。</p><p>原遊戲把這一幕做成節奏小遊戲：碎晶撞上金環時撐盾；黑流長音要按住，到「放」再放開。失誤累積過多，防線就會失守。</p><div class="quote">把「撐住」<br>變成一段能被聽見的節奏。</div><p class="note">截圖為遊玩中的畫面，沒有保留完整挑戰流程。</p></section><figure class="game-screenshot">${art('story-shield-rhythm','','Game_claude 遊戲截圖：格蘭撐盾守住城門，上方節奏軌道有碎晶向金環靠近',true)}<figcaption>Game_claude｜撐盾救援實際畫面・靜態截圖</figcaption></figure></div></div>`},
 {chapter:2,title:'互動不是插曲',type:'單頁',class:'single',html:()=>`<div class="page-pad">${label('CHAPTER 03 / DESIGN INTENT','玩法如何承接故事')}<div class="single-content"><h2 id="view-title" tabindex="-1">完成的不是一道題，<br>而是一個故事中的動作。</h2><div class="comparison"><div><span class="eyebrow">CONNECT</span><strong>路線規劃</strong><p>旋轉路口，把角色正在安排的逃生路線具體呈現出來。</p></div><div><span class="eyebrow">ASSEMBLE</span><strong>地圖拼合</strong><p>觀察輪廓、整理碎片，讓玩家親自參與尋找坑道的過程。</p></div></div><div class="quote">讓玩法回應<br>角色眼前的問題。</div><p class="note">本章展示原遊戲畫面與設計用意。</p><div class="actions">${goBtn('回到原點 →',9)}</div></div></div>`},
 {chapter:3,title:'回到原點',type:'跨頁滿版',class:'dark ending-book',html:()=>`<div class="fullspread">${label('CHAPTER 04 / RETURN','回到同一個問題')}<div class="world-layout" style="min-height:405px"><div><h2 class="statement" id="view-title" tabindex="-1">當你的庇護<br>成為他人代價</h2><p class="note" style="margin-top:8px">你會如何選擇？</p><div class="scene-meta"><span class="tag">支線交會</span><span class="tag">首尾呼應</span></div><p class="world-caption" style="color:#c9d3c1">故事從四條不同的支線展開，透過各自的角色視角，逐步串起人物、事件與線索。隨著劇情推進，四條路線交會成共同的主線，最後再次呼應故事開端的提問。</p><div class="actions">${goBtn('關於作者 →',11,'light')}</div></div><div class="story-photo-stack" aria-label="原遊戲情境截圖"><figure class="story-photo"><img src="./assets/images/screenshots/story-nameless.webp" width="1440" height="900" alt="原遊戲「沒有名字的人」情境：凜與蒙面人物在昏暗室內交談" decoding="async"><figcaption>01 ／ 沒有名字的人</figcaption></figure><figure class="story-photo"><img src="./assets/images/screenshots/story-archive.webp" width="1440" height="900" alt="原遊戲「文件庫」情境：角色們在書架前比對貨物與測試品的線索" decoding="async"><figcaption>02 ／ 文件庫</figcaption></figure></div></div></div>`},
 {chapter:3,title:'故事真正想問的事',type:'單頁',class:'single',html:()=>`<div class="page-pad">${label('CHAPTER 04 / THEMES','故事真正想問的事')}<div class="single-content"><h2 id="view-title" tabindex="-1">光照得到的地方，<br>與照不到的人。</h2><p style="margin-top:24px;">故事圍繞生存的選擇、彼此的利益，以及科技帶來的權利差距。角色在尋找出路時，也逐漸看見：有人得到保護，就可能有人承擔代價。</p><div class="quote">當保護無法給予所有人，<br>誰來決定？</div><div class="actions">${goBtn('作者與聯絡方式 →',11,'ghost')}</div></div></div>`},
 {chapter:3,title:'作者與聯絡方式',type:'單頁',class:'single',html:()=>`<div class="page-pad author-page">${label('CHAPTER 04 / CONTACT','作者與聯絡方式')}<div class="single-content"><p class="eyebrow">THANK YOU FOR READING</p><h2 class="author-name" id="view-title" tabindex="-1">${esc(AUTHOR.name)}</h2><p class="author-role">UI/UX Designer · NIGHTFALL DUEL</p><p class="author-intro">謝謝你翻到這裡。<br>關於作品、互動設計或合作交流，歡迎與我聯絡。</p><address class="author-contacts" aria-label="作者聯絡方式"><div class="author-contact-row"><div class="author-contact-main"><span class="author-contact-label">EMAIL / 聯絡信箱</span><a id="author-email" class="author-contact-link" href="mailto:${esc(AUTHOR.email)}" aria-label="寄信給${esc(AUTHOR.name)}：${esc(AUTHOR.email)}">${esc(AUTHOR.email)}</a></div><a class="btn ghost small" href="mailto:${esc(AUTHOR.email)}" aria-label="寫信給${esc(AUTHOR.name)}">寫信給我</a></div><div class="author-contact-row"><div class="author-contact-main"><span class="author-contact-label">PORTFOLIO / 更多作品</span><a class="author-contact-link author-portfolio-link" href="${esc(AUTHOR.portfolio)}" target="_blank" rel="noopener noreferrer" aria-label="瀏覽${esc(AUTHOR.name)}的作品集，另開新分頁">瀏覽我的作品集 ↗</a><span class="author-contact-domain">zh6502014-del.github.io/portfolio</span></div></div></address><p class="note author-contact-note">點擊信箱開啟郵件程式；作品集會在新分頁開啟。</p><div class="actions">${goBtn('合上這本書 →',12)}${goBtn('回到封面',0,'ghost')}</div></div></div>`},
 {chapter:-1,title:'封底',type:'單張封底',class:'dark art-colophon',html:()=>{return `<div class="fullspread">${label('NIGHTFALL DUEL / COLOPHON','END OF THIS EDITION')}<div style="max-width:770px;margin:40px auto 25px"><p class="eyebrow">THANK YOU FOR READING</p><h2 class="end-title" id="view-title" tabindex="-1">故事可以合上。<br>問題，還留在光裡。</h2><p style="color:#c4cfbd;margin-top:24px">四個章節，從設定走到體驗，再回到創作的原點。<br>NIGHTFALL DUEL 互動故事書作品集。</p><div class="actions"><a class="btn light" href="https://zh6502014-del.github.io/game/" target="_blank" rel="noopener noreferrer">立刻體驗遊戲</a></div><p class="note" style="margin-top:21px">本四章的互動作品集，不是完整遊戲劇情。</p></div></div>`}}
];
function renderRules(){
 const mode=S.rulesMode||0;
 return `<div class="page-pad rules-page"><div class="single-content"><div class="rules-tabs" role="tablist" aria-label="遊戲模式規則">${['故事模式','自由卡片模式'].map((name,i)=>`<button id="rules-tab-${i}" role="tab" aria-selected="${mode===i}" aria-controls="rules-panel" tabindex="${mode===i?0:-1}" data-rules-mode="${i}">${name}</button>`).join('')}</div><div id="rules-panel" role="tabpanel" aria-labelledby="rules-tab-${mode}">${mode===0?renderStoryRules():renderCardRules()}</div></div></div>`;
}
function renderCardRules(){
 return `<div class="rules-guide">
 ${label('CHAPTER 01 / CARD RULES','自由卡片模式・卡牌決鬥')}
 <h2 id="view-title" tabindex="-1">選擇一張牌，<br>預判對手這一回合。</h2>
 <p class="rules-lead">雙方蓋牌後同時揭曉，依卡牌與職業效果結算。這個模式使用手牌，不使用故事模式的共享暮晶。</p>
 <section class="rules-section"><h3>01 / 開局與勝負</h3><ul><li>雙方初始 10 HP，起手各抽 3 張牌；後續每回合各抽 1 張。</li><li>每回合最多打出 1 張正常戰鬥牌。坦克護盾與領域屬於免費效果，另行計算。</li><li>一方 HP 歸零即落敗；雙方同時歸零為平手。最多 50 回合，最後比較實際 HP，高者獲勝，相同則平手。</li></ul></section>
 <section class="rules-section"><h3>02 / 基礎卡</h3><ul><li><strong>攻擊：</strong>造成 1 傷害。</li><li><strong>防禦：</strong>本回合受到的傷害減少 0.25；不等於完全擋下攻擊。</li><li><strong>閃躲：</strong>一般有 50% 機率成功，成功時取消本回合對自己的攻擊。刺客成功閃躲攻擊時，另造成 0.5 反擊傷害。</li></ul><div class="rules-scope"><strong>與故事模式不同</strong><p>自由卡片模式的普通閃躲有機率失敗；故事模式的「殘影」則保證閃過下一次直接攻擊。</p></div></section>
 <section class="rules-section"><h3>03 / 職業卡與特殊效果</h3>
 <details class="rules-detail"><summary>劍客／斬擊、劍氣出竅</summary><div class="rules-detail-body"><p>斬擊造成 2 傷害，命中後有 50% 機率封鎖對手下一回合的攻擊。</p><p>HP 低於 5 時，每場可取得一次劍氣出竅：造成 2 傷害，命中後同樣有 50% 機率封鎖對手下一回合的攻擊。</p></div></details>
 <details class="rules-detail"><summary>坦克／護盾、防禦反擊、領域展開</summary><div class="rules-detail-body"><p>每回合最多免費施放一次護盾，獲得 2 護盾，仍可打出 1 張正常戰鬥牌。</p><p>只有坦克自己打出防禦才判定反擊。出防禦時有護盾，反擊機率為 30%；沒有護盾則為 20%。反擊傷害是本次實際受傷的 50%，護盾本身不會反擊。</p><p>HP 低於 3 時，每場可取得一次領域展開，護盾為 0 時才能使用。下一次未被閃躲的攻擊先扣防禦減傷，再將剩餘傷害轉成 HP 回復，不超過上限；效果只生效一次。灼傷與坦克反擊不觸發領域。</p></div></details>
 <details class="rules-detail"><summary>刺客／閃擊、夜襲</summary><div class="rules-detail-body"><p>閃擊造成 1 傷害，並從對手手牌隨機嘗試偷 1 張牌。抽到攻擊、防禦、閃躲等基礎卡才加入手牌；抽到職業或特殊卡則直接丟棄。</p><p>閃擊有 50% 機率進入夜襲。夜襲期間，「閃躲」轉成造成 1 傷害的攻擊牌，並使對手下一回合不能使用攻擊。</p></div></details>
 <details class="rules-detail"><summary>槍手／爆擊</summary><div class="rules-detail-body"><p>爆擊造成 2 傷害，命中後附加 0.25 灼傷，於回合結束處理。這與故事模式「共振彈」的暮晶費用和持續傷害規則不同。</p></div></details>
 </section>
 <section class="rules-section"><h3>04 / 出牌與無牌可出的判定</h3><ul><li>攻擊、防禦、閃躲與攻擊型職業卡屬於決鬥區的正常戰鬥牌；坦克護盾、領域展開作用於自己的角色區。</li><li>職業卡不一定是免費效果。斬擊、閃擊、爆擊都占用本回合正常出牌次數。</li><li>沒有合法正常戰鬥牌時，系統會自動結束該方回合；若坦克還有可用免費效果，會先保留操作機會。</li></ul></section>
 <div class="actions">${goBtn('進入主線任務 →',4)}</div></div>`;
}
function renderStoryRules(){
 const detail=(title,body)=>`<details class="rules-detail"><summary>${title}</summary><div class="rules-detail-body">${body}</div></details>`;
 return `<div class="page-pad"><div class="single-content rules-guide">
 ${label('CHAPTER 01 / STORY RULES','故事模式・暮晶戰鬥')}
 <h2 id="view-title" tabindex="-1">安排隊伍行動，<br>決定暮晶用在誰身上。</h2>
 <p class="rules-lead">故事戰鬥由我方與敵方輪流行動。操作角色普通攻擊，或花費全隊共享的暮晶施放技能；安排完畢後，結束我方回合，交由敵方行動。</p>
 <div class="rules-scope"><strong>作品集以故事模式為主</strong><p>故事模式使用全隊共享暮晶與角色常駐技能。自由卡片模式的抽牌與蓋牌規則，請切換上方頁籤查看。</p></div>
 <section class="rules-section"><h3>01 / 角色、隊伍與關卡目標</h3><ul>
 <li>主角與參戰夥伴由劇情決定；隊伍人數、敵人能力及關卡目標會隨故事改變。</li>
 <li>一般角色預設 <strong>10 HP、普攻 1</strong>；坦克預設帶有 <strong>2 護盾</strong>。敵人及特殊角色可有不同數值，進場以角色面板為準。</li>
 <li>一般戰鬥：敵方全數倒下即勝利；<strong>我方全數倒下才失敗</strong>。只要仍有存活夥伴，即使主角倒下也可繼續。</li>
 <li>特殊任務以場上目標為準。例如朔與伊藤的牽制戰，需要度過 <strong>6 個完整回合，而且雙方全員存活</strong>；擊倒對方也會失敗。增援戰可能要求擊倒指定數量的敵人。</li>
 <li>一般戰鬥預設最多 <strong>50 個完整回合</strong>，到上限仍未完成則平手，可重試；不以剩餘 HP 高低判勝。完整回合包含我方及敵方各一次行動階段。</li></ul></section>
 <section class="rules-section"><h3>02 / 普攻與技能是兩份行動額度</h3>
 <ol class="rules-steps"><li><strong>選擇存活且未暈眩的角色。</strong>每名角色在每次己方回合，最多普攻一次、使用自己的暮晶技能一次。</li><li><strong>指定目標並行動。</strong>普攻與攻擊技能選一名存活敵人；殘影與人劍合一施放在角色自己身上。每次行動立即結算，不需要等雙方蓋牌。</li><li><strong>安排其他可用行動。</strong>普攻與技能可任意先後，隊友也各有自己的額度。技能是常駐招式，不抽牌、不消耗手牌。</li><li><strong>結束我方回合。</strong>可保留普攻、略過技能或直接結束；未使用的行動次數不累積。敵方完成行動後，才輪到下一次我方回合。</li></ol>
 <p>原遊戲可拖曳角色到敵人普攻、拖曳技能到合法目標，也支援點選操作。作品集以文字介紹這些操作與規則。</p></section>
 <section class="rules-section"><h3>03 / 暮晶怎麼累積與分配？</h3>
 <ul><li>雙方各有自己的<strong>全隊共享暮晶池</strong>，初始 0，上限 3。夥伴增加不會讓產量變多。</li><li>第一次己方回合不補能；從第二次起，每次己方回合開始 <strong>+1 暮晶</strong>。未使用的暮晶會保留，超出上限的部分不累積。</li><li>普攻不耗暮晶；殘影費用 2，地遁、人劍合一、共振彈各需 3。技能成功執行時扣除費用，暮晶不足時不能施放。</li></ul>
 <div class="rules-examples"><article><h4>先存到能施放殘影</h4><p>未花費的情況：第 1 回合 0 → 第 2 回合 1 → 第 3 回合 2。此時凜可花 2 點使用殘影，還能進行本回合的普攻。</p></article><article><h4>隊友共用資源</h4><p>全隊有 3 點時，伊芙用了共振彈，就剩 0 點；格蘭不能再用 3 費的地遁。兩人仍各自保有尚未用掉的普攻。</p></article></div></section>
 <section class="rules-section"><h3>04 / 四名角色的故事技能</h3><p class="note">下列為一般、未覺醒狀態。特殊章節的覺醒、變身或追加技能，以該場面板說明為準。</p>
 ${detail('凜／刺客：殘影・2 暮晶',`<p>施放後，<strong>下一次直接攻擊必定閃避</strong>，然後殘影消失。這裡的閃避不是 50% 機率。</p><p>閃過<strong>非遠距</strong>攻擊後，才獨立判定 50% 機率反擊，直接扣攻擊者 1 HP，穿過護盾。遠距攻擊可被殘影閃過，但不觸發普通殘影反擊。</p><p>持續傷害與反擊都不會觸發或消耗殘影；已有殘影時不能重複施放。研究室的赫爾曼是槍客，所以殘影可以避開他的直接攻擊，卻不能反擊他的遠距攻擊。</p>`)}
 ${detail('朔／劍客：人劍合一・3 暮晶／武士魂',`<p><strong>人劍合一：</strong>從自己的下一個回合起，下一次普攻 +1。施放當回合的普攻不會立即加成；未出手就保留，暈眩也不會讓增益消失。已有等待生效或尚未消耗的增益時不能再施放。</p><p><strong>武士魂：</strong>在自己的回合開始時，HP 大於 0 且低於 3，獲得下一次普攻 +1。同名效果不堆疊；消耗後，若下次回合開始仍符合條件，可再次取得，不是每場限一次。</p><p>兩種增益可相加：基礎 1 + 武士魂 1 + 人劍合一 1 = <strong>3 傷害</strong>。普攻出手即消耗對應增益，即使被殘影閃避也一樣。</p>`)}
 ${detail('格蘭／坦克：地遁・3 暮晶／初始護盾',`<p><strong>初始護盾：</strong>一般坦克開場有 2 護盾。傷害先扣護盾，再扣 HP；護盾耗掉後不會每回合自動補回。</p><p><strong>地遁：</strong>對一名敵人造成 1 傷害；命中後，使目標在下一次己方回合無法主動行動。即使傷害全被護盾吸收，也算命中並附加暈眩；若被殘影閃過，既無傷害也無暈眩。</p><p>暈眩不疊加。被暈的一方仍正常補暮晶、承受回合開始的持續傷害；被動殘影也仍有效。該次己方回合結束後解除暈眩。一般近戰或坦克受擊沒有自動反擊。</p>`)}
 ${detail('伊芙／槍客：共振彈・3 暮晶／遠距普攻',`<p><strong>共振彈：</strong>遠距立即造成 1 傷害；命中後，目標接下來<strong>兩次自身回合開始</strong>各承受 1 持續傷害。在沒有護盾、閃避等影響時，總計 3 傷害。</p><p>被殘影閃過就不附加後續效果。再次命中會把剩餘次數刷新為兩次，不是再疊一層；施放者倒下後，已附加的效果仍繼續。持續傷害先盾後血，不能靠殘影閃掉。</p><p><strong>遠距普攻：</strong>不受普通殘影反擊，但仍可被殘影閃避。每第 4 次普攻有 10% 機率額外 +1 傷害；不論是否成功都重新計數。被閃也算出手，技能、持續傷害與反擊不列入普攻次數。</p>`)}
 </section>
 <section class="rules-section"><h3>05 / 結算時，先發生什麼？</h3>
 ${detail('直接攻擊：殘影 → 護盾 → 生命',`<ol><li>若目標有殘影，先閃過直接攻擊並消耗殘影；符合近戰條件才判定反擊。</li><li>未被閃避時，先扣護盾，不足的部分扣 HP。</li><li>命中後附加該技能的暈眩或共振效果，再確認戰況。</li></ol><p>例：格蘭有 2 護盾，受到 1 普攻後，護盾剩 1、HP 不變。故事模式沒有自由對戰「出防禦牌減少 0.25」這一步。</p>`)}
 ${detail('回合開始：持續傷害 → 勝負 → 補能與行動',`<ol><li>該方回合次數增加，結算所有存活角色的共振持續傷害。</li><li>檢查勝負；若戰鬥已結束，就不再補能或接受行動。</li><li>仍在戰鬥時，依規則補 1 暮晶，重置普攻與技能額度。</li><li>讓到期的人劍合一生效，檢查低生命的武士魂；暈眩角色仍不能主動行動。</li></ol><p>「目標下次回合」依目標所屬隊伍計算。伊芙在我方行動時打中敵人，接著開始的敵方回合就會承受第一段持續傷害。</p>`)}
 </section>
 <section class="rules-section"><h3>06 / 與自由對戰分開看</h3>
 <div class="rules-compare"><table><caption>兩種模式的主要差異</caption><thead><tr><th scope="col">項目</th><th scope="col">故事模式</th><th scope="col">自由對戰</th></tr></thead><tbody>
 <tr><th scope="row">行動</th><td>兩方輪流；每名角色普攻、技能各一次</td><td>每回合選正常牌，雙方蓋牌後揭曉</td></tr>
 <tr><th scope="row">資源</th><td>全隊共享暮晶；技能常駐</td><td>起手 3 張，之後每回合抽牌</td></tr>
 <tr><th scope="row">閃避</th><td>殘影保證閃過下一次直接攻擊</td><td>普通閃躲牌有 50% 成功機率</td></tr>
 <tr><th scope="row">刺客反擊</th><td>普通殘影閃過近戰後，50% 機率穿盾扣 1 HP</td><td>成功閃躲攻擊後反擊 0.5</td></tr>
 <tr><th scope="row">防護</th><td>初始護盾、殘影及控制技能</td><td>防禦牌減傷 0.25、護盾牌與領域等</td></tr>
 <tr><th scope="row">勝負</th><td>依關卡目標；一般全隊倒下才失敗</td><td>一般 10 HP 決鬥；50 回合後比較 HP</td></tr>
 </tbody></table></div><p class="note">自由對戰的夜襲、偷牌、斬擊封鎖、爆擊牌與領域，不會自動沿用到故事角色。</p></section>
 <div class="actions">${goBtn('進入主線任務 →',4)}</div>
 </div></div>`;
}

function previewPhoto(photo){
 const img=photo.querySelector('img'),caption=photo.querySelector('figcaption');
 const source=photo.getBoundingClientRect(),frameStyle=getComputedStyle(photo),imageStyle=getComputedStyle(img),captionStyle=getComputedStyle(caption);
 const matrix=new DOMMatrix(frameStyle.transform),angle=Math.atan2(matrix.b,matrix.a)*180/Math.PI;
 // Scale the whole print together, including its paper border and caption.
 const scale=Math.min(2.5,(innerWidth-48)/photo.offsetWidth,(innerHeight-100)/photo.offsetHeight);
 openModal(caption.textContent,'<figure class="photo-lift"></figure>');
 const dialog=$('#modal');dialog.classList.add('photo-preview');
 const print=dialog.querySelector('.photo-lift'),preview=img.cloneNode(),label=caption.cloneNode(true);
 print.append(preview,label);preview.className='photo-preview-image';preview.draggable=false;
 Object.assign(print.style,{width:`${photo.offsetWidth*scale}px`,padding:`${parseFloat(frameStyle.paddingTop)*scale}px`,background:frameStyle.backgroundColor,border:`${scale}px solid ${frameStyle.borderTopColor}`});
 Object.assign(preview.style,{width:'100%',height:`${img.clientHeight*scale}px`,objectFit:imageStyle.objectFit,objectPosition:imageStyle.objectPosition,background:imageStyle.background});
 Object.assign(label.style,{fontSize:`${parseFloat(captionStyle.fontSize)*scale}px`,lineHeight:captionStyle.lineHeight==='normal'?'normal':`${parseFloat(captionStyle.lineHeight)*scale}px`,padding:[captionStyle.paddingTop,captionStyle.paddingRight,captionStyle.paddingBottom,captionStyle.paddingLeft].map(v=>`${parseFloat(v)*scale}px`).join(' '),color:captionStyle.color,letterSpacing:captionStyle.letterSpacing});
 dialog.style.width=`${photo.offsetWidth*scale}px`;
 photo.style.visibility='hidden';
 dialog.addEventListener('close',()=>{photo.style.visibility='';},{once:true});
 const animate=()=>{
  if(!dialog.open||!print.isConnected||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const target=print.getBoundingClientRect(),dx=source.left+source.width/2-target.left-target.width/2,dy=source.top+source.height/2-target.top-target.height/2;
  print.animate([
   {transform:`translate(${dx}px,${dy}px) rotate(${angle}deg) scale(${1/scale})`,boxShadow:'0 9px 24px #14271d40'},
   {transform:'translate(0,0) rotate(0deg) scale(1)',boxShadow:'0 30px 80px #07130bb3,0 8px 24px #07130b66'}
  ],{duration:480,easing:'cubic-bezier(.18,.75,.22,1)'});
 };
 if(preview.complete)requestAnimationFrame(animate);else preview.addEventListener('load',animate,{once:true});
}
function initPhotoStacks(){
 document.querySelectorAll('.world-photo-stack,.story-photo-stack').forEach(stack=>{
  let layer=10;
  const photos=[...stack.querySelectorAll('figure')];
  photos.forEach(photo=>{
   photo.tabIndex=0;photo.setAttribute('role','button');photo.dataset.draggable='true';
   photo.setAttribute('aria-label',`${photo.querySelector('figcaption').textContent}，點擊放大或拖曳；Enter 放大，方向鍵移動，Home 復位`);
   photo.querySelector('img').draggable=false;
   let x=0,y=0,drag=null;
   const position=()=>{photo.style.translate=`${x}px ${y}px`};
   const bounds=()=>{const r=photo.getBoundingClientRect(),b=stack.getBoundingClientRect();return{minX:Math.min(0,b.left-r.left),maxX:Math.max(0,b.right-r.right),minY:Math.min(0,b.top-r.top),maxY:Math.max(0,b.bottom-r.bottom)}};
   const raise=()=>{photo.style.zIndex=String(++layer)};
   photo.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0)return;
    e.preventDefault();photo.focus({preventScroll:true});raise();
    drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y,moved:false,...bounds()};
    photo.setPointerCapture(e.pointerId);photo.classList.add('is-dragging');
   });
   photo.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6)drag.moved=true;
    x=drag.x+Math.max(drag.minX,Math.min(drag.maxX,e.clientX-drag.startX));
    y=drag.y+Math.max(drag.minY,Math.min(drag.maxY,e.clientY-drag.startY));position();
   });
   const release=()=>{drag=null;photo.classList.remove('is-dragging')};
   photo.addEventListener('pointerup',e=>{const click=drag&&e.pointerId===drag.id&&!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<=6;release();if(click)previewPhoto(photo)});photo.addEventListener('pointercancel',release);photo.addEventListener('lostpointercapture',release);
   photo.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Enter',' '].includes(e.key))return;
    e.preventDefault();e.stopPropagation();raise();
    if(e.key==='Enter'||e.key===' '){previewPhoto(photo);return}
    if(e.key==='Home'){x=0;y=0;position();return}
    const b=bounds(),step=e.shiftKey?30:12;
    x+=Math.max(b.minX,Math.min(b.maxX,e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0));
    y+=Math.max(b.minY,Math.min(b.maxY,e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0));position();
   });
  });
 });
}
function render(navigation=false,deferNavigationFocus=false){
 const activeID=document.activeElement?.id||'',scrollY=window.scrollY,bookScroll=navigation?0:($('#book-content')?.scrollTop||0),v=VIEWS[S.page];
 if(!S.visited.includes(S.page))S.visited.push(S.page);
 $('#reader').innerHTML=`<article class="book ${v.class} " data-view-index="${S.page}" aria-labelledby="view-title"><div class="book-content" id="book-content" tabindex="0" role="region" aria-label="書頁內容，可上下捲動">${v.html()}</div></article>`;
 $('#reader > .book').appendChild(readerFooter);
 $('#chapter-nav').innerHTML=CHAPTERS.map((c,i)=>`<button class="chapter-btn" data-go="${c.start}" ${v.chapter===i?'aria-current="step"':''} aria-label="第 ${c.n} 章：${c.full}"><span class="chapter-num">${c.n}</span><span class="chapter-name">${c.name}<span class="chapter-sub">${c.sub}</span></span></button>`).join('');
 $('#prev').disabled=S.page===0;$('#next').disabled=S.page===VIEWS.length-1;
 $('#next').innerHTML=S.page===VIEWS.length-2?'合上故事書 <span aria-hidden="true">→</span>':'下一頁 <span aria-hidden="true">→</span>';
 $('#page-type').textContent=v.type;$('#page-count').innerHTML=`<span>${String(S.page+1).padStart(2,'0')} / ${String(VIEWS.length).padStart(2,'0')} · 選頁</span><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
 $('#book-content').scrollTop=bookScroll;
 document.title=`${v.title}｜NIGHTFALL DUEL 故事書`;
 persist();observeContent();initPhotoStacks();
 if(navigation){if(!deferNavigationFocus){window.scrollTo(0,0);finishNavigation()}}
 else if(activeID){const el=document.getElementById(activeID);if(el&&!el.disabled)el.focus({preventScroll:true});window.scrollTo(0,scrollY)}
}
function finishNavigation(){
 const v=VIEWS[S.page];
 $('#view-title')?.focus({preventScroll:true});
 announce(`${v.chapter>=0?`第 ${v.chapter+1} 章。`:''}${v.title}。第 ${S.page+1} 個閱讀畫面。`);
}
function setTurning(value){
 pageTurning=value;
 $('.shell').inert=value;
 $('.shell').classList.toggle('turn-busy',value);
 $('#reader').setAttribute('aria-busy',String(value));
 $('#prev').disabled=value||S.page===0;
 $('#next').disabled=value||S.page===VIEWS.length-1;
}
async function go(index,fromHistory=false){
 if(!Number.isInteger(index)||index<0||index>=VIEWS.length)return;
 // User double-clicks must not skip leaves. Browser Back/Forward, in contrast,
 // is authoritative: finish the active leaf and follow the real history entry.
 if(pageTurning){
  if(!fromHistory)return;
  navigationSerial++;window.NDPageTurn?.finish();setTurning(false);
 }
 if($('#modal').open)closeModal();
 const reader=$('#reader'),oldBook=reader.querySelector(':scope > .book');
 const previous=oldBook?Number(oldBook.dataset.viewIndex):S.page;
 if(index===previous){finishNavigation();return}
 
 window.scrollTo(0,0);
 const source=window.NDPageTurn?.capture(oldBook);
 const serial=++navigationSerial;
 setTurning(true);
 S.page=index;
 if(!fromHistory)try{history.pushState(null,'',`#page-${index+1}`)}catch(e){}
 try{
  render(true,true);
  setTurning(true);
  await window.NDPageTurn?.play({reader,source,target:reader.querySelector(':scope > .book'),direction:index>previous?1:-1});
 }catch(error){
  window.NDPageTurn?.finish();
  console.warn('The page opened without animation.',error);
 }finally{
  if(serial===navigationSerial){setTurning(false);finishNavigation()}
 }
}
function modalHead(title){return `<div class="modal-head"><h2 id="modal-title">${title}</h2><button class="icon-btn" data-action="close-modal" aria-label="關閉視窗">${icon('close',17)}</button></div>`}
function openModal(title,html){const d=$('#modal');d.classList.remove('photo-preview');d.style.width='';if(!d.open)focusBeforeModal=document.activeElement;$('#modal-content').innerHTML=modalHead(title)+html;if(!d.open)d.showModal();d.querySelector('button')?.focus()}
function closeModal(){const d=$('#modal');if(d.open)d.close();if(focusBeforeModal?.isConnected)focusBeforeModal.focus({preventScroll:true})}
function showPages(){openModal('選擇頁面',`<div class="page-list">${VIEWS.map((v,i)=>`<button class="page-option" data-go="${i}" ${i===S.page?'aria-current="page"':''}><span class="mono">${String(i+1).padStart(2,'0')}</span><strong>${v.title}</strong><small>${i===S.page?'閱讀中':'↗'}</small></button>`).join('')}</div>`)}
function showTOC(){openModal('四章目錄',`<p class="note" style="margin-bottom:18px">直接選一章開始。副本任務章節以原遊戲截圖介紹。</p><div class="toc-list">${CHAPTERS.map(c=>`<button class="toc-item" data-go="${c.start}"><span class="mono">CHAPTER ${c.n} · 畫面 ${c.start+1}–${c.end+1}</span><strong>${c.full}</strong></button>`).join('')}</div><div class="actions">${goBtn('回封面',0,'ghost')}${goBtn('到封底',12,'ghost')}</div>`)}
function showAbout(){openModal('V0.3｜這一版做了什麼',`<p style="">一本四章的互動作品集，不是完整遊戲劇情改編。封面與封底不另外算章節。</p><ul class="about-list"><li><strong>13 個閱讀畫面</strong>：所有頁面外框等寬；單頁、左右對頁、跨頁滿版只改變內部編排。手機依序排列，單頁內文保留舒適行寬，書本外框等高，長內容在書頁內捲動。</li><li><strong>雙向翻頁動畫</strong>：下一頁由右往左，上一頁反向翻回。桌機沿中央書脊翻動，手機使用整張書頁；僅換頁觸發，不影響當頁操作。</li><li><strong>2 組副本任務截圖</strong>：鐘樓逃生路線、礦坑地圖拼合；以原遊戲畫面與簡短文字介紹。</li><li><strong>閱讀書籤</strong>：閱讀位置自動存於本機，可直接跳章。</li><li><strong>作者聯絡頁</strong>：第 12 頁署名林艾奭，提供信箱、複製信箱與作品集連結。</li><li><strong>素材狀態</strong>：場景與角色立繪取自 Game_claude，副本任務另以兩張實際畫面截圖呈現。新增雙向 3D 翻頁與書脊陰影；尚未加入音效。</li></ul><details class="source-note"><summary>內容來源與改編邊界</summary><p>世界與劇情節選對照 <code>Game_claude/src/js/story-chapters.js</code>，角色與場景對照 <code>story-stage-assets.js</code>。研究室只節選凜與赫爾曼的對峙，不把舊版完整章序帶入作品集，也不改寫後續事故。</p><p>故事規則對照 <code>Game_claude/src/js/story-energy-engine.js</code> 與 <code>story-campaign.js</code>。自由對戰另由 <code>game.js</code> 處理，不混用兩套規則。</p><p>作品集保留四章編排與提問；副本任務使用 Game_claude 原遊戲截圖，不在作品集內操作。圖片直接複製自 Game_claude，未重新繪製角色。研究室以故事節選與場景圖片呈現。</p></details><div class="actions">${btn('回到書頁','close-modal','primary')}</div>`)}
// Clipboard permission varies on local files. Fall back without claiming success.
async function copyAuthorEmail(){
 let copied=false;
 try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(AUTHOR.email);copied=true}}catch(e){}
 if(!copied){
  const focus=document.activeElement,field=document.createElement('textarea');
  field.value=AUTHOR.email;field.readOnly=true;field.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
  try{document.body.appendChild(field);field.focus();field.select();copied=!!document.execCommand('copy')}catch(e){}
  finally{field.remove();if(focus?.isConnected)focus.focus({preventScroll:true})}
 }
 const message=copied?'已複製信箱：'+AUTHOR.email:'瀏覽器不允許自動複製，請直接選取信箱文字。';
 if(!copied){const link=$('#author-email');if(link){const range=document.createRange();range.selectNodeContents(link);const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range)}}
 toast(message);announce(message);
}
const ACTIONS={
 'copy-email':copyAuthorEmail,
 prev:()=>go(S.page-1),next:()=>go(S.page+1),toc:showTOC,pages:showPages,about:showAbout,
 'close-modal':closeModal,
 'clear-reflection':()=>{S.reflection='';persist();render();$('#reflection')?.focus();toast('這段文字已清除。')}
};
document.addEventListener('click',e=>{
 if(pageTurning){e.preventDefault();return}
 const t=e.target.closest('button');if(!t||t.disabled)return;
 if(t.dataset.go!==undefined){go(Number(t.dataset.go));return}
 if(t.dataset.rulesMode!==undefined){S.rulesMode=Number(t.dataset.rulesMode);$('#book-content').scrollTop=0;render();document.getElementById(`rules-tab-${S.rulesMode}`).focus({preventScroll:true});return}
 const a=t.dataset.action;if(a&&Object.hasOwn(ACTIONS,a)){ACTIONS[a]();return}
 const setTab=(key,val,msg)=>{S[key]=val;persist();render();if(msg)announce(msg)};
 if(t.dataset.world!==undefined)setTab('world',Number(t.dataset.world),WORLD[Number(t.dataset.world)].text);
 else if(t.dataset.char!==undefined)setTab('char',Number(t.dataset.char),`${CHARACTERS[Number(t.dataset.char)].name}，${CHARACTERS[Number(t.dataset.char)].role}`);
 else if(t.dataset.hotspot!==undefined)setTab('hotspot',t.dataset.hotspot,'已顯示場景細節。');
 else if(t.dataset.theme!==undefined)setTab('theme',Number(t.dataset.theme),THEMES[Number(t.dataset.theme)].title);
 else if(t.dataset.focusTheme!==undefined){const n=Number(t.dataset.focusTheme);setTab('focusTheme',S.focusTheme===n?null:n,'已更新最在意的主題。')}
});
document.addEventListener('input',e=>{if(e.target.id==='reflection'){S.reflection=e.target.value.slice(0,500);$('#char-count').textContent=`${S.reflection.length} / 500`;persist();$('#reflection-save').textContent=storageOK?'已儲存在本機，不會上傳':'僅保留在本次開啟，不會上傳'}});
document.addEventListener('keydown',e=>{if(e.target.matches('[data-rules-mode]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const mode=e.key==='Home'?0:e.key==='End'?1:1-Number(e.target.dataset.rulesMode);document.getElementById(`rules-tab-${mode}`).click();return}if(pageTurning){if(e.key==='Escape'){e.preventDefault();window.NDPageTurn?.finish()}else if(['ArrowRight','ArrowLeft','Tab','PageUp','PageDown',' '].includes(e.key))e.preventDefault();return}if($('#modal').open||e.altKey||e.ctrlKey||e.metaKey)return;if(e.target.closest('input,textarea,select,button,a,[contenteditable="true"],[role="tab"]'))return;if(e.key==='ArrowRight'){e.preventDefault();go(S.page+1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(S.page-1)}});
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal()}});
$('#modal').addEventListener('cancel',()=>{if(focusBeforeModal?.isConnected)setTimeout(()=>focusBeforeModal.focus({preventScroll:true}),0)});
window.addEventListener('popstate',()=>{const m=location.hash.match(/^#page-(\d+)$/);if(m){const n=Number(m[1])-1;if(n>=0&&n<VIEWS.length)go(n,true)}else if(!location.hash){go(0,true)}});
window.addEventListener('pagehide',()=>{window.NDPageTurn?.finish();persist()});
const hash=location.hash.match(/^#page-(\d+)$/);if(hash){const n=Number(hash[1])-1;if(n>=0&&n<VIEWS.length)S.page=n}
try{history.replaceState(null,'',`#page-${S.page+1}`)}catch(e){}
render(false);
})();
