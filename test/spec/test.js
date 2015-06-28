/* global CoreManager */
(function () {
  'use strict';
  var CANVAS_ID = 'canvas_board';
  var CANVAS_WIDTH = 640;
  var CANVAS_HEIGHT = 480;
  var coreManager = new CoreManager();

  describe('Core Manager', function () {
    describe('#init(canvasId)', function () {

        before(function(){
            var canvas = document.createElement('CANVAS');
            canvas.setAttribute('id', CANVAS_ID);
            canvas.setAttribute('width', CANVAS_WIDTH);
            canvas.setAttribute('height', CANVAS_HEIGHT);
            document.body.appendChild(canvas);
            coreManager.init(CANVAS_ID);
        });

        it('should have a Canvas dom element', function () {
            var canvasEl = document.getElementById(CANVAS_ID);
            expect(coreManager.canvasEl).to.equal(canvasEl);
        });

        it('should have a Canvas context', function () {
            var canvasEl = document.getElementById(CANVAS_ID);
            var ctx = canvasEl.getContext('2d');
            expect(coreManager.ctx).to.equal(ctx);
        });
    });
  });
})();
