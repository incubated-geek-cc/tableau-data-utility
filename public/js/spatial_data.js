window.onload = function(e) {
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

	var mapContainer=document.getElementById("map");
	var inputMapUrl=document.getElementById("inputMapUrl");
	var changeBasemapBtn=document.getElementById("changeBasemapBtn");
	var resetMapBtn=document.getElementById("resetMapBtn");
	var imgBounds_Left=document.getElementById("imgBounds_Left");
	var imgBounds_Right=document.getElementById("imgBounds_Right");
	var imgBounds_Bottom=document.getElementById("imgBounds_Bottom");
	var imgBounds_Top=document.getElementById("imgBounds_Top");

	var uploadGeoJsonFile = document.getElementById("uploadGeoJsonFile");
	var exportCSVOutputBtn = document.getElementById("exportCSVOutputBtn");
	var exportMapImageBtn = document.getElementById("exportMapImageBtn");
	var uploadProgress= document.getElementById("uploadProgress");
	var progressBar=uploadProgress.getElementsByClassName("progress-bar")[0];
	var errorMsg=document.getElementById("errorMsg");
	var successMsg=document.getElementById("successMsg");

	var uploadSpatialFile = document.getElementById("uploadSpatialFile");
	var exportGeojsonOutputBtn = document.getElementById("exportGeojsonOutputBtn");

	var uploadSpatialFileIs=null;

	var outputTypes = document.getElementsByClassName("outputType");
	var outputType="SHP";

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
        if (!window.FileReader) {
            alert("Your browser does not support HTML5 'FileReader' function required to open a file.");
        } else {
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
        }
	};

	exportGeojsonOutputBtn.onclick = function(e) {
		var toOutput="";
		switch(outputType) {
			case "SHP":
				shp(uploadSpatialFileIs).then(function(geojson){
				  	toOutput=JSON.stringify(geojson);
				  	if (!window.Blob) {
		                alert("Your browser does not support HTML5 'Blob' function required to save a file.");
		            } else {
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
		            } 	
				});
				break;
			case "KML":
				toOutput=JSON.stringify(KMLStrtoGeoJSON(uploadSpatialFileIs));
				if (!window.Blob) {
	                alert("Your browser does not support HTML5 'Blob' function required to save a file.");
	            } else {
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
	            } 
				break;
		}
	};
	

	var scale = 'scale(0.8)';
	mapContainer.style.webkitTransform =  scale; // Chrome, Opera, Safari
	mapContainer.style.msTransform =   scale; // IE 9
	mapContainer.style.transform = scale; // General

	var errorMsgArr=[];
	var imgBounds=null;

	var initialMapUrl="https://stamen-tiles.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png";
	var initialZoom=12;
	var initialView=[1.3521,103.8198];

	var mapUrl="https://stamen-tiles.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png";
	inputMapUrl.value=mapUrl;
		var map = L.map("map");
		var basemap=L.tileLayer(mapUrl, {
        detectRetina: true,
        maxZoom: 19,
        minZoom: 11,
        attributionControl: false
  	}).addTo(map);
	map.setZoom(initialZoom);
	map.setView(initialView);

	map.on("zoomend", function(e) {
		renderImageBounds();
	});
	map.on("dragend", function(e) {
  		renderImageBounds();
	});
	map.on("viewreset", function(e) {
  		renderImageBounds();
	});
	map.on("moveend", function(e) {
  		renderImageBounds();
	});
	map.on("load", function(e) {
  		renderImageBounds();
	});
	map.on("resize", function(e) {
  		renderImageBounds();
	});
	
	function resetMapView() {
		map.setZoom(initialZoom);
  		map.setView(initialView);
  		renderImageBounds();
	}

	function renderImageBounds() {
		imgBounds=map.getBounds();
    	imgBounds_Left.innerHTML=imgBounds._southWest.lng;
		imgBounds_Right.innerHTML=imgBounds._northEast.lng;

		imgBounds_Bottom.innerHTML=imgBounds._southWest.lat;
		imgBounds_Top.innerHTML=imgBounds._northEast.lat;
	}
	
	resetMapBtn.onclick = function(e) {
		basemap.setUrl(initialMapUrl);
		resetMapView();
	};

	changeBasemapBtn.onclick = function(e) {
		let newMapUrl=inputMapUrl.value;
		mapUrl=newMapUrl;
		basemap.setUrl(mapUrl);
	};
	
	uploadGeoJsonFile.onclick = function(e) {
		successMsg.innerHTML="";
		errorMsg.innerHTML="";
		e.target.value = "";
	}

	uploadGeoJsonFile.onchange = function(e) {
		successMsg.innerHTML="";
		errorMsg.innerHTML="";
		uploadedGeojsonObj=null;
		errorMsgArr=[];
		exportCSVOutputBtn.disabled=true;
		resetProgressBar();

		if(e.target.value !== "" && e.target.files.length>0) {
        	loadProgressBar();

            let fileName = e.target.value;
            fileName = fileName.split("\\")[2];
            let n = fileName.lastIndexOf(".");
            fileName = fileName.substring(0,n);
            
            exportCSVOutputBtn.value = fileName;
			 
            if (!window.FileReader) {
                alert("Your browser does not support HTML5 'FileReader' function required to open a file.");
            } else {
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
						exportCSVOutputBtn.disabled=false;
						successMsg.innerHTML = "✓ File is uploaded successfully.";
					}

					displayErrorMsg();
                };
                fileredr.readAsText(fileis);
            }
        }
    }; // new file input

	function deepCopyObj(obj) {
		let resultObj={};
		for(let o in obj) {
			resultObj[o]=obj[o];
		}
		return resultObj;
	}

	exportCSVOutputBtn.onclick = function(e) {
		resetProgressBar();
    	loadProgressBar();

		var features = uploadedGeojsonObj["features"];
		var outputJSONObj = [];		

		for(var f in features) {
			var feature = features[f];
			var ptOrder = 0;
			var outputJSONObjRecord = {};
			
			if(Object.keys(feature).includes("type") && Object.keys(feature).includes("geometry")) {
				if(feature["type"]=="Feature" && Object.keys(feature["geometry"]).includes("type") && Object.keys(feature["geometry"]).includes("coordinates")) {
					var properties = feature["properties"];
					if(typeof properties !== "undefined") {
						for(var p in properties) {
							outputJSONObjRecord[p]=properties[p]; // property key --> property value
						}
					}
					var geometry = feature["geometry"];
					var geometryType = geometry["type"];
					var coordinates = geometry["coordinates"];

					if(geometryType == "Polygon") {
						coordinates = coordinates[0];
						for(var c in coordinates) {
							var latlng = coordinates[c];
							var lat = latlng[1];
							var lng = latlng[0];

							var outputJSONObjRecord_Copy = deepCopyObj(outputJSONObjRecord);

							outputJSONObjRecord_Copy["Feature ID (polygons)"]=f;
							outputJSONObjRecord_Copy["Sub Feature ID (polygons)"]=f;
							outputJSONObjRecord_Copy["Geometry Type"]=geometryType;
							outputJSONObjRecord_Copy["Point Order (polygons)"]=ptOrder++;
							outputJSONObjRecord_Copy["X"]=parseFloat(lng);
							outputJSONObjRecord_Copy["Y"]=parseFloat(lat);

							outputJSONObj.push(outputJSONObjRecord_Copy);
						}
					} else if(geometryType == "MultiPolygon") {
						for(var i in coordinates) {
							var polycoordinates = coordinates[i];
							polycoordinates = polycoordinates[0];
						
							for(var c in polycoordinates) {
								var latlng = polycoordinates[c];
								var lat = latlng[1];
								var lng = latlng[0];

								var outputJSONObjRecord_Copy = deepCopyObj(outputJSONObjRecord);

								outputJSONObjRecord_Copy["Feature ID (polygons)"]=f;
								outputJSONObjRecord_Copy["Sub Feature ID (polygons)"]=i;
								outputJSONObjRecord_Copy["Geometry Type"]=geometryType;
								outputJSONObjRecord_Copy["Point Order (polygons)"]=ptOrder++;
								outputJSONObjRecord_Copy["X"]=parseFloat(lng);
								outputJSONObjRecord_Copy["Y"]=parseFloat(lat);

								outputJSONObj.push(outputJSONObjRecord_Copy);
							}
						}
					} else if(geometryType == "Point") {
						var latlng = coordinates;
						var lat = latlng[1];
						var lng = latlng[0];

						var outputJSONObjRecord_Copy = deepCopyObj(outputJSONObjRecord);

						outputJSONObjRecord_Copy["Feature ID (points+lines)"]=f;
						outputJSONObjRecord_Copy["Sub Feature ID (points+lines)"]=f;
						outputJSONObjRecord_Copy["Geometry Type"]=geometryType;
						outputJSONObjRecord_Copy["Point Order (points+lines)"]=ptOrder++;
						outputJSONObjRecord_Copy["X"]=parseFloat(lng);
						outputJSONObjRecord_Copy["Y"]=parseFloat(lat);

						outputJSONObj.push(outputJSONObjRecord_Copy);
					} else if(geometryType == "MultiPoint") {
						for(var i in coordinates) {
							var polycoordinates = coordinates[i];
							var latlng = polycoordinates;
							var lat = latlng[1];
							var lng = latlng[0];

							var outputJSONObjRecord_Copy = deepCopyObj(outputJSONObjRecord);

							outputJSONObjRecord_Copy["Feature ID (points+lines)"]=f;
							outputJSONObjRecord_Copy["Sub Feature ID (points+lines)"]=i;
							outputJSONObjRecord_Copy["Geometry Type"]=geometryType;
							outputJSONObjRecord_Copy["Point Order (points+lines)"]=ptOrder++;
							outputJSONObjRecord_Copy["X"]=parseFloat(lng);
							outputJSONObjRecord_Copy["Y"]=parseFloat(lat);

							outputJSONObj.push(outputJSONObjRecord_Copy);
						}
					} else if(geometryType == "LineString") {	
						for(var c in coordinates) {
							var latlng = coordinates[c];
							var lat = latlng[1];
							var lng = latlng[0];

							var outputJSONObjRecord_Copy = deepCopyObj(outputJSONObjRecord);

							outputJSONObjRecord_Copy["Feature ID (points+lines)"]=f;
							outputJSONObjRecord_Copy["Sub Feature ID (points+lines)"]=f;
							outputJSONObjRecord_Copy["Geometry Type"]=geometryType;
							outputJSONObjRecord_Copy["Point Order (points+lines)"]=ptOrder++;
							outputJSONObjRecord_Copy["X"]=parseFloat(lng);
							outputJSONObjRecord_Copy["Y"]=parseFloat(lat);

							outputJSONObj.push(outputJSONObjRecord_Copy);
						}
					} else if(geometryType == "MultiLineString") {
						for(var i in coordinates) {
							var polycoordinates = coordinates[i];	
							for(var c in polycoordinates) {
								var latlng = polycoordinates[c];
								var lat = latlng[1];
								var lng = latlng[0];

								var outputJSONObjRecord_Copy = deepCopyObj(outputJSONObjRecord);

								outputJSONObjRecord_Copy["Feature ID (points+lines)"]=f;
								outputJSONObjRecord_Copy["Sub Feature ID (points+lines)"]=i;
								outputJSONObjRecord_Copy["Geometry Type"]=geometryType;
								outputJSONObjRecord_Copy["Point Order (points+lines)"]=ptOrder++;
								outputJSONObjRecord_Copy["X"]=parseFloat(lng);
								outputJSONObjRecord_Copy["Y"]=parseFloat(lat);

								outputJSONObj.push(outputJSONObjRecord_Copy);
							}
						}
					}
				} // ensure feature objects are being read
			} // ensure it's a feature-type
		} // end-for-loop per feature


		converter.json2csvAsync(outputJSONObj, {
            prependHeader: true,
            sortHeader: true,
            trimFieldValues: true,
            trimHeaderFields: true,
            emptyFieldValue: "",
            delimiter: {
                field: ",",
                wrap: "\"",
                eol: "\n"
            }
        })
        .then((csvDataOutput) => {
        	resetProgressBar();

            if (!window.Blob) {
                alert("Your browser does not support HTML5 'Blob' function required to save a file.");
            } else {
                let textblob = new Blob([csvDataOutput], {
                    type: "text/plain"
                });
                let dwnlnk = document.createElement("a");
                dwnlnk.download = exportCSVOutputBtn.value + ".csv";
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
            }
        })
        .catch((err) => {
        	console.log('ERROR: ' + err.message);
        	resetProgressBar();
        });
	}; // exportCSVOutBtn Function

	exportMapImageBtn.onclick = function(e) {
      	const createMapImage = async () => {
        const width = mapContainer.offsetWidth;
        const height = mapContainer.offsetHeight;
        
        const copiedMapElement = document.createElement("div");
        copiedMapElement.style.width = `${width}px`;
        copiedMapElement.style.height = `${height}px`;
        document.body.appendChild(copiedMapElement);

        const copiedMap = L.map(copiedMapElement, {
          attributionControl: false,
          zoomControl: false,
          fadeAnimation: false,
          zoomAnimation: false
        }).setView([map.getCenter().lat,map.getCenter().lng], map.getZoom());
       
        const tileLayer = L.tileLayer(mapUrl).addTo(copiedMap);

        await new Promise(resolve => tileLayer.on("load", () => resolve()));
        const dataURL = await domtoimage.toPng(copiedMapElement, { width, height });
        document.body.removeChild(copiedMapElement);
        
        renderImageBounds();

        if (!window.Blob) {
            alert("Your browser does not support HTML5 'Blob' function required to save a file.");
        } else {
            let dwnlnk = document.createElement("a");
            dwnlnk.download = "map.png";
            dwnlnk.innerHTML = "Download File";
            dwnlnk.href = dataURL;
            dwnlnk.style.display = "none";
            document.body.appendChild(dwnlnk);
            dwnlnk.click();
        }
      };
      createMapImage();
  	};


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
			exportCSVOutputBtn.disabled=true;
		}
		errorMsg.innerHTML=errorMsgHtmlStr;
	}
};