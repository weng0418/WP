const CELL_TYPE = Object.freeze({
  EMPTY: "EMPTY",
  FOOD: "FOOD",
  SNAKE: "SNAKE"
});

const DIRECTION = Object.freeze({
  NONE: "NONE",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  UP: "UP",
  DOWN: "DOWN"
});

// Object.freeze 表示凍結一個對象（對象的屬性不能增刪改，對象的原型不能改變）
// 定義了單元格的類型（三種，空單元格，食物單元格）和方向的類型（上下左右無）


// [單元格：傳入三個變量，返回一個單元格對象（具有行列和類型屬性）]有行列和类型属性）]
function Cell(row, column, cellType) {
  return {
    row: row,
    column: column, 
    cellType: cellType
  }
}

// [蛇 對象，傳入單元格，開始的長度，和背景畫布 ]
function Snake(cell, startingLength, board) {

  // 設置傳入的單元格屬性是蛇
  let head = cell;
  // 蛇的全部
  let snakeParts = [];
  head.cellType = CELL_TYPE.SNAKE;

  // 將蛇頭放在蛇的部分中；
  snakeParts.push(head);

  // 獲取蛇的初始長度，獲取身體的部分（一個豎行），把身體的部分設置成蛇屬性，並放在蛇的身體裡
  for(let i = 0; i < startingLength - 1; i++) {
    let bodyPart = board.cells[head.row + (i + 1)][head.column];
    bodyPart.cellType = CELL_TYPE.SNAKE;
    snakeParts.push( bodyPart )
  }

  // 生長：將這個單元格放入蛇的身體裡
  let grow = function() {
    snakeParts.push(head);
  }

  // 移動函數
  let move = function(nextCell) {
    // 獲取下一個單元格的屬性
    let cellType = nextCell.cellType;
    // 獲取蛇尾，同時蛇身體減去1
    let tail = snakeParts.pop();
    // 設置蛇尾的屬性是空
    tail.cellType = CELL_TYPE.EMPTY;

    // 設置下一個單元格是蛇頭，設置單元格的屬性並放在蛇的部分中
    head = nextCell;
    head.cellType = CELL_TYPE.SNAKE;
    snakeParts.unshift(head);
    // 蛇的中間每一個部分的屬性設置為蛇
    snakeParts.forEach(function(part) {
      part.cellType = CELL_TYPE.SNAKE;
    });
    // 把下一個單元格的屬性返回（下一個屬性可能是食物、蛇身體、邊界、或者空）
    return cellType;
  }

  // 檢查崩潰（遊戲結束）
  let checkCrash = function(nextCell) {
    // 如果下一個節點是未定義（邊界），崩潰
    let crashed = ( typeof nextCell === 'undefined' );
    if( !crashed ) {
      crashed = snakeParts.some(function(cell) {
        // 如果下一個單元格是蛇身體的一部分（行列號相同），判斷崩潰
        return (cell.row === nextCell.row && cell.column === nextCell.column);
      });
    }
    // 返回崩潰情況
    return crashed;
  }

  // API：返回蛇頭（當前傳入的單元格）
  let getHead = function() {
    return head;
  }

  return {
    getHead: getHead,
    grow: grow,
    move: move,
    checkCrash: checkCrash
  }
}

// Board 函數（棋盤函數）
// Array.from(arr, function) 

