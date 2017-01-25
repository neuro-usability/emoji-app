var flkty;
var input = document.getElementById("message-input");
var emojiList = ["😂", "😂", "😁", "😄", "😍"];

makeEmojiClickable();
setTimeout(function() {
  onStart();
  getPredictedEmoji();
}, 2000);

window.onload = function() {
  flkty = new Flickity('.carousel', {
    pageDots: false,
    setGallerySize: false,
    prevNextButtons: false,
    selectedAttraction: 0.15,
    friction: 0.8
  });
};

function getPredictedEmoji() {
  setTimeout(function() {
    console.log("getting new emoji!");
    console.log("sending this:", window.currentDataObject);
    emojiRequest();
    getPredictedEmoji();
  }, 2000);
}

function emojiRequest() {
  var urlAPI = "http://127.0.0.1:3456";
  $.ajax({
    type: "POST",
    url: urlAPI,
    data: JSON.stringify(window.currentDataObject),
    success: function(stringData) {
      console.log("POST request successful");
      serverData = JSON.parse(stringData);
      console.log("predicted emoji:", serverData);
      // API returns a list of strings with emoji names, get the actual emoji from list
      for (var i = 0; i < serverData.length; i++) {
        emojiList[i] = emojiMapping[serverData[i]];
      }
      console.log("new emoji list:", emojiList);
      updateEmoji(emojiList);
    },
    error: function(err) {
      console.log("POST request failed");
      console.log(err);
    }
  });
}

function updateEmoji(newEmojiList) {
  $("#compose-emoji .emoji").remove();
  for (var i=0; i < newEmojiList.length; i++) {
    var newEmoji = document.createElement("span");
    newEmoji.className = "emoji";
    newEmoji.innerHTML = newEmojiList[i];
    $("#compose-emoji").append(newEmoji);
  }
  makeEmojiClickable();
}

function makeEmojiClickable() {
  $(".emoji").click(function () {
    $("#message-input").val($("#message-input").val() + this.innerHTML);
    focusInput();
  });
}

$(".compose-btn").click(function () {
  if (input.value !== "") {
    var newMsgRow = document.createElement("div");
    var newMsg = document.createElement("div");
    newMsgRow.className = "message-row sent";
    newMsg.className = "message";
    newMsg.innerHTML = input.value;
    newMsgRow.appendChild(newMsg);
    $(flkty.selectedElement).find(".history").append(newMsgRow);
    input.value = "";
    input.focus();
  }
});

$(".back-btn").click(function () {
  flkty.previous();
});
$(".next-btn").click(function () {
  flkty.next();
});

function focusInput() {
  input.focus();
  var tmpStr = input.value;
  input.value = "";
  input.value = tmpStr;
}


// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
var divRoot = $("#affdex_elements")[0];
var width = 320;
var height = 240;
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
//Construct a CameraDetector and specify the image width / height and face detector mode.
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

//Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();

//Add a callback to notify when the detector is initialized and ready for runing.
detector.addEventListener("onInitializeSuccess", function() {

  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");
});

function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />");
}

//function executes when Start button is pushed.
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");
    detector.start();
  }
  log('#logs', "Clicked the start button");
}

//function executes when the Stop button is pushed.
function onStop() {
  log('#logs', "Clicked the stop button");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();
  }
}

//function executes when the Reset button is pushed.
function onReset() {
  log('#logs', "Clicked the reset button");
  if (detector && detector.isRunning) {
    detector.reset();

    $('#results').html("");
  }
}

//Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

//Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

//Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
});

//Add a callback to receive the results from processing an image.
//The faces object contains the list of the faces detected in an image.
//Faces object contains probabilities for all the different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  $('#results').html("");
  log('#results', "Timestamp: " + timestamp.toFixed(2));
  log('#results', "Number of faces found: " + faces.length);
  if (faces.length > 0) {
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
    log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
    drawFeaturePoints(image, faces[0].featurePoints);
  }
});

