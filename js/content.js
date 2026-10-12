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
 {name:'凜',job:'刺客',code:'I',id:'rin',role:'閃避與反擊',desc:'以主動閃避化解關鍵攻擊，再伺機反擊。技能費用較低，讓玩家在保護凜與為隊友保留暮晶之間取捨。',play:'殘影｜2 暮晶：必定閃避下一次直接攻擊；閃過非遠距攻擊後，有 50% 機率穿盾反擊 1 HP。'},
 {name:'朔',job:'劍客',code:'II',id:'shuo',role:'蓄勢與爆發',desc:'將傷害延後到下一次進攻，強調施放時機與增益搭配。低生命時的被動增傷，讓進攻機會伴隨生存風險。',play:'人劍合一｜3 暮晶：從下一個己方回合起，下一次普攻 +1。武士魂：回合開始時 HP 大於 0 且低於 3，獲得下一次普攻 +1，可與人劍合一相加。'},
 {name:'格蘭',job:'坦克',code:'III',id:'gran',role:'承傷與控制',desc:'以初始護盾承受壓力，再用暈眩限制敵方行動。設計重點是爭取隊伍調整節奏的時間，而非持續堆高傷害。',play:'初始護盾｜2 點。地遁｜3 暮晶：造成 1 傷害，命中後使目標下一次己方回合無法主動行動；被閃避時不附加暈眩。'},
 {name:'伊芙',job:'槍客',code:'IV',id:'eve',role:'遠距與持續傷害',desc:'透過遠距攻擊與分段傷害持續施壓。玩家需要考量目標接下來的回合，讓技能收益隨戰鬥推進逐步發揮。',play:'共振彈｜3 暮晶：立即造成 1 傷害；命中後，目標接下來兩次自身回合開始各受到 1 持續傷害。遠距普攻不觸發普通殘影反擊。'}
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
    "width": 1535,
    "height": 864,
    "title": "維斯珀蘭全景"
  },
  "research-lab": {
    "path": "assets/images/scenes/research-lab.webp",
    "width": 1599,
    "height": 900,
    "title": "曜火研究室"
  },
  "lab-standoff": {
    "path": "assets/images/scenes/lab-standoff.webp",
    "width": 1535,
    "height": 864,
    "title": "凜與赫爾曼在研究室對峙"
  },
  "world-map": {
    "path": "assets/images/puzzles/world-map.webp",
    "width": 1599,
    "height": 900,
    "title": "維斯珀蘭世界地圖"
  },
  "rin": {
    "path": "assets/images/characters/rin.webp",
    "width": 853,
    "height": 1280,
    "title": "凜"
  },
  "shuo": {
    "path": "assets/images/characters/shuo.webp",
    "width": 853,
    "height": 1280,
    "title": "朔"
  },
  "gran": {
    "path": "assets/images/characters/gran.webp",
    "width": 853,
    "height": 1280,
    "title": "格蘭"
  },
  "eve": {
    "path": "assets/images/characters/eve.webp",
    "width": 853,
    "height": 1280,
    "title": "伊芙"
  },
  "phosphor": {
    "path": "assets/images/characters/phosphor.webp",
    "width": 853,
    "height": 1280,
    "title": "磷"
  },
  "herman": {
    "path": "assets/images/characters/herman.webp",
    "width": 853,
    "height": 1280,
    "title": "赫爾曼"
  },
  "story-route": {
    "path": "assets/images/screenshots/story-route.webp",
    "width": 600,
    "height": 870,
    "title": "朔・鐘樓逃生路線"
  },
  "story-map-puzzle": {
    "path": "assets/images/screenshots/story-map-puzzle.webp",
    "width": 1040,
    "height": 1212,
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