function Board(rowCount, columnCount) {
  // 創建一個二維數組（行列數）
  let cells = Array.from(Array(rowCount), () => new Array(columnCount));

  // 把數組的每一項設置成一個Cell對象
  for( let row = 0; row < rowCount; row++ ) {
    for( let column = 0; column < columnCount; column++ ) {
      cells[row][column] = Cell(row, column, CELL_TYPE.EMPTY);
    }
  }

  // 渲染函數（設置食物單元格和蛇單元格的類名樣式）
  let render = function() {
    let snakeCssClass = 'snake';
    let foodCssClass = 'food';
    for(let row = 0; row < rowCount; row++) {
      for(let column = 0; column < columnCount; column++) {
        // 獲取每一個cell的類型
        let cellType = cells[row][column].cellType;
        // 獲取界面上Cell對應的DOM元素
        let element = document.getElementById( row + "_" + column );
        // 根據cell不同，設置界面DOM節點類名（是否是蛇，是否是食物）這裡直接改變DOM元素（遍歷一次改變類名，性能）
        if( cellType === CELL_TYPE.EMPTY ) {
          element.classList.remove(snakeCssClass);
          element.classList.remove(foodCssClass);
        }
        else if( cellType === CELL_TYPE.SNAKE ) {
          element.classList.add(snakeCssClass);
          element.classList.remove(foodCssClass);
        }
        else if( cellType === CELL_TYPE.FOOD ) {
          element.classList.add(foodCssClass);
          element.classList.remove(snakeCssClass);
        }
      }
    }
  }

  // 放置食物
  let placeFood = function() {
    // 獲取可以放置食物的單元格數組
    let availableCells = getAvailableCells();
    // 獲取一個隨機整數（小於食物單元格的數量），並將對應的單元格設置為食物；
    let cellIndex = getRandomInteger(0, availableCells.length);
    availableCells[cellIndex].cellType = CELL_TYPE.FOOD;
    // 這裡可以改成多個食物：在多個單元格設置食物（需要if判斷cellIndex的數量）
    // availableCells[cellIndex + 1].cellType = CELL_TYPE.FOOD;
    // availableCells[cellIndex - 1].cellType = CELL_TYPE.FOOD;
  }

  // 獲取可以放置食物的單元格數組：遍歷二維數組，如果單元格是空的，返回這個單元格
  let getAvailableCells = function() {
    let availableCells = [];
    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {
        if (cells[row][column].cellType === CELL_TYPE.EMPTY) {
          availableCells.push(cells[row][column]);
        }
      }
    }
    return availableCells;
  }

  // API 獲取列數量（外部暴露屬性）
  let getColumnCount = function() {
    return columnCount;
  }

  // 獲取行數量
  let getRowCount = function() {
    return rowCount;
  }

  // 返回棋盤對象：獲取行數量、列數量、單元格序列、放置食物函數，渲染函數
  return {
    getRowCount: getRowCount,
    getColumnCount: getColumnCount,
    cells: cells,
    placeFood: placeFood,
    render: render
  } 
}

// 獲取兩個數之間的隨機整數（
function getRandomInteger(min, max) {
  return Math.floor(Math.random() * ( max - min )) + min;
}

// 主函數
function Game(snake, board) {
  // 設置基本參數
  let directions = [];
  let direction = DIRECTION.NONE;
  let gameOver = false;
  let score = 0;

  // 更新
  let update = function(snake, board) {
    // 如果遊戲沒有結束並且第一個單元格不是 none
    if (!gameOver && getFirstDirection() !== DIRECTION.NONE) {
      // 獲取下一個單元格
      let nextCell = getNextCell(snake.getHead(), board);

      // 根據下個單元格，如果崩潰了
      if (snake.checkCrash(nextCell)) {
        // 清空方向並設置遊戲結束
        directions = [];
        direction = DIRECTION.NONE;
        gameOver = true;
        modal.style.display = "block";
        let message = "Game Over! You scored " + score + " points!";
        document.getElementById("message").innerHTML = message;
        // 設置界面的提示信息
      } else {
        // 如果沒有崩潰，那麼將蛇移動到下一個單元格，分數增加，蛇增加，重新放置食物
        let nextCellType = snake.move(nextCell);
        if (nextCellType == CELL_TYPE.FOOD) {
          score += 100;
          snake.grow();
          board.placeFood();
        }
      }
    }
  };

  // 獲取下一個單元格（傳入蛇頭和界面背景）
  let getNextCell = function(snakeHead, board) {
    // 獲取蛇頭的行列
    let row = snakeHead.row;
    let column = snakeHead.column;
    // 獲取第一個方向
    direction = getFirstDirection();

    if (direction === DIRECTION.RIGHT) {
      column++;
    }
    else if (direction === DIRECTION.LEFT) {
      column--;
    }
    else if (direction === DIRECTION.UP) {
      row--;
    }
    else if (direction === DIRECTION.DOWN) {
      row++;
    }

    // 根據方向，修改蛇頭的位置；如果下一個方向在界面內部（行列號位於範圍內，設置下一個單元格）
    let nextCell;
    if (row > -1 && row < board.getRowCount() && column > -1 && column < board.getColumnCount()) {
      nextCell = board.cells[row][column];
    }
    // 把方向的最後一個值去掉
    directions.shift();
    // 返回下一個單元格（如果下一個單元格是邊界外部，那麼返回的是undefined）
    return nextCell;
  };

  // 增加方向（將新的方向放在列表中）
  let addDirection = function(newDirection){
    directions.push(newDirection);
  }

  // 獲取第一個方向（如果長度大於0，那麼返回第一個長度，否則返回Direction 就是none）
  let getFirstDirection = function() {
    let result = direction;
    if (directions.length > 0) {
      result = directions[0];
    }
    return result;
  }

  // 獲取最後一個方向
  let getLastDirection = function() {
    let result = direction;
    if (directions.length > 0){
      result = directions[directions.length - 1];
    }
    return result;
  }

  // 獲取超出最大距離的方向（如果當前數組的長度大於3，就是true ）
  let exceededMaxDirections = function() {
    return directions.length > 3;
  }

  // 返回相關函數
  return {
    exceededMaxDirections: exceededMaxDirections,
    getLastDirection: getLastDirection,
    addDirection: addDirection,
    update: update
  };
}