//Draw the detected facial feature points on the image
function drawFeaturePoints(img, featurePoints) {
  var contxt = $('#face_video_canvas')[0].getContext('2d');

  var hRatio = contxt.canvas.width / img.width;
  var vRatio = contxt.canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);

  contxt.strokeStyle = "#FFFFFF";
  for (var id in featurePoints) {
    contxt.beginPath();
    contxt.arc(featurePoints[id].x,
      featurePoints[id].y, 2, 0, 2 * Math.PI);
    contxt.stroke();

  }
}

console.save = function(data, filename){

    if(!data) {
        console.error('Console.save: No data');
        return;
    }

    if(!filename) filename = 'console.json';

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4);
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a');

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
 };

 var emojiMapping = {
   "joy": "😂",
   "unanmused": "😒",
   "heart-eyes": "😍",
   "relaxed": "😌",
   "kissing-heart": "😘",
   "blush": "😊",
   "pensive":"😔",
   "weary": "😩",
   "sob": "😭",
   "smirk": "😏",
   "grin": "😁",
   "flushed": "😳",
   "wink": "😉",
   "rage": "😡",
   "scream": "😱",
   "kiss": "💋",
   "stuckout-tongue-eyes-closed": "😝",
   "tongue": "👅",
   "mouth": "👄",
   "stuckout-tongue": "😛",
   "relieved": "😌",
   "expressionless": "😑",
   "yum": "😋",
   "stuckout-tongue-winking-eye": "😜",
   "disappointed": "😞",
   "smile": "😄",
   "sleeping": "😴",
   "neutral-face": "😐",
   "sweat-smile": "😅",
   "smiley": "😃",
   "angry": "😠",
   "grimacing": "😬",
   "laughing": "😆",
   "kissing-closed-eyes": "😚",
   "grinning": "😀"
 };

//  var testdata =
//  {
//    "emotions": {
//        "joy": 0.0018109878292307258,
//        "sadness": 0.005754591431468725,
//        "disgust": 0.002205597935244441,
//        "contempt": 98.73298645019531,
//        "anger": 0.06215667352080345,
//        "fear": 0.004856272600591183,
//        "surprise": 0.20701992511749268,
//        "valence": -38.08766555786133,
//        "engagement": 20.26823616027832
//    },
//    "expressions": {
//        "smile": 0.000023030233933241107,
//        "innerBrowRaise": 1.9380459785461426,
//        "browRaise": 0.2859000265598297,
//        "browFurrow": 0.00969726126641035,
//        "noseWrinkle": 0.00043722306145355105,
//        "upperLipRaise": 0.00004210080442135222,
//        "lipCornerDepressor": 0.000513893086463213,
//        "chinRaise": 31.874370574951172,
//        "lipPucker": 0.03352072834968567,
//        "lipPress": 12.595565795898438,
//        "lipSuck": 80.53952026367188,
//        "mouthOpen": 0.0023829129058867693,
//        "smirk": 99.81714630126953,
//        "eyeClosure": 0.0003859243879560381,
//        "attention": 95.13105773925781,
//        "lidTighten": 0.017757877707481384,
//        "jawDrop": 0.0011974868830293417,
//        "dimpler": 31.39752769470215,
//        "eyeWiden": 40.02793502807617,
//        "cheekRaise": 0.0001795788703020662,
//        "lipStretch": 0.20892594754695892
//    },
//    "emojis": {
//        "relaxed": 0.0018055122345685959,
//        "smiley": 0.0018051115330308676,
//        "laughing": 0.0014010759769007564,
//        "kissing": 0.001852858462370932,
//        "disappointed": 0.0018292107852175832,
//        "rage": 0.06215667352080345,
//        "smirk": 98.59152221679688,
//        "wink": 0.00214673625305295,
//        "stuckOutTongueWinkingEye": 2.2977633476257324,
//        "stuckOutTongue": 2.2977633476257324,
//        "flushed": 0.0019499057671055198,
//        "scream": 0.02797398529946804,
//        "dominantEmoji": "😏"
//    },
//    "measurements": {
//        "interocularDistance": 44.49846649169922,
//        "orientation": {
//            "pitch": 4.5839385986328125,
//            "yaw": -7.138108253479004,
//            "roll": -5.156097888946533
//        }
//    }
// };
