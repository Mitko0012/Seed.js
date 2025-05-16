let seed = (() => {
    let returnObject = {};
    let canvas;
    let ctx;
    let isRunning = false;
    let mouseX = 0;
    let mouseY = 0;
    let leftDown = false;
    let middleDown = false;
    let rightDown = false;
    let mouse = {
        getPosX: function() {return mouseX;},
        getPosY: function() {return mouseY;},
        getDown: function(button) {return buttons[button];}
    }
    let touches = [];
    let getTouches = () => touches;
    
    let buttons = {
        left: false,
        middle: false,
        right: false
    }

    let buttonValues = {
        0: "left",
        1: "middle",
        2: "right"
    }

    let touchHandle = (event) => {
        touches = Array.from(event.touches).map((touch) => {
            let rect = canvas.getBoundingClientRect();
            return {
                posX: touch.clientX - rect.left,
                posY: touch.clientY - rect.top
            }
        });
    }

    let onMouseMove = (event) => {
        mouseX = event.offsetX;
        mouseY = event.offsetY;
    }

    let onMouseDown = (event) => {
        buttons[buttonValues[String(event.button)]] = true;
    }

    let onMouseUp = (event) => {
        buttons[buttonValues[String(event.button)]] = false;
    }
    
    returnObject.onUpdate = () => {console.log("knee grow")};
    returnObject.deltaTime = 0;
    returnObject.unitsOnCanvas = 10;
    
    function startEngine(canvasId) {
        canvas = document.getElementById(canvasId);
        if(canvas === null || canvas === undefined) 
            throw new Error(`Canvas with the id "${canvasId}" can't be found!`); 
        ctx = canvas.getContext("2d");
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("touchstart", touchHandle);
        canvas.addEventListener("touchmove", touchHandle);
        canvas.addEventListener("touchend", touchHandle);
        isRunning = true;
        window.requestAnimationFrame(updateCycle);
    }

    let scaleConverter = {
        neutralToGame (value, isPos, isX, isSticky) { 
            let unit = Math.min(canvas.width, canvas.height) / returnObject.unitsOnCanvas;
            let camOffsetX = camera.posX * unit * -1 + (canvas.width / 2);
            let camOffsetY = camera.posY * unit * -1 + (canvas.height / 2);
    
            if(isX) {
                return (value - (isPos? isSticky? canvas.width / 2: camOffsetX : 0)) / unit;
            }
            else {
                return (value - (isPos? isSticky? canvas.height / 2: camOffsetY : 0)) / unit;
            }
        },
        gameToNeutral (value, isPos, isX, isSticky) {
            let unit = Math.min(canvas.width, canvas.height) / returnObject.unitsOnCanvas;;
            let camOffsetX = camera.posX * unit * -1 + (canvas.width / 2);
            let camOffsetY = camera.posY * unit * -1 + (canvas.height / 2);
    
            if(isX) {
                return value * unit + (isPos? isSticky? canvas.width / 2: camOffsetX : 0);
            }
            else {
                return value * unit + (isPos? isSticky? canvas.height / 2: camOffsetY : 0);
            }
        }
    }
    
    function getCanvasWidth() {
        return canvas.width;
    }

    function getCanvasHeight() {
        return canvas.height;   
    }

    let timeAtLast = -1;
    function updateCycle(timestamp) {
        if(canvas.width != canvas.offsetWidth)
            canvas.width = canvas.offsetWidth;
        if(canvas.height != canvas.offsetHeight)
            canvas.height = canvas.offsetHeight;
        if(timeAtLast !== -1)
            returnObject.deltaTime = (timestamp - timeAtLast) / 1000;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        returnObject.onUpdate();
        timeAtLast = timestamp;
        window.requestAnimationFrame(updateCycle);
    }

    function fullRectangle(posX, posY, width, height, color) {
        return {
            posX,
            posY,
            width,
            height,
            color,
            rotationCenterX: width / 2,
            rotationCenterY: height / 2,
            isSticky: false,
            angle: 0,
            draw() {
                let neutralX = scaleConverter.gameToNeutral(this.posX, true, true, this.isSticky);
                let neutralY = scaleConverter.gameToNeutral(this.posY, true, false, this.isSticky);
                let neutralWidth = scaleConverter.gameToNeutral(this.width, false, false, this.isSticky);
                let neutralHeight = scaleConverter.gameToNeutral(this.height, false, false, this.isSticky);
                let neutralRotationCenterX = scaleConverter.gameToNeutral(this.rotationCenterX, false, true, this.isSticky);
                let neutralRotationCenterY = scaleConverter.gameToNeutral(this.rotationCenterY, false, false, this.isSticky);
                ctx.save();
                ctx.fillStyle = this.color;
                ctx.translate(neutralX + neutralRotationCenterX, neutralY + neutralRotationCenterY);
                ctx.rotate(degreeToRadian(this.angle));
                ctx.fillRect(-neutralRotationCenterX, -neutralRotationCenterY, neutralWidth, neutralHeight);
                ctx.restore();
            }
        }
    }

    function emptyRectangle(posX, posY, width, height, strokeWidth, color) {
        return {
            posX,
            posY,
            width,
            height,
            color,
            strokeWidt,
            rotationCenterX: width / 2,
            rotationCenterY: height / 2,
            isSticky: false,
            angle: 0,
            draw() {
                let neutralX = scaleConverter.gameToNeutral(this.posX, true, true, this.isSticky);
                let neutralY = scaleConverter.gameToNeutral(this.posY, true, false, this.isSticky);
                let neutralWidth = scaleConverter.gameToNeutral(this.width, false, false, this.isSticky);
                let neutralHeight = scaleConverter.gameToNeutral(this.height, false, false, this.isSticky);
                let neutralRotationCenterX = scaleConverter.gameToNeutral(this.rotationCenterX, false, true, this.isSticky);
                let neutralRotationCenterY = scaleConverter.gameToNeutral(this.rotationCenterY, false, false, this.isSticky);
                let neutralStrokeWidth = scaleConverter.gameToNeutral(this.strokeWidth, false, false, this.isSticky);
                ctx.save();
                ctx.lineWidth = neutralStrokeWidth;
                ctx.strokeStyle = this.color;
                ctx.translate(neutralX + neutralRotationCenterX, neutralY + neutralRotationCenterY);
                ctx.rotate(degreeToRadian(this.angle));
                ctx.strokeRect(-neutralRotationCenterX, -neutralRotationCenterY, neutralWidth, neutralHeight);
                ctx.restore();
            }
        }
    }

    function fullEllipse(posX, posY, width, height, color) {
        return {
            posX,
            posY,
            width,
            height,
            color,
            rotationCenterX: width / 2,
            rotationCenterY: height / 2,
            angle: 0,
            isSticky: false,
            draw() {
                let neutralX = scaleConverter.gameToNeutral(this.posX, true, true, this.isSticky);
                let neutralY = scaleConverter.gameToNeutral(this.posY, true, false, this.isSticky);
                let neutralWidth = scaleConverter.gameToNeutral(this.width, false, false, this.isSticky);
                let neutralHeight = scaleConverter.gameToNeutral(this.height, false, false, this.isSticky);
                let neutralRotationCenterX = scaleConverter.gameToNeutral(this.rotationCenterX, false, false, this.isSticky);
                let neutralRotationCenterY = scaleConverter.gameToNeutral(this.rotationCenterY, false, false, this.isSticky);
                ctx.save();
                ctx.fillStyle = this.color;
                ctx.translate(neutralX + neutralRotationCenterX, neutralY + neutralRotationCenterY);
                ctx.rotate(degreeToRadian(this.angle));
                ctx.beginPath();
                ctx.ellipse(-neutralRotationCenterX + neutralWidth / 2, -neutralRotationCenterY + neutralHeight / 2, (neutralWidth / 2), (neutralHeight / 2), 0, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
    }

    function emptyEllipse(posX, posY, width, height, strokeWidth, color) {
        return {
            posX,
            posY,
            width,
            height,
            color,
            strokeWidth,
            rotationCenterX: width / 2,
            rotationCenterY: height / 2,
            angle: 0,
            isSticky: false,
            draw() {
                let neutralX = scaleConverter.gameToNeutral(this.posX, true, true, this.isSticky);
                let neutralY = scaleConverter.gameToNeutral(this.posY, true, false, this.isSticky);
                let neutralWidth = scaleConverter.gameToNeutral(this.width, false, false, this.isSticky);
                let neutralHeight = scaleConverter.gameToNeutral(this.height, false, false, this.isSticky);
                let neutralRotationCenterX = scaleConverter.gameToNeutral(this.rotationCenterX, false, false, this.isSticky);
                let neutralRotationCenterY = scaleConverter.gameToNeutral(this.rotationCenterY, false, false, this.isSticky);
                let neutralStrokeWidth = scaleConverter.gameToNeutral(this.strokeWidth, false, false, this.isSticky);
                ctx.save();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = neutralStrokeWidth;
                ctx.translate(neutralX + neutralRotationCenterX, neutralY + neutralRotationCenterY);
                ctx.rotate(degreeToRadian(this.angle));
                ctx.beginPath();
                ctx.ellipse(-neutralRotationCenterX + neutralWidth / 2, -neutralRotationCenterY + neutralHeight / 2, (neutralWidth / 2), (neutralHeight / 2), 0, 0, Math.PI * 2);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    function line(startX, startY, endX, endY, strokeWidth, color) {
        return {
            startX,
            startY,
            endX,
            endY,
            strokeWidth,
            isSticky: false,
            color,
            draw: function() {
                let neutralStartX  = scaleConverter.gameToNeutral(this.startX, true, true, this.isSticky); 
                let neutralStartY  = scaleConverter.gameToNeutral(this.startY, true, false, this.isSticky);
                let neutralEndX  = scaleConverter.gameToNeutral(this.endX, true, false, this.isSticky);
                let neutralEndY  = scaleConverter.gameToNeutral(this.endY, true, false, this.isSticky);
                let neutralStrokeWidth = scaleConverter.gameToNeutral(this.strokeWidth, false, false, this.isSticky);
                ctx.save();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = neutralStrokeWidth;
                ctx.beginPath();
                ctx.moveTo(neutralStartX, neutralStartY);
                ctx.lineTo(neutralEndX, neutralEndY);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        }
    }
    
    function sprite(posX, posY, width, height, texturePath)
    {
        let textureLoaded = false;
        let texture = new Image();
        texture.src = texturePath;
        return {
            posX,
            posY,
            width, 
            height,
            rotationCenterX: width / 2,
            rotationCenterY: height / 2,
            angle: 0,
            isSticky: false,
            draw: function() {
                let neutralX = scaleConverter.gameToNeutral(this.posX, true, true, this.isSticky);
                let neutralY = scaleConverter.gameToNeutral(this.posY, true, false, this.isSticky);
                let neutralWidth = scaleConverter.gameToNeutral(this.width, false, false, this.isSticky);
                let neutralHeight = scaleConverter.gameToNeutral(this.height, false, false, this.isSticky);
                let neutralRotationCenterX = scaleConverter.gameToNeutral(this.rotationCenterX, false, false, this.isSticky);
                let neutralRotationCenterY = scaleConverter.gameToNeutral(this.rotationCenterY, false, false, this.isSticky);
                ctx.save();
                ctx.fillStyle = this.color;
                ctx.translate(neutralX + neutralRotationCenterX, neutralY + neutralRotationCenterY);
                ctx.rotate(degreeToRadian(this.angle));
                ctx.drawImage(texture, -neutralRotationCenterX, -neutralRotationCenterY, neutralWidth, neutralHeight);
                ctx.restore();
            },
            isLoaded: function() {
                return texture.complete;
            },
            setTexture: function(path) {
                texture.src = path;
            },
        }
    }
    
    function degreeToRadian(x) {
        return x * (Math.PI / 180);
    }
    
    let camera = {
        posX: 0,
        posY: 0
    }
    

    returnObject.onUpdate;
    returnObject.getCanvasWidth = getCanvasWidth;
    returnObject.getCanvasHeight = getCanvasHeight;
    returnObject.startEngine = startEngine;
    returnObject.fullRectangle = fullRectangle;
    returnObject.emptyRectangle = emptyRectangle;
    returnObject.fullEllipse = fullEllipse;
    returnObject.emptyEllipse = emptyEllipse;
    returnObject.sprite = sprite;
    returnObject.scaleConverter = scaleConverter;
    returnObject.camera = camera;
    returnObject.line = line;
    returnObject.mouse = mouse;
    returnObject.getTouches = getTouches;
    return returnObject;
})();