// 初始化單元格：輸入界面中列的數量
function initializeCells(columnCount) {
  let row = 0;
  let column = 0;
  let cells = document.querySelectorAll('.cell');
  // 獲取全部的單元格
  cells.forEach(function(cell) {
    cell.id = row + "_" + column;
    cell.classList = "";
    cell.classList.add("cell");
    // 設置單元格的類是cell,ID是行號和列號
    // 如果一行單元格的長度大於列數量，就換行
    column++;
    if (column >= columnCount) {
      column = 0;
      row++;
    }
  });
  // 这里的cell是DOM结构的伪数组（深复制）所以直接改变属性即可
}

// 監聽按鍵：控制蛇的移動方向：update 點擊某個按鍵可以暫停遊戲，再次點擊可以繼續遊戲（設置一個變量遊戲是否暫停的函數）
function listenForInput(game) {
  let firstTime = true;

  let movingVertically = function() {
    // 上一次的操作是垂直操作（不是左右），並且遊戲沒有超出最大的方向
    return !game.exceededMaxDirections() && game.getLastDirection() !== DIRECTION.RIGHT && game.getLastDirection() !== DIRECTION.LEFT;
  };
  let movingHorizontally = function() {
    // 上一次的操作是水平操作（不是上下），並且遊戲沒有超出最大的方向
    return !game.exceededMaxDirections() && game.getLastDirection() !== DIRECTION.UP && game.getLastDirection() !== DIRECTION.DOWN;
  };
  let changeDirection = function(event) {
    // 首次加载时，向上运动（这个参数可以变成其他方向）
    if( firstTime ) {
      game.addDirection( DIRECTION.UP );
      firstTime = false;
    } else {
      const LEFT_ARROW = 37;
      const RIGHT_ARROW = 39;
      const UP_ARROW = 38;
      const DOWN_ARROW = 40;
      // 如果點擊左右鍵，並且最近一次操作不是左右操作，那麼左轉彎
      // update 使用鍵盤的 asdw 也可以改變方向（針對於筆記型電腦上下左右不好用的情況，或者讓用戶自定義操作鍵）
      if( event.keyCode == LEFT_ARROW && movingVertically() ) {
        game.addDirection( DIRECTION.LEFT );
      } else if( event.keyCode == RIGHT_ARROW && movingVertically() ) {
        game.addDirection( DIRECTION.RIGHT );
      } else if( event.keyCode == UP_ARROW && movingHorizontally() ) {
        game.addDirection( DIRECTION.UP );
      } else if( event.keyCode == DOWN_ARROW && movingHorizontally() ) {
        game.addDirection( DIRECTION.DOWN );
      }
    }
  };
  document.onkeydown = null;
  document.addEventListener('keydown', changeDirection);
}

// 新遊戲，初始化界面的高度和寬度，蛇的初始長度
function newGame() {
  // 這裡的參數可以自定義
  const rowCount = 20;
  const columnCount = 20;
  const startingLength = 5;

  // 新建一個背景（根據行列的尺寸）
  let board = Board(rowCount, columnCount);

  // 獲取面板中間的單元格作為開始單元格
  let rowIndex = Math.floor(rowCount/2);
  let columnIndex = Math.floor(columnCount/2);
  // 創建蛇（根據開始單元格、開始長度、面板參數）
  let snake = Snake( board.cells[rowIndex][columnIndex], startingLength, board );

  // 創建遊戲
  let game = Game(snake, board);

  // 初始化單元格數據
  initializeCells(columnCount);

  // 放置食物
  board.placeFood();

  // 渲染背景
  board.render();

  // 監聽鍵盤輸入事件
  listenForInput(game);

  // 設置間隔，每200ms更新一次界面（可以自定義更新速度，根據蛇的長度，或者用戶自定義難度）
  let interval = setInterval(function() { 
    game.update(snake, board);
    board.render();
  }, 200);
  // 返回間隔
  return interval;
}

// 獲取界面的 modal 對話框
let modal = document.getElementById("modal");
// 獲取關閉對話框關閉按鈕
let closeModalButton = document.getElementsByClassName("close")[0];
// 獲取關閉對話框關閉按鈕
closeModalButton.onclick = function() {
  modal.style.display = "none";
  clearInterval(snakeGame);
  snakeGame = newGame();
}
// 創建新的遊戲
let snakeGame = newGame();
