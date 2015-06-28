/* global Phaser */

(function (window, Phaser) {
    'use strict';
    /**
     * TouchControl Plugin for Phaser
     */

    Phaser.Plugin.TouchControl = function (game, parent) {
        /* Extend the plugin */
        Phaser.Plugin.call(this, game, parent);

        this.isInTheZone = isInsideTheZone.bind(this);

        this.input = this.game.input;
        this.imageGroup = [];

        this.imageGroup.push(this.game.add.sprite(0, 0, 'compass'));
        this.imageGroup.push(this.game.add.sprite(0, 0, 'touch_segment'));
        this.imageGroup.push(this.game.add.sprite(0, 0, 'touch_segment'));
        this.imageGroup.push(this.game.add.sprite(0, 0, 'touch'));

        this.imageGroup.forEach(function (e) {
            e.anchor.set(0.5);
            e.visible = false;
            e.fixedToCamera = true;
        });
    };

    //Extends the Phaser.Plugin template, setting up values we need
    Phaser.Plugin.TouchControl.prototype = Object.create(Phaser.Plugin.prototype);
    Phaser.Plugin.TouchControl.prototype.constructor = Phaser.Plugin.TouchControl;

    Phaser.Plugin.TouchControl.prototype.settings = {
        // max distance from initial touch
        maxDistanceInPixels: 200,
        singleDirection: false
    };


    Phaser.Plugin.TouchControl.prototype.cursors = {
        up: false, down: false, left: false, right: false
    };

    Phaser.Plugin.TouchControl.prototype.speed = {
        x: 0, y: 0
    };

    Phaser.Plugin.TouchControl.prototype.inputEnable = function (x1, y1, x2, y2) {
        this.zone = new Phaser.Rectangle(x1, y1, x2, y2);
        this.input.onDown.add(createCompass, this);
    };

    Phaser.Plugin.TouchControl.prototype.inputDisable = function () {
        this.input.onDown.remove(createCompass, this);
        this.input.onUp.remove(removeCompass, this);
    };

    var initialPoint;

    var isInsideTheZone = function (pointer) {
        return this.zone.contains(pointer.position.x, pointer.position.y);
    };

    var createCompass = function (pointer) {
        if (this.pointer || !this.isInTheZone(pointer)) {
            return;
        }

        this.pointer = pointer;

        this.imageGroup.forEach(function (e) {
            e.visible = true;
            e.bringToTop();

            e.cameraOffset.x = pointer.x;
            e.cameraOffset.y = pointer.y;

        }, this);

        this.preUpdate = setDirection.bind(this);

        initialPoint = this.input.activePointer.position.clone();
    };
    var removeCompass = function () {
        this.imageGroup.forEach(function (e) {
            e.visible = false;
        });

        this.cursors.up = false;
        this.cursors.down = false;
        this.cursors.left = false;
        this.cursors.right = false;

        this.speed.x = 0;
        this.speed.y = 0;

        this.preUpdate = empty;
        this.pointer = null;
    };

    var empty = function () {
    };

    var setDirection = function () {
        if (!this.isInTheZone(this.pointer)) {
            return;
        }

        if (!this.pointer.active) {
            removeCompass.bind(this)();
            return;
        }

        var d = initialPoint.distance(this.pointer.position);
        var maxDistanceInPixels = this.settings.maxDistanceInPixels;

        var deltaX = this.pointer.position.x - initialPoint.x;
        var deltaY = this.pointer.position.y - initialPoint.y;

        if (this.settings.singleDirection) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                deltaY = 0;
                this.pointer.position.y = initialPoint.y;
            } else {
                deltaX = 0;
                this.pointer.position.x = initialPoint.x;
            }
        }
        var angle = initialPoint.angle(this.pointer.position);


        if (d > maxDistanceInPixels) {
            deltaX = Math.cos(angle) * maxDistanceInPixels;
            deltaY = Math.sin(angle) * maxDistanceInPixels;
        }

        this.speed.x = parseInt((deltaX / maxDistanceInPixels) * 100 * -1, 10);
        this.speed.y = parseInt((deltaY / maxDistanceInPixels) * 100 * -1, 10);


        this.cursors.up = (deltaY < 0);
        this.cursors.down = (deltaY > 0);
        this.cursors.left = (deltaX < 0);
        this.cursors.right = (deltaX > 0);

        this.imageGroup.forEach(function (e, i) {
            e.cameraOffset.x = initialPoint.x + (deltaX) * i / 3;
            e.cameraOffset.y = initialPoint.y + (deltaY) * i / 3;
        }, this);

    };

    Phaser.Plugin.TouchControl.prototype.preUpdate = empty;


}(window, Phaser));