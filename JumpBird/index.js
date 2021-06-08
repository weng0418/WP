let skyBg, landBg, bird, game, pipes;
let getTimer = function (duration, thisObj, callback) {
  var timer = null;
  return {
    start: function () {
      if (!timer) {
        timer = setInterval(function () {
          callback.bind(thisObj)();
        }, duration);
      }
    },
    stop: function () {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
  };
}

// 系統對象，統一管理其他對象的開始和結束
game = {
  paused : true,  // 當前遊戲是否暫停
  isGmaeOver : false, // 當前遊戲是否結束
  dom : document.querySelector('#game'),
  start : function(){
    skyBg.timer.start();
    landBg.timer.start();
    bird.wingTimer.start();
    bird.dropTimer.start();
    pipes.produceTimer.start();
    pipes.moveTimer.start();
  },
  stop : function(){
    skyBg.timer.stop();
    landBg.timer.stop();
    bird.wingTimer.stop();
    bird.dropTimer.stop();
    pipes.produceTimer.stop();
    pipes.moveTimer.stop();
  },
    // 該方法用於判斷遊戲是否結束
  gameOver : function(){
    // 遊戲有兩種情況都會導致遊戲結束：1. 小鳥落地 2. 小鳥碰撞柱子
    // 1. 小鳥落地
    if (bird.top === 462){
      alert('遊戲結束');

      this.isGmaeOver = true;
      this.stop();
    }
    // 2. 小鳥是否碰撞到柱子（需要檢測碰撞）
    // 小鳥中心點
    let bx = bird.left + (bird.width/2);
    let by = bird.top + (bird.height/2);
    // 柱子中心點
    for(let i=0;i<pipes.all.length;i++){
      let p = pipes.all[i]; // 當前的柱子
      // 獲取當前柱子的中心點
      let px = p.left + (p.width/2);
      let py = p.top + (p.height/2);
      // 判断是否碰撞
      if (Math.abs(bx - px) < (p.width + bird.width) / 2 && 
        Math.abs(by - py) < (p.height + bird.height) / 2){
        alter('遊戲結束');
        this.isGmaeOver = true;
        this.stop();
      }
    }
  }
}

// 天空對象
skyBg = {
  left: 0,
  dom: document.querySelector('#game .sky'),
  // 該方法用於重新更新天空的 left 值
  show: function () {
    this.dom.style.left = this.left + 'px'
  }
}
skyBg.timer = getTimer(30, skyBg, function () {
  this.left -= 1;
  if (this.left === -800) {
    this.left = 0;
  }
  this.show();
})

// 大地對象
landBg = {
  left: 0,
  dom: document.querySelector('#game .land'),
  show() {
    this.dom.style.left = this.left + 'px'
  }
}
landBg.timer = getTimer(30, landBg, function () {
  this.left -= 2
  if (this.left === -800) {
    this.left = 0;
  }
  this.show();
})

// 小鳥對象
bird = {
  width : 33,
  height : 26,
  top : 150,
  left : 200,
  dom : document.querySelector('#game .bird'),
  wingIndex : 0, // 該屬性用於記錄當前小鳥的背景圖片
  speed : 0, // 小鳥往下面掉的速度
  a : 0.0005, // 加速度
  // 這個是關鍵參數
  // 顯示小鳥的方法：統一在 show 方法中顯示小鳥的最終狀態
  show : function(){
    // 根據圖片的索引，來設置當前小鳥背景圖的位置
    if (this.wingIndex === 0){
      this.dom.style.backgroundPosition = '-8px -10px';
    } else if (this.wingIndex === 1){
      this.dom.style.backgroundPosition = '-60px -10px';
    } else {
      this.dom.style.backgroundPosition = '-113px -10px';
    }
    // 設置小鳥的 top 值
    this.dom.style.top = this.top + 'px';
  },
  // 設置小鳥的 top 值
  setTop(newTop){
    if (newTop < 0){
      newTop = 0;
    }
    if (newTop > 462){
      newTop = 462;
    }
    this.top = newTop;
  },
  jump(){
    this.speed = -0.1;
  }
}
// 讓小鳥不停的扇動翅膀的計時器
bird.wingTimer = getTimer(100,bird,function(){
  // 這裡面主要要做的事兒：修改 wingIndex，然後調用 show
  this.wingIndex = (this.wingIndex + 1) % 3;
  this.show();
});
bird.dropTimer = getTimer(16,bird,function(){
// 主要要做的事兒：改變高度，然後調用 setTop 方法以及 show 方法
  // 小鳥做的是勻加速運動
  // s = vt + 1/2 * a * t * t
  // 如何獲取勻加速的末速度：v = v0 + at
  let s = this.speed * 16 + 0.5 * this.a * 16 * 16;
  this.speed = this.speed + this.a * 16;
  this.setTop(this.top + s);
  this.show();
});

// 上下的管道
pipes = {
  width: 52,
  getRandom : function(min,max){
    return Math.floor(Math.random() * (max - min) + min);
  },
  all : [],  // 用於存放所有的柱子
  // 創建柱子的方法
  createPipe() {
    let minHeight = 60, // 柱子最小的高度
      gap = 150; // 中間的間隙
      maxHeight = 488 - gap - minHeight;
    // 接下來確定一組柱子的高度
    let h1 = this.getRandom(minHeight,maxHeight),
      h2 = 488 - gap - h1;
    // 接下來根據這兩個高度來創建柱子
    // 上面的柱子
    let div1 = document.createElement("div");
    div1.className = "pipeup";
    div1.style.height = h1 + "px";
    div1.style.left = "800px";
    game.dom.appendChild(div1);
    this.all.push({
      dom : div1,
      height : h1,
      width : this.width,
      top : 0,
      left : 800
    });
    // 下面的柱子
    let div2 = document.createElement("div");
    div2.className = "pipedown";
    div2.style.height = h2 + "px";
    div2.style.left = "800px";
    game.dom.appendChild(div2);
    this.all.push({
      dom : div2,
      height : h2,
      width : this.width,
      top : h1 + gap,
      left : 800
    });
  },
}
// 創建柱子
pipes.produceTimer = getTimer(2500,pipes,function(){
  this.createPipe();
})

// 移動柱子
pipes.moveTimer = getTimer(30,pipes,function(){
  // 因為要移動所有的柱子 && 對遊戲進行積分
  for(let i=0;i<this.all.length;i++){
    let p = this.all[i]; // 得到當前的柱子
    p.left -= 2;
    if (p.left < -p.width){
      p.dom.remove();
      this.all.splice(i,1);
      i--;
    } else {
      p.dom.style.left = p.left + 'px';
    }
    // 判斷柱子是否過了小鳥，若過了則說明小鳥過了一根柱子
    if (p.left<=(bird.left-pipes.width)){
      console.log("+1"); 
    }
  }
  game.gameOver(); // 每次柱子移動後，都需要判斷遊戲是否結束
});

document.documentElement.onkeydown = function(e){
  if (e.key === ' '){
    bird.jump();
  }
  if (e.key === 'Enter'){
    // 按下Enter後，有三種狀態（遊戲運行中，遊戲暫停中，遊戲已結束）
    if (game.isGmaeOver){
      location.reload();
    }
    if (game.paused){
      game.start();
      game.paused = !game.paused
    } else {
      game.stop();
      game.paused = !game.paused
    }

  }
}
