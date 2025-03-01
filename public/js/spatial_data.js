window.onload = function(e) {
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

	uploadSpatialFile.addEventListener('change', function(e) {
		checkOutputType();

		let fileName = e.target.value;
        fileName = fileName.split("\\")[2];
        let n = fileName.lastIndexOf(".");
        fileName = fileName.substring(0,n);
        
        exportGeojsonOutputBtn.value = fileName;
		exportGeojsonOutputBtn.disabled=true;
      
        let fileis = uploadSpatialFile.files[0];
        let fileredr = new FileReader();
        fileredr.onload = function (fle) {
            let filecont = fle.target.result;
           	uploadSpatialFileIs=filecont;
			exportGeojsonOutputBtn.disabled=false;
        };
        if(outputType=="SHP") {
        	fileredr.readAsArrayBuffer(fileis);
        } else if(outputType=="KML") {
        	fileredr.readAsText(fileis);
        }
	});

	exportGeojsonOutputBtn.addEventListener('click', function(e) {
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
	            }
	            dwnlnk.click();
				break;
		}
	});
	

	var scale = 'scale(0.8)';
	mapContainer.style.webkitTransform =  scale; // Chrome, Opera, Safari
	mapContainer.style.msTransform =   scale; // IE 9
	mapContainer.style.transform = scale; // General

	var errorMsgArr=[];
	var imgBounds=null;

	var initialMapUrl=document.querySelector('#initialMapUrl').innerText; // api/map_tile/aHR0cHM6Ly90aWxlLXtzfS5vcGVuc3RyZWV0bWFwLmZyL2hvdA==/{z}/{x}/{y}.png
	var initialZoom=12;
	var initialView=[1.3521,103.8198];

	var mapUrl=initialMapUrl;
	inputMapUrl.value=mapUrl;

	var ext,urlPrefix,apiBasemapUrl;

	function renderMapTiles() {
		ext=mapUrl.substr( mapUrl.lastIndexOf('.')+1 );
		urlPrefix=mapUrl.replace(`/{z}/{x}/{y}.${ext}`,'');
		urlPrefix=btoa(urlPrefix);
		apiBasemapUrl=`api/map_tile/${urlPrefix}/{z}/{x}/{y}`;
		if(ext) {
			apiBasemapUrl=`${apiBasemapUrl}.${ext}`;
		}
		console.log('renderMapTiles', apiBasemapUrl);
	}
	renderMapTiles();

	var map = L.map("map");
	var basemap=L.tileLayer(apiBasemapUrl, {
      detectRetina: true,
      maxZoom: 19,
      minZoom: 11,
      attributionControl: false
	}).addTo(map);
	map.setZoom(initialZoom);
	map.setView(initialView);

	function renderImageBounds() {
		imgBounds=map.getBounds();
    imgBounds_Left.innerHTML=imgBounds._southWest.lng;
		imgBounds_Right.innerHTML=imgBounds._northEast.lng;

		imgBounds_Bottom.innerHTML=imgBounds._southWest.lat;
		imgBounds_Top.innerHTML=imgBounds._northEast.lat;
	}

	// Binding multiple events to a single element
	function addMultipleEvents(eventsArray, targetElem, handler) {
	  eventsArray.map((event) => targetElem.on(event, handler));
	}
	addMultipleEvents(['zoomend', 'dragend', 'viewreset', 'moveend', 'load', 'resize'], map, renderImageBounds);

	function resetMapView() {
		map.setZoom(initialZoom);
		map.setView(initialView);
		renderImageBounds();
	}
	
	resetMapBtn.addEventListener('click', function(e) {
		basemap.setUrl(inputMapUrl.value);
		resetMapView();
	});
	changeBasemapBtn.addEventListener('click', function(e) {
		let newMapUrl=inputMapUrl.value;
		mapUrl=newMapUrl; // "https://stamen-tiles.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png"

		ext=mapUrl.substr( mapUrl.lastIndexOf('.')+1 );
		urlPrefix=mapUrl.replace(`/{z}/{x}/{y}.${ext}`,'');
		urlPrefix=btoa(urlPrefix);
		apiBasemapUrl=`api/map_tile/${urlPrefix}/{z}/{x}/{y}.${ext}`;
		console.log(apiBasemapUrl);
		renderMapTiles();
		basemap.setUrl(apiBasemapUrl);
	});
	uploadGeoJsonFile.addEventListener('click', function(e) {
		successMsg.innerHTML="";
		errorMsg.innerHTML="";
		e.target.value = "";
	});
	uploadGeoJsonFile.addEventListener('change', function(e) {
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
  }); // new file input

	function uncombineGeometriesInFeatureCollection(geojsonObj) {
	    let updatedGeojsonObj = {
	        "type": "FeatureCollection",
	        "features": []
	    };
	    let geojsonInputFeatures = geojsonObj["features"];
	    for (let g in geojsonInputFeatures) {
	        let geojsonInputFeature = geojsonInputFeatures[g];
	        let featureProps = geojsonInputFeature["properties"];
	        let featureGeometry = geojsonInputFeature["geometry"];
	        let featureGeometryType = featureGeometry["type"];

	        let newPropertiesObj = JSON.parse(JSON.stringify(featureProps));

	        if (featureGeometryType == "Polygon") {
	            let updatedGeojsonObjFeature = {
	                "type": "Feature",
	                "properties": newPropertiesObj,
	                "geometry": featureGeometry
	            }
	            updatedGeojsonObj["features"].push(updatedGeojsonObjFeature);
	        } else if (featureGeometryType == "MultiPolygon") {
	            let multiPolyCoords = featureGeometry["coordinates"];
	            for (let m1 in multiPolyCoords) {
	                for (let m2 in multiPolyCoords[m1]) {
	                    let polyCoords = [multiPolyCoords[m1][m2]];
	                    let updatedGeojsonObjFeature = {
	                        "type": "Feature",
	                        "properties": newPropertiesObj,
	                        "geometry": {
	                            "type": "Polygon",
	                            "coordinates": polyCoords
	                        }
	                    }
	                    updatedGeojsonObj["features"].push(updatedGeojsonObjFeature);
	                }
	            }
	        } else if (featureGeometryType == "GeometryCollection") {
	            let geometriesArr = featureGeometry["geometries"];
	            for (let g2 in geometriesArr) {
	                let geometrySubObj = geometriesArr[g2];
	                let geometrySubObjGeometry = geometrySubObj["geometry"];

	                if (typeof geometrySubObjGeometry !== "undefined") {

	                    let geometrySubType = geometrySubObjGeometry["type"];
	                    if (geometrySubType == "Polygon") {
	                        let polyCoords = geometrySubObjGeometry["coordinates"];

	                        let updatedGeojsonObjFeature = {
	                            "type": "Feature",
	                            "properties": newPropertiesObj,
	                            "geometry": {
	                                "type": "Polygon",
	                                "coordinates": polyCoords
	                            }
	                        }
	                        updatedGeojsonObj["features"].push(updatedGeojsonObjFeature);
	                    } else if (geometrySubType == "MultiPolygon") {
	                        let multiPolyCoords = geometrySubObjGeometry["coordinates"];
	                        for (let m1 in multiPolyCoords) {
	                            for (let m2 in multiPolyCoords[m1]) {
	                                let polyCoords = [multiPolyCoords[m1][m2]];
	                                let updatedGeojsonObjFeature = {
	                                    "type": "Feature",
	                                    "properties": newPropertiesObj,
	                                    "geometry": {
	                                        "type": "Polygon",
	                                        "coordinates": polyCoords
	                                    }
	                                }
	                                updatedGeojsonObj["features"].push(updatedGeojsonObjFeature);
	                            }
	                        }
	                    }
	                } // end if-else GeometryCollection
	                else {
	                    let updatedGeojsonObjFeature = {
	                        "type": "Feature",
	                        "properties": newPropertiesObj,
	                        "geometry": geometrySubObj
	                    }
	                    updatedGeojsonObj["features"].push(updatedGeojsonObjFeature);
	                }
	            } // for-loop
	        } // already in its most granular form
	        else {
	            // newPropertiesObj["F_SUBID"]=0;
	            let updatedGeojsonObjFeature = {
	                "type": "Feature",
	                "properties": newPropertiesObj,
	                "geometry": featureGeometry
	            }
	            updatedGeojsonObj["features"].push(updatedGeojsonObjFeature);
	        }
	    }
	    return updatedGeojsonObj;
	}

	function rowJSONToCSV(outputJSONObj) {
		let csvOutputStr="";
        let allHeaders={};
        for(let obj of outputJSONObj) {
          for(let k in obj) {
            allHeaders[k]='';
          }
        }
        let allHeadersArr=Object.keys(allHeaders);
        let headerStr=JSON.stringify(allHeadersArr);
        headerStr=headerStr.substring(1,headerStr.length-1);
        csvOutputStr+=headerStr + "\n";

        for(let obj of outputJSONObj) {
          let allValuesArr=[];
          for(let headerField of allHeadersArr) {
            let rowVal=obj[headerField];
            if(typeof rowVal !== 'undefined') {
              allValuesArr.push(rowVal);
            } else {
              allValuesArr.push('NULL');
            }
          }
          let rowStr=JSON.stringify(allValuesArr);
          rowStr=rowStr.substring(1,rowStr.length-1);
          csvOutputStr+=rowStr + "\n";
        }
        
        return Promise.resolve(csvOutputStr);
	}
	
	exportCSVOutputBtn.addEventListener('click', function(e) {
		resetProgressBar();
    	loadProgressBar();

    	let geojsonObj = uncombineGeometriesInFeatureCollection(uploadedGeojsonObj);
    	uploadedGeojsonObj = JSON.parse(JSON.stringify(geojsonObj));

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

							var outputJSONObjRecord_Copy = JSON.parse(JSON.stringify(outputJSONObjRecord));

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

								var outputJSONObjRecord_Copy = JSON.parse(JSON.stringify(outputJSONObjRecord));

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

						var outputJSONObjRecord_Copy = JSON.parse(JSON.stringify(outputJSONObjRecord));

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

							var outputJSONObjRecord_Copy = JSON.parse(JSON.stringify(outputJSONObjRecord));

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

							var outputJSONObjRecord_Copy = JSON.parse(JSON.stringify(outputJSONObjRecord));

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

								var outputJSONObjRecord_Copy = JSON.parse(JSON.stringify(outputJSONObjRecord));

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

		(async () => {
			try {
	        	var csvDataOutput=await rowJSONToCSV(outputJSONObj);

	        	resetProgressBar();
	        	let textblob = new Blob([csvDataOutput], {
	                type: "text/plain"
	            });
	            let dwnlnk = document.createElement("a");
	            dwnlnk.download = exportCSVOutputBtn.value + ".csv";
	            if (window.webkitURL != null) {
	                dwnlnk.href = window.webkitURL.createObjectURL(textblob);
	            } else {
	                dwnlnk.href = window.URL.createObjectURL(textblob);
	                dwnlnk.onclick = destce;
	                dwnlnk.style.display = "none";
	                document.body.appendChild(dwnlnk);
	            }
	            dwnlnk.click();
            } catch(err) {
	        	console.log('ERROR: ' + err.message);
	        	resetProgressBar();
	        }
    	})();
	}); // exportCSVOutBtn Function

	function dataURItoBlob(dataURI) {
	    if(typeof dataURI !== 'string'){
	        throw new Error('Invalid argument: dataURI must be a string');
	    }
	    dataURI = dataURI.split(',');
	    var type = dataURI[0].split(':')[1].split(';')[0],
	        byteString = atob(dataURI[1]),
	        byteStringLength = byteString.length,
	        arrayBuffer = new ArrayBuffer(byteStringLength),
	        intArray = new Uint8Array(arrayBuffer);
	    for (var i = 0; i < byteStringLength; i++) {
	        intArray[i] = byteString.charCodeAt(i);
	    }
	    return new Blob([intArray], {
	        type: type
	    });
	}

	exportMapImageBtn.addEventListener('click', async()=> {
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
        const tileLayer = L.tileLayer(apiBasemapUrl).addTo(copiedMap);
        console.log(apiBasemapUrl);
        
        await new Promise(resolve => tileLayer.on("load", () => resolve()));
        const dataURL = await domtoimage.toPng(copiedMapElement, { width, height });
        // console.log(dataURL);
        renderImageBounds();
        let imgBlob=dataURItoBlob(dataURL);
        // console.log(blobImageData);
        let dwnlnk = document.createElement("a");
        dwnlnk.download = "map.png";
        dwnlnk.href = window.webkitURL.createObjectURL(imgBlob);
        dwnlnk.click();
        document.body.removeChild(copiedMapElement);
	});

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