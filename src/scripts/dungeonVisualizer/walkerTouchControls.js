let desiredLeft, desiredTop, currentLeft, currentTop, offsetLeft, offsetTop, l, left, top, d;
let dx, dy, centerX, centerY, placeCenterX, placeCenterY, dist;

class WalkerTouchControls {
    constructor(walkerVars, config) {
        this.walkerVars = walkerVars;
        this.joystickReturnSpeed = config.visParams.joystickReturnSpeed;

        this._createDivs();
        this._applyStyles();

        this.moveTouchId = null;
        this.lookTouchId = null;
        this.jumpTouchId = null;

        this.lastMoveTouchPos = new THREE.Vector2();
        this.lastLookTouchPos = new THREE.Vector2();

        this._back.addEventListener('touchstart', (e) => {
            if (!Number.isInteger(this.moveTouchId)) {
                this.moveTouchId = e.changedTouches[0].identifier;
                this._onMoveTouchChange(e.changedTouches[0]);
                this._back.style.opacity = '0.8';
            }
        });

        this._lookJoystickCont.addEventListener('touchstart', (e) => {
            if (!Number.isInteger(this.lookTouchId)) {
                this.lookTouchId = e.changedTouches[0].identifier;
                this.lastLookTouchPos.set(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
            }
        });

        document.addEventListener('touchmove', (e) => { this._onTouchMove(e); });
        document.addEventListener('touchend', (e) => { this._onTouchEnd(e); });
        document.addEventListener('touchcancel', (e) => { this._onTouchEnd(e); });

        this._jumpButtonCont.addEventListener('touchstart', (e) => {
            this.jumpTouchId = e.changedTouches[0].identifier;
            this.walkerVars.jump = true;
        });
    }

    enable() {
        document.body.appendChild(this._moveJoystickCont);
        document.body.appendChild(this._lookJoystickCont);
        document.body.appendChild(this._jumpButtonCont);
    }

    disable() {
        document.body.removeChild(this._moveJoystickCont);
        document.body.removeChild(this._lookJoystickCont);
        document.body.removeChild(this._jumpButtonCont);
    }

    applyInertia() {
        this.walkerVars.mobileLookLeftRight /= 2;
        this.walkerVars.mobileLookUpDown /= 2;

        if (!Number.isInteger(this.moveTouchId)) this._smoothResetJoystickDiv();
    }

    _onTouchMove(e) {
        e.preventDefault();

        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.moveTouchId) {
                this._onMoveTouchChange(e.changedTouches[i]);
            } else if (e.changedTouches[i].identifier === this.lookTouchId) {
                this._onLookTouchChange(e.changedTouches[i]);
            }
        }
    }

    _onTouchEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.moveTouchId) {
                this.moveTouchId = null;
                this._back.style.opacity = '0.6';
                this.walkerVars.moveForward = false;
                this.walkerVars.moveBackward = false;
                this.walkerVars.moveRight = false;
                this.walkerVars.moveLeft = false;
            } else if (e.changedTouches[i].identifier === this.lookTouchId) {
                this.lookTouchId = null;
                // this._mobileLookLeftRight = 0; // inertia in update loop handles this
                // this._mobileLookUpDown = 0; // inertia in update loop handles this
            } else if (e.changedTouches[i].identifier === this.jumpTouchId) {
                this.jumpTouchId = null;
                this.walkerVars.jump = false;
            }
        }
    }

    resetJoystickDiv() {
        this._front.style.marginLeft = this._back.clientWidth / 2 - this._front.clientWidth / 2 - 1 + 'px';
        this._front.style.marginTop = this._back.clientHeight / 2 - this._front.clientHeight / 2 - 1 + 'px';
    }

    _smoothResetJoystickDiv() {
        desiredLeft = this._back.clientWidth / 2 - this._front.clientWidth / 2 - 1;
        desiredTop = this._back.clientHeight / 2 - this._front.clientHeight / 2 - 1;

        currentLeft = this._front.offsetLeft;
        currentTop = this._front.offsetTop;

        offsetLeft = desiredLeft - currentLeft;
        offsetTop = desiredTop - currentTop;

        l = Math.sqrt(offsetLeft * offsetLeft + offsetTop * offsetTop);
        offsetLeft /= l;
        offsetTop /= l;

        left = currentLeft + offsetLeft * this.joystickReturnSpeed;
        top = currentTop + offsetTop * this.joystickReturnSpeed;

        d = (left - desiredLeft) * (left - desiredLeft) + (top - desiredTop) * (top - desiredTop);
        if (d < this.joystickReturnSpeed * this.joystickReturnSpeed) {
            left = desiredLeft;
            top = desiredTop;
        }

        this._front.style.marginLeft = left + 'px';
        this._front.style.marginTop = top + 'px';
    }

    _onMoveTouchChange(touch) {
        centerX = this._moveJoystickCont.offsetLeft + this._back.clientWidth / 2;
        centerY = this._moveJoystickCont.offsetTop + this._back.clientHeight / 2;

        dx = touch.clientX - centerX;
        dy = touch.clientY - centerY;

        placeCenterX = this._back.clientWidth / 2 - this._front.clientWidth / 2;
        placeCenterY = this._back.clientHeight / 2 - this._front.clientHeight / 2;

        dist = Math.sqrt(dx * dx + dy * dy) / (this._moveJoystickCont.clientWidth / 2);

        if (dist > 1) {
            dx /= dist;
            dy /= dist;
        }

        this._front.style.marginLeft = placeCenterX + dx + 'px';
        this._front.style.marginTop = placeCenterY + dy + 'px';

        // map to [-1, 1]
        dx /= (this._moveJoystickCont.clientWidth / 2);
        dy /= (this._moveJoystickCont.clientWidth / 2);

        this.walkerVars.moveForward = dy < 0;
        this.walkerVars.moveBackward = dy > 0;
        this.walkerVars.moveRight = dx > 0;
        this.walkerVars.moveLeft = dx < 0;

        this.walkerVars.moveForwardBackMultiplier = Math.abs(dy);
        this.walkerVars.moveLeftRightMultiplier = Math.abs(dx);
    }

    _onLookTouchChange(touch) {
        dx = touch.screenX - this.lastLookTouchPos.x;
        dy = - (touch.screenY - this.lastLookTouchPos.y);

        this.walkerVars.mobileLookLeftRight = dx;
        this.walkerVars.mobileLookUpDown = dy;

        this.lastLookTouchPos.set(touch.screenX, touch.screenY);
    }

    // keeping it in js for the sake of module portability
    _createDivs() {
        this._moveJoystickCont = document.createElement('div.moveJoystickCont');
        this._back = document.createElement('div.moveJoystickBack');
        this._front = document.createElement('div.moveJoystickFront');

        this._moveJoystickCont.appendChild(this._back);
        this._back.appendChild(this._front);

        this._lookJoystickCont = document.createElement('div.lookJoystickCont');

        this._jumpButtonCont = document.createElement('div.jumpButtonCont');
        this._jumpButton = document.createElement('div.jumpButton');
        this._jumpButton.innerHTML = 'Jump';
        this._jumpButtonCont.appendChild(this._jumpButton);
    }

    // keeping it in js for the sake of module portability
    _applyStyles() {
        const moveJoystickCont = this._moveJoystickCont;
        const back = this._back;
        const front = this._front;
        const lookJoystickCont = this._lookJoystickCont;

        moveJoystickCont.style.position = 'absolute';
        moveJoystickCont.style.left = '5vw';
        moveJoystickCont.style.bottom = '10vh';
        moveJoystickCont.style.width = '25vw';
        moveJoystickCont.style.height = '25vw';
        moveJoystickCont.style.zIndex = '1';

        back.style.width = '100%';
        back.style.height = '100%';
        back.style.display = 'table';
        back.style.backgroundColor = '#333333';
        back.style.opacity = '0.6';
        back.style.borderRadius = '50%';

        front.style.width = '50%';
        front.style.height = '50%';
        front.style.display = 'block';
        front.style.backgroundColor = '#000000';
        front.style.borderRadius = '50%';
        front.style.borderStyle = 'dashed';
        front.style.borderColor = 'white';

        lookJoystickCont.style.height = '80%';
        lookJoystickCont.style.position = 'absolute';
        lookJoystickCont.style.width = '100%';
        lookJoystickCont.style.bottom = '0';
        lookJoystickCont.style.right = '0';

        this._jumpButtonCont.className = 'exitWalkerMobile';
        this._jumpButton.className = 'exitWalkerMobileButton';
        this._jumpButtonCont.style.display = 'table';
        this._jumpButtonCont.style.right = '0';
        this._jumpButtonCont.style.left = 'auto';
    }
}

export default WalkerTouchControls;
