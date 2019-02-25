// Lets develop some js code
const PIXELS_TILE = 'pixels';

class Tetris {
    constructor(options) {
        this.options = options;
        this.latestTimeStamp = null;
        this.images = [];
        this.canvas = document.getElementById(this.options.id);
        this.ctx = this.canvas && this.canvas.getContext('2d');
        this.store = {}; // our figure store
        this.boxSize = 39;
        this.boxCountWidth = 10;
        this.boxCountHeight = 15;
        this.activeElement = null;
        this.nextElement = null;
        this.score = 0;
        this.elements = options.elements;
        this.colors = {
            table: "#221f28",
            grid: "#656369"
        };

        this.positions = {
            "aria": {"x": 20, y: 100}
        };


        this.init();
    }

    // Interfaces Methods
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        for (let i = 0; i < this.boxCountWidth; i++) {
            for (let j = 0; j < this.boxCountHeight; j++) {
                let storeKey = this.getBoxKey(i, j);
                let x = this.positions.aria.x + i * this.boxSize;
                let y = this.positions.aria.y + j * this.boxSize;
                this.ctx.strokeStyle = this.colors.grid;
                this.ctx.strokeRect(x, y, this.boxSize, this.boxSize);
                (this.store[storeKey] !== undefined) && this.drawBox(x, y, this.store[storeKey]);
            }
        }
    }

    /**
     * Draw cube in Aria by x, y, color
     */
    drawBox(x, y, color) {
        let positionByColor = [0, 1, 2, 3, 4, 5].reduce((prev, cur, idx) => {
            prev[idx] = cur * this.boxSize;
            return prev;
        }, {});

        this.ctx.drawImage(this.images[PIXELS_TILE], positionByColor[color], 0, this.boxSize, this.boxSize, x, y, this.boxSize, this.boxSize);
    }

    drawScore() {
        this.ctx.font = "30px Comic Sans MS";
        this.ctx.fillStyle = "white";
        this.ctx.fillText("Score: " + this.score, this.positions.aria.x, this.positions.aria.y + (this.boxCountHeight * this.boxSize) + 40);
    }

    drawNextElement() {
        this.ctx.font = "30px Comic Sans MS";
        this.ctx.fillStyle = "white";
        let positions = {
            x: this.positions.aria.x + (this.boxCountWidth * this.boxSize) + 70,
            y: this.positions.aria.y,
            // Added next elements position
            "0": {x: 20, y: 25},
            "1": {x: 0, y: 25},
            "2": {x: -25, y: 25},
            "3": {x: -50, y: 25},
            "4": {x: -50, y: 25}
        };

        let filteredByXElement = this.nextElement.elements.map(el => el.x);
        filteredByXElement = Math.max.apply(Math, filteredByXElement);

        this.ctx.fillText("Next", positions.x, positions.y);
        // next elements
        this.nextElement.elements.forEach(element => {
            this.drawBox((element.x * this.boxSize) + positions.x + positions[filteredByXElement].x, (element.y * this.boxSize) + positions.y + positions[filteredByXElement].y, this.nextElement.color);
        })
    }


    drawTableGame() {
        let w = this.boxSize * this.boxCountWidth;
        let h = this.boxSize * this.boxCountHeight;


        this.ctx.fillStyle = this.colors.table;
        this.ctx.fillRect(this.positions.aria.x, this.positions.aria.y, w, h);
    }

    drawActiveElement() {
        this.activeElement.elements.forEach(element => {
            let x = (this.boxSize * (this.activeElement.x + element.x)) + this.positions.aria.x;
            let y = (this.boxSize * (this.activeElement.y + element.y)) + this.positions.aria.y;
            this.drawBox(x, y, this.activeElement.color);
        });
    }

    // Services Methods
    init() {
        this.loadImages(this.options.images, () => {
            this.setActiveElement();

            this.initEvents();
            window.requestAnimationFrame((()=> {
                this.updateLoopFrame();
                this.updateTimeStamp();
            }))
        })
    }


    /**
     * Game loop it's brain of the game
     */
    loop() {
        if (new Date().getTime() - this.latestTimeStamp > this.options.speed) {
            this.updatePosition();
            this.clearCanvas();
            this.drawTableGame();
            this.drawGrid();
            this.drawActiveElement();
            this.drawScore();
            this.drawNextElement();

            this.updateTimeStamp();
        }
        this.updateLoopFrame();
    }


    updateLoopFrame() {
        window.requestAnimationFrame(() => {
            this.loop();
        })
    }

    updateTimeStamp() {
        this.latestTimeStamp = +new Date();
    }

    updatePosition() {
        if (!this.thereIsCollision({type: 'update'})) this.activeElement.y++;
    }


    thereIsCollision(options) {
        let thereIsCollision = false;
        switch (options.type) {
            case 'border':
            {
                for (let key in this.store) {
                    this.activeElement.elements.forEach(element => {
                        let nextXPos = options.right ? element.x + 1 : element.x - 1;
                        if (key === this.getBoxKey(nextXPos + this.activeElement.x, this.activeElement.y + element.y)) thereIsCollision = true;
                    });
                }

                this.activeElement.elements.forEach(element => {
                    let nextXPos = options.right ? element.x + 1 : element.x - 1;
                    if (this.activeElement.x + nextXPos < 0 || this.activeElement.x + nextXPos === this.boxCountWidth) thereIsCollision = true;
                });
            }
                break;
            case 'update':
            {
                let nextYPos = this.activeElement.y + 1;
                let gameOver = false;

                for (let key in this.store) {
                    this.activeElement.elements.forEach(element => {
                        if (key === this.getBoxKey(element.x + this.activeElement.x, nextYPos + element.y)) thereIsCollision = true;
                    });
                }


                !thereIsCollision && this.activeElement.elements.forEach(element => {
                    if (nextYPos + element.y === this.boxCountHeight) thereIsCollision = true;
                });

                // Game over Test
                thereIsCollision && this.activeElement.elements.forEach(element => {
                    if (element.y + this.activeElement.y === 0) {
                        gameOver = true;
                        this.score = 0;
                        this.store = {};
                        this.activeElement = null;
                        this.nextElement = null;
                        this.clearCanvas();
                        this.setActiveElement();
                    }
                });

                if (thereIsCollision && !gameOver) {
                    this.activeElement.elements.forEach(element => {
                        this.addElementToStore(this.activeElement.x + element.x, this.activeElement.y + element.y, this.activeElement.color);
                    });
                    this.activeElement = null;
                    this.setActiveElement();
                }


                //     Level complete
                this.levelComplete();

            }
                break;
            case 'rotate':
            {
                for (let key in this.store) {
                    options.elements.forEach(element => {
                        if (key === this.getBoxKey(element.x + this.activeElement.x, this.activeElement.y + element.y)) thereIsCollision = true;
                    });
                }

                !thereIsCollision && options.elements.forEach(element => { // test bottom collision
                    // write here because this.store can be empty!
                    if (element.y + this.activeElement.y >= this.boxCountHeight) thereIsCollision = true;
                    if (element.x + this.activeElement.x >= this.boxCountWidth || element.x + this.activeElement.x < 0) thereIsCollision = true;
                })
            }
        }

        return thereIsCollision;
    }


    levelComplete() {
        let removedLevel = null;
        for (let keyStore in this.store) {
            let keyStorePosition = this.getPositionByKey(keyStore);
            let currentCompleteLevel = 1;
            for (let key in this.store) {
                let keyPosition = this.getPositionByKey(key);
                if (key !== keyStore && keyStorePosition.y === keyPosition.y) currentCompleteLevel++;
            }

            if (currentCompleteLevel === this.boxCountWidth && !removedLevel) removedLevel = keyStorePosition.y;
        }

        if (removedLevel) {
            this.removeLevel(removedLevel);
            this.shiftLevel(removedLevel);
            this.levelComplete();
        }
    }


    shiftLevel(level) {
        if (level === 0) return false;
        level -= 1;
        for (let keyStore in this.store) {
            let keyStorePosition = this.getPositionByKey(keyStore);
            if (keyStorePosition.y === level) {
                this.addElementToStore(keyStorePosition.x, keyStorePosition.y + 1, this.store[keyStore]);
                delete this.store[keyStore];
            }
        }

        this.shiftLevel(level);
    }

    removeLevel(y) {
        for (let keyStore in this.store) {
            let keyStorePosition = this.getPositionByKey(keyStore);
            if (keyStorePosition.y === y) {
                this.score++;
                delete this.store[keyStore]
            }

        }
    }

    /**
     *
     * @param keys
     * @returns {{x: *, y: *}}
     */
    getPositionByKey(keys) {
        let key = keys.split("|").map(Number);
        return {
            x: key[0],
            y: key[1]
        }
    }

    /**
     * save elements to store by x,y,color
     */
    addElementToStore(x, y, color) {
        this.store[this.getBoxKey(x, y)] = color;
    }

    /**
     * Set active and next elements to aria
     * @returns {boolean}
     */
    setActiveElement() {
        if (this.activeElement) return false;
        let randomElement = getRandomElement.bind(this);

        if (!this.activeElement && !this.nextElement) {
            this.activeElement = randomElement();
            this.nextElement = randomElement();
            return false;
        }

        if (!this.activeElement && this.nextElement) {
            this.activeElement = this.nextElement;
            this.nextElement = randomElement();
            return false;
        }


        function getRandomElement() {
            let elementIdx = random(0, this.elements.length - 1);
            let element = this.elements[elementIdx];
            let rotateIdx = random(0, element.length - 1);
            let elements = this.elements[elementIdx][rotateIdx];
            let color = random(0, 5);
            let x = 5;
            let y = 0;

            return {x, y, elements, color, rotateIdx, elementIdx};
        }

    }


    getBoxKey(x, y) {
        return `${x}|${y}`
    }

    /**
     * Init  game events
     */
    initEvents() {
        document.addEventListener('keydown', (e) => {
            let keyCode = e.keyCode;
            if (keyCode === 37 && !this.thereIsCollision({type: 'border'})) this.activeElement.x--; // to left
            if (keyCode === 39 && !this.thereIsCollision({type: 'border', right: true})) this.activeElement.x++; // to right

            if (keyCode === 32) { // space
                let currentRotate = this.activeElement.rotateIdx;
                let maxRotate = this.elements[this.activeElement.elementIdx].length - 1;
                let nextRotate = currentRotate === maxRotate ? 0 : currentRotate + 1;
                let nextElements = this.elements[this.activeElement.elementIdx][nextRotate];

                if (!this.thereIsCollision({type: 'rotate', elements: nextElements})) {
                    this.activeElement.elements = nextElements;
                    this.activeElement.rotateIdx = nextRotate;
                }
            }

            this.clearCanvas();
            this.drawTableGame();
            this.drawGrid();
            this.drawActiveElement();
            this.drawScore();
            this.drawNextElement();

        })
    }

    loadImages(images, callback) {
        let promises = [];
        Array.isArray(images) && images.forEach(image => {
            promises.push(new Promise((resolve) => {
                let img = new Image();
                img.src = image.path;
                img.onload = ()=> {
                    this.images[image.name] = img;
                    resolve();
                }
            }));
        });

        Promise.all(promises).then(() => {
            callback()
        });
    }
}


(function () {
    fetch('assets/elements.json').then(res => res.json()).then(elements => {
        // Dont worry elements it's our tetris figures 

        new Tetris({
            id: "game",
            elements,
            speed: 200,
            images: [
                {name: PIXELS_TILE, path: "image/elements.png"}
            ]
        })
    })
})();


function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}