var DEBUG = true,  //for JSARToolKit built-in debugging info
    threshold = 128,
    markerScale = 120;

function checkWebGl() {
    if (!Detector.webgl) {
        $('div').remove();
        Detector.addGetWebGLMessage();
        throw new Error('Your browser does not seem to support WebGL');
    }
}

THREE.Matrix4.prototype.setFromArray = function (m) {
    return this.set(
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    );
};

function copyMarkerMatrix(arMat, glMat) {
    glMat[0] = arMat.m00;
    glMat[1] = -arMat.m10;
    glMat[2] = arMat.m20;
    glMat[3] = 0;
    glMat[4] = arMat.m01;
    glMat[5] = -arMat.m11;
    glMat[6] = arMat.m21;
    glMat[7] = 0;
    glMat[8] = -arMat.m02;
    glMat[9] = arMat.m12;
    glMat[10] = -arMat.m22;
    glMat[11] = 0;
    glMat[12] = arMat.m03;
    glMat[13] = -arMat.m13;
    glMat[14] = arMat.m23;
    glMat[15] = 1;
}

function showChildren(object3d, visible) {
    var children = object3d.children,
        i,
        len;
    for (i = 0, len = children.length; i < len; i++) {
        if (children[i] instanceof THREE.Mesh) {
            children[i].visible = visible;
        }
    }
}

$(document).ready(function () {

    //check for WebGL
    checkWebGl();

    console.log('Document is ready.');

    $('#thresholdInput').bind('input', function () {
        threshold = $(this).val();
        console.log('threshold = ' + threshold);
    });

    var canvas = $('#mainCanvas')[0],
        canvasWidth = canvas.width,
        canvasHeight = canvas.height,
        video = $('#mainVideo')[0],
        img = $('#mainImage')[0],
        source,
        sourceId = 0;

    if (sourceId === 0) {
        video.src = '/assets/markers/jsartoolkit/output_4.ogg';
        source = video;
    } else if (sourceId === 1) {
        video.src = '/assets/markers/jsartoolkit/swap_loop.ogg';
        source = video;
    } else if (sourceId === 2) {
        img.src = '/assets/markers/jsartoolkit/chalk_multi.jpg';
        source = img;
    }

    var raster = new NyARRgbRaster_Canvas2D(canvas),
        param = new FLARParam(canvasWidth, canvasHeight),
        detector = new FLARMultiIdMarkerDetector(param, markerScale);

    detector.setContinueMode(true);

    //===================================================
    // INIT THREE.JS
    //===================================================

    var renderer = new THREE.WebGLRenderer({
        antialias : true
    });
    renderer.setSize(canvasWidth, canvasHeight);

    var $threejsContainerElem = $('#threejs-container'),
        scene = new THREE.Scene(),
        camera = new THREE.Camera(),
        tmp = new Float32Array(16),
        videoTex,
        geometry,
        material,
        plane,
        videoScene,
        videoCam;

    $threejsContainerElem.append(renderer.domElement);


    param.copyCameraMatrix(tmp, 10, 10000);
    camera.projectionMatrix.setFromArray(tmp);

    videoTex = new THREE.Texture(canvas);
    geometry = new THREE.PlaneGeometry(2, 2);
    material = new THREE.MeshBasicMaterial({
        map : videoTex,
        depthTest : false,
        depthWrite : false
    });
    plane = new THREE.Mesh(geometry, material);
    videoScene = new THREE.Scene();
    videoCam = new THREE.Camera();
    videoScene.add(plane);
    videoScene.add(videoCam);

    //===================================================
    // STATS
    //===================================================

    //create a stats monitor
    var stats = new Stats();
    $threejsContainerElem.append(stats.domElement);

    //===================================================
    // LOOP
    //===================================================

    var resultMat = new NyARTransMatResult(),
        markerRoots = {},
        markers = {},
        ctx = canvas.getContext('2d');

    function loop() {

        if (source instanceof HTMLImageElement || (source instanceof HTMLVideoElement && source.readyState === source.HAVE_ENOUGH_DATA)) {

            ctx.drawImage(source, 0, 0, canvasWidth, canvasHeight);
            canvas.changed = true;
            videoTex.needsUpdate = true;

            Object.keys(markerRoots).forEach(function (key) {
                showChildren(markerRoots[key], false);
            });

            var markerCount = detector.detectMarkerLite(raster, threshold),
                i,
                j;
            for (i = 0; i < markerCount; i++) {

                var id = detector.getIdMarkerData(i),
                    currId = -1,
                    markerRoot;
                if (id.packetLength <= 4) {
                    currId = 0;
                    for (j = 0; j < id.packetLength; j++) {
                        currId = (currId << 8) | id.getPacketData(j);
                    }
                }

                markerRoot = objectGenerator(currId);
                scene.add(markerRoot);

                detector.getTransformMatrix(i, resultMat);
                copyMarkerMatrix(resultMat, tmp);
                markerRoots[currId].matrix.setFromArray(tmp);
                markerRoots[currId].matrixWorldNeedsUpdate = true;
                showChildren(markerRoots[currId], true);
            }

            //render
            renderer.autoClear = false;
            renderer.clear();
            renderer.render(videoScene, videoCam);
            renderer.render(scene, camera);

            //update stats
            stats.update();
        }
        requestAnimationFrame(loop);
    }

    function objectGenerator(idObject) {
        // If this is a new id, let's start tracking it.
        if (typeof markers[idObject] === 'undefined') {

            //create new object for the marker
            markers[idObject] = {};
            var markerRoot, obj;
            //create a new Three.js object as marker root
            markerRoot = new THREE.Object3D();
            markerRoot.matrixAutoUpdate = false;
            markerRoots[idObject] = markerRoot;

            obj = objectMarker[idObject]();
            markerRoot.add(obj);
            return markerRoot;
        }
    }

    var objectMarker = {
        22: function(){
            return getCube();
        },
        63: function(){
            return getCube();
        },
        64: function(){
            return getCube();
        },
        81: function(){
            return getCube();
        }
    }

    function getCube() {
        var cube = new THREE.Mesh(
                new THREE.CubeGeometry(120, 120, 120),
                new THREE.MeshNormalMaterial({color: 0xff00ff, side: THREE.BackSide, wireframe: false})
            );
        cube.position.z = -60;
        return cube;
    }
    loop();
});