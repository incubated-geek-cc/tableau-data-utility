document.addEventListener('DOMContentLoaded', async()=> {
	if (!window.Blob) {
        alert("Your browser does not support HTML5 'Blob' function required to save a file.");
        return;
    } 
    if (!window.FileReader) {
        alert("Your browser does not support HTML5 'FileReader' function required to open a file.");
        return;
    }
	var popoverTargets = document.querySelectorAll("[data-content]");

	Array.from(popoverTargets).map(
	  popTarget => new BSN.Popover(popTarget, {
	    placement: "right",
	    animation: "show",
	    delay: 100,
	    dismissible: true,
	    trigger: "click"
	  })
	);

	var uploadedGeojsonObj=null;
	var progress=0;
	var t=null;

	var uploadProgress= document.getElementById("uploadProgress");
	var progressBar=uploadProgress.getElementsByClassName("progress-bar")[0];
	var errorMsg=document.getElementById("errorMsg");
	var successMsg=document.getElementById("successMsg");

	var uploadGeoJsonFile = document.getElementById("uploadGeoJsonFile");
	var exportGeojsonHexMapOutputBtn = document.getElementById("exportGeojsonHexMapOutputBtn");

	var uploadSpatialFile = document.getElementById("uploadSpatialFile");
	var exportGeojsonOutputBtn = document.getElementById("exportGeojsonOutputBtn");

	var uploadSpatialFileIs=null;

	var outputTypes = document.getElementsByClassName("outputType");
	var outputType="SHP";

	var hextileShapeWidth =  document.getElementById("hextileShapeWidth");
	var hextileShapeWidthValue = document.getElementById("hextileShapeWidthValue");

	hextileShapeWidth.oninput = function(e) {
		hextileShapeWidthValue.innerHTML=this.value;
	};

	function checkOutputType() {
		for(var o in outputTypes) {
			if(outputTypes[o].checked) {
				outputType = outputTypes[o].value;
			}
		}
	}

	uploadSpatialFile.onchange = function(e) {
		checkOutputType();

		let fileName = e.target.value;
        fileName = fileName.split("\\")[2];
        let n = fileName.lastIndexOf(".");
        fileName = fileName.substring(0,n);
        
        exportGeojsonOutputBtn.value = fileName;
		exportGeojsonOutputBtn.disabled=true;
        var fileis = uploadSpatialFile.files[0];
        var fileredr = new FileReader();
        fileredr.onload = function (fle) {
            var filecont = fle.target.result;
           	uploadSpatialFileIs=filecont;
			exportGeojsonOutputBtn.disabled=false;
        };
        if(outputType=="SHP") {
        	fileredr.readAsArrayBuffer(fileis);
        } else if(outputType=="KML") {
        	fileredr.readAsText(fileis);
        }
	};

	exportGeojsonOutputBtn.onclick = function(e) {
		var toOutput="";
		switch(outputType) {
			case "SHP":
				shp(uploadSpatialFileIs).then(function(geojson){
				  	toOutput=JSON.stringify(geojson);
	                let textblob = new Blob([toOutput], {
	                    type: "text/plain"
	                });
	                let dwnlnk = document.createElement("a");
	                dwnlnk.download = exportGeojsonOutputBtn.value + ".geojson";
	                dwnlnk.innerHTML = "Download File";
	                if (window.webkitURL != null) {
	                    dwnlnk.href = window.webkitURL.createObjectURL(textblob);
	                } else {
	                    dwnlnk.href = window.URL.createObjectURL(textblob);
	                }
	                dwnlnk.click();
				});
				break;
			case "KML":
				toOutput=JSON.stringify(KMLStrtoGeoJSON(uploadSpatialFileIs));
                let textblob = new Blob([toOutput], {
                    type: "text/plain"
                });
                let dwnlnk = document.createElement("a");
                dwnlnk.download = exportGeojsonOutputBtn.value + ".geojson";
                dwnlnk.innerHTML = "Download File";
                if (window.webkitURL != null) {
                    dwnlnk.href = window.webkitURL.createObjectURL(textblob);
                } else {
                    dwnlnk.href = window.URL.createObjectURL(textblob);
                    dwnlnk.onclick = destce;
                    dwnlnk.style.display = "none";
                    document.body.appendChild(dwnlnk);
                }
                dwnlnk.click();
				break;
		}
	};

	var errorMsgArr=[];
	uploadGeoJsonFile.onclick = function(e) {
		successMsg.innerHTML="";
		errorMsg.innerHTML="";
		e.target.value = "";
	};

	uploadGeoJsonFile.onchange = function(e) {
		successMsg.innerHTML="";
		errorMsg.innerHTML="";
		uploadedGeojsonObj=null;
		errorMsgArr=[];
		exportGeojsonHexMapOutputBtn.disabled=true;
		resetProgressBar();

		if(e.target.value !== "" && e.target.files.length>0) {
        	loadProgressBar();

            let fileName = e.target.value;
            fileName = fileName.split("\\")[2];
            let n = fileName.lastIndexOf(".");
            fileName = fileName.substring(0,n);
            
            exportGeojsonHexMapOutputBtn.value = fileName;
			 
            var fileis = uploadGeoJsonFile.files[0];
            var fileredr = new FileReader();
            fileredr.onload = function (fle) {
                var filecont = fle.target.result;
                var invalidFormat=false;
                var errors = geojsonhint.hint(filecont, {
				    precisionWarning: false,
				    noDuplicateMembers: true
				});

                for(var e in errors) {
                	var msg=errors[e]["error"];
                	if(typeof msg !== "undefined") {
                		errorMsgArr.push(msg["message"]);
                		invalidFormat=true;
                	} else if(errors[e]["message"] == "\"type\" member required") {
                		errorMsgArr.push("Invalid JSON format.");
                		invalidFormat=true;
                	}
                }
                if(!invalidFormat) {
                	if(JSON.parse(filecont)["type"] !== "FeatureCollection" || !Array.isArray(JSON.parse(filecont)["features"])) {
                		errorMsgArr.push("JSON structure must be the same as the above (i.e. A FeatureCollection object).");
						invalidFormat=true;
					}
                }
                
				if(!invalidFormat) {
					uploadedGeojsonObj = JSON.parse(filecont);
					exportGeojsonHexMapOutputBtn.disabled=false;
					successMsg.innerHTML = "✓ File is uploaded successfully.";
				}

				displayErrorMsg();
            };
            fileredr.readAsText(fileis);
        }
    }; // new file input

    function resetProgressBar() {
		progress=0;
		uploadProgress["style"]["display"]="none";
		progressBar.setAttribute("aria-valuenow", 0);
    	progressBar["style"]["width"]=0+"%";
    	progressBar.innerHTML=0+"%";
	}

	function loadProgressBar() {
		uploadProgress["style"]["display"]="block";
		t=setInterval(function() {
    		if(progress > 99) {
    			clearInterval(t);
    		} else {
    			progressBar.setAttribute("aria-valuenow", progress);
        		progressBar["style"]["width"]=progress+"%";
        		progressBar.innerHTML=progress+"%";
        		progress++;
    		}
    	}, 100);
	}

	function displayErrorMsg() {
		resetProgressBar();
		var errorMsgHtmlStr="";
		if(errorMsgArr.length>0) {
			errorMsgHtmlStr+="<ol>";
		}
		for(var e in errorMsgArr) {
			errorMsgHtmlStr+="<li>"+errorMsgArr[e]+" ✗</li>";
		}
		if(errorMsgArr.length>0) {
			errorMsgHtmlStr+="</ol>";
			exportGeojsonHexMapOutputBtn.disabled=true;
		}
		errorMsg.innerHTML=errorMsgHtmlStr;
	}

	exportGeojsonHexMapOutputBtn.onclick = function(e) {
		resetProgressBar();
    	loadProgressBar();

		var outputObj = {
	  		"type": "FeatureCollection"
	  	};	

	  	var outputShape="square_0"; // square_0 square_45 hexagon_0 hexagon_0 hexagon_90
	  	var outputShapes = document.getElementsByClassName("outputShape");

	  	for(var o in outputShapes) {
			if(outputShapes[o].checked) {
				outputShape = outputShapes[o].value;
			}
		}
	  	
	  	var shapeInput = outputShape.split("_")[0];
	  	var angleTilt = outputShape.split("_")[1];
	  	var width = hextileShapeWidthValue.innerHTML;

		var outputFeatures = hextile(uploadedGeojsonObj, {
				shape: shapeInput,
				width: parseInt(width),
				tilt: parseInt(angleTilt)
			}
		);
	
		var gFeatures = uploadedGeojsonObj["features"];

		for(var o in outputFeatures) {
			var outputFeature = outputFeatures[o];
			var center = outputFeature["properties"]["center"];
			var pt = turf.point([center[0], center[1]]); // lng,lat

			for(var g in gFeatures) {
				var gFeature=gFeatures[g];
				var properties = gFeature["properties"];
				var geometry = gFeature["geometry"];
				var geometryType = geometry["type"];
				var coordinates = geometry["coordinates"];

				if(geometryType == "Polygon") {
					var poly = turf.polygon(coordinates);
					var isInside = turf.booleanPointInPolygon(pt, poly);

					if(isInside) {
						for(var p in properties) {
							outputFeature["properties"][p]=properties[p];
						}
						break;
					}
				} else if(geometryType == "MultiPolygon") {
					var multiPoly = turf.multiPolygon(coordinates);
					var isInside = turf.booleanPointInPolygon(pt, multiPoly);

					if(isInside) {
						for(var p in properties) {
							outputFeature["properties"][p]=properties[p];
						}
						break;
					}
				}
			} // end gFeatures
		} // end outputFeatures

		outputObj["features"] = outputFeatures;

        let textblob = new Blob([JSON.stringify(outputObj)], {
            type: "text/plain"
        });
        let dwnlnk = document.createElement("a");
        dwnlnk.download = exportGeojsonHexMapOutputBtn.value + "_" + outputShape + "_" + parseInt(width) + "_hexmap.geojson";
        dwnlnk.innerHTML = "Download File";
        if (window.webkitURL != null) {
            dwnlnk.href = window.webkitURL.createObjectURL(textblob);
        }
        resetProgressBar();
        dwnlnk.click();
	}; // exportGeojsonOutputBtn Function
});