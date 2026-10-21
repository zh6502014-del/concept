'use strict';
// Edit copy, author contact, chapter labels and image paths here.
window.ND_DATA = (() => {
const AUTHOR=Object.freeze({name:'林艾奭',email:'zh6502014@gmail.com',portfolio:'https://zh6502014-del.github.io/portfolio/index.html'});
const CHAPTERS=[
 {n:'01',name:'設定與機制',full:'故事設定、角色設定、遊戲機制',sub:'WORLD / CHARACTERS / RULES',start:1,end:3},
 {n:'02',name:'主線任務',full:'主線任務：故事節選與場景',sub:'STORY / SCENE',start:4,end:4},
 {n:'03',name:'副本任務',full:'副本任務：路線規劃、地圖拼合與撐盾救援',sub:'EXPLORE / CONNECT / ASSEMBLE / HOLD',start:5,end:9},
 {n:'04',name:'回到原點',full:'生存、利益與科技帶來的權利不均',sub:'SURVIVAL / INTERESTS / RIGHTS',start:10,end:11}
];
const CHARACTERS=[
 {name:'凜',job:'刺客',code:'I',id:'rin',role:'閃避與反擊',desc:'先閃過敵人的攻擊，還有機會直接反擊。技能只要 2 暮晶，但暮晶是全隊共用的，用在凜身上，隊友就少一份。',play:'殘影｜2 暮晶：必定閃避下一次直接攻擊；閃過非遠距攻擊後，有 50% 機率穿盾反擊 1 HP。'},
 {name:'朔',job:'劍客',code:'II',id:'shuo',role:'蓄力出重手',desc:'用技能蓄力，讓下一次普攻多 1 點傷害。血量剩 1～2 點時還會自動加傷，越危險打得越痛。',play:'人劍合一｜3 暮晶：從下一個己方回合起，下一次普攻 +1。武士魂：回合開始時 HP 大於 0 且低於 3，獲得下一次普攻 +1，可與人劍合一相加。'},
 {name:'格蘭',job:'坦克',code:'III',id:'gran',role:'擋傷害、讓敵人暈眩',desc:'開場自帶 2 點護盾，可以先吃傷害。技能能讓敵人下一回合不能行動，替隊友多爭取一回合。',play:'初始護盾｜2 點。地遁｜3 暮晶：造成 1 傷害，命中後使目標下一次己方回合無法主動行動；被閃避時不附加暈眩。'},
 {name:'伊芙',job:'槍客',code:'IV',id:'eve',role:'遠距離、持續扣血',desc:'在遠處攻擊，不會被殘影反擊。共振彈打中後，目標接下來兩個回合開始時各扣 1 血，所以越早用越划算。',play:'共振彈｜3 暮晶：立即造成 1 傷害；命中後，目標接下來兩次自身回合開始各受到 1 持續傷害；再次命中會刷新，不疊層。遠距普攻不觸發普通殘影反擊。'}
];
const WORLD=[
 {title:'夜域',text:'夜域來臨時，天色轉暗、氣溫下降，作物枯死，人也會迷失方向。停留太久的人再也走不出來；找到暫時的庇護，是活下來的第一步。'},
 {title:'暮晶',text:'夜域退去後，地上會留下暮晶。它能發光、儲存能量，城市用它照明、取暖與驅動機械；人們的日常生活，也因此依賴這種資源。'},
 {title:'暮鐘',text:'維斯珀蘭有八座城市，只有暮城不怕夜域。在一般民眾眼中，暮鐘的鐘聲與祭司的祈福，意味著城市受到保護。'}
];
const THEMES=[
 {title:'生存抉擇',sub:'活下來，並不代表沒有代價。',body:'故事裡的救援與防護都有邊界。把某個人留在光裡，可能同時讓另一個人承擔更大的風險。這不是替角色尋找一個永遠正確的答案，而是看見做決定時無法抹去的代價。',q:'當所有人都想活下來，誰有資格替別人決定代價？'},
 {title:'利益糾結',sub:'一個不公平的制度，也可能保護過人。',body:'暮鐘確實保住過城市。也因此，依賴它的人不只可能是掌權者。反對制度的人，仍然要面對那些害怕失去保護的人；批判與依賴，可以同時存在。',q:'拆掉維持生存的秩序之後，要如何面對仍然需要庇護的人？'},
 {title:'科技帶來的權利不均',sub:'能製造保護，不等於每個人都能獲得保護。',body:'掌握技術、資源與資訊的人，也掌握了保護如何分配。暮鐘並未消滅夜域，而是把它轉移到其他區域。於是，同一次技術運作，可能對不同地方的人具有截然不同的意義。',q:'當技術決定誰能留在光裡，沒有決定權的人又在哪裡？'}
];
const ASSETS={
  "vesperland": {
    "path": "assets/images/scenes/vesperland.webp",
    "width": 1280,
    "height": 720,
    "title": "維斯珀蘭全景"
  },
  "research-lab": {
    "path": "assets/images/scenes/research-lab.webp",
    "width": 1024,
    "height": 576,
    "title": "曜火研究室"
  },
  "rin": {
    "path": "assets/images/characters/rin.webp",
    "width": 640,
    "height": 960,
    "title": "凜"
  },
  "shuo": {
    "path": "assets/images/characters/shuo.webp",
    "width": 640,
    "height": 960,
    "title": "朔"
  },
  "gran": {
    "path": "assets/images/characters/gran.webp",
    "width": 640,
    "height": 960,
    "title": "格蘭"
  },
  "eve": {
    "path": "assets/images/characters/eve.webp",
    "width": 640,
    "height": 960,
    "title": "伊芙"
  },
  "story-route": {
    "path": "assets/images/screenshots/story-route.webp",
    "width": 600,
    "height": 870,
    "title": "朔・鐘樓逃生路線"
  },
  "story-map-puzzle": {
    "path": "assets/images/screenshots/story-map-puzzle.webp",
    "width": 858,
    "height": 1000,
    "title": "迪普霍姆・礦坑地圖"
  },
  "story-shield-rhythm": {
    "path": "assets/images/screenshots/story-shield-rhythm.webp",
    "width": 960,
    "height": 716,
    "title": "格蘭・撐盾救援"
  }
};
return Object.freeze({AUTHOR,CHAPTERS,CHARACTERS,WORLD,THEMES,ASSETS});
})();
