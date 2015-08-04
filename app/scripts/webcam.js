var webcam = (function(){

    var video = {};
    var callbackList = [];
    var loaded;
    //init();

    return {
        getVideoUri: getVideoUri
    }


    function getVideoUri(cb) {
        callbackList.push(cb);
        if(loaded){
            doCallback();
        }
    }


    function init() {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia || navigator.oGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true}, handleVideo, videoError);
        }
    }

    function handleVideo(stream) {
        // if found attach feed to video element
        loaded = true;
        video.src = window.URL.createObjectURL(stream);
        doCallback();
    }

    function doCallback() {
        var len = callbackList.length,
            i;

        for (i=0; i < len; i++) {
            console.log(video.src);
            callbackList[i](video.src);
        }
        callbackList = [];
    }

    function videoError(e) {
        console.error('no webcam were found');
    }

})();