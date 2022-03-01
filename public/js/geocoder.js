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

	var uploadedGeojsonObj=null
	var progress=0
	var t=null

	var mapContainer=document.getElementById("mapAlt")
	var resetMapViewBtn=document.getElementById("resetMapViewBtn")
	var clearMapViewBtn=document.getElementById("clearMapViewBtn")
	var exportBtn=document.getElementById("exportBtn")

	var exportOutputBtnList=document.getElementsByClassName("exportOutputBtn")

	var boundaryNum = document.getElementById("boundaryNum")
	var coordinatesNum = document.getElementById("coordinatesNum")

	var imgBounds_Left=document.getElementById("imgBounds_Left")
	var imgBounds_Right=document.getElementById("imgBounds_Right")
	var imgBounds_Bottom=document.getElementById("imgBounds_Bottom")
	var imgBounds_Top=document.getElementById("imgBounds_Top")


	var uploadGeoJsonFile = document.getElementById("uploadGeoJsonFile")

	var uploadProgress= document.getElementById("uploadProgress");
	var progressBar=uploadProgress.getElementsByClassName("progress-bar")[0]
	var errorMsg=document.getElementById("errorMsg");
	var successMsg=document.getElementById("successMsg");

	// ================== GEOJSON COORDINATES ======================
	var uploadGeoJsonFile_1 = document.getElementById("uploadGeoJsonFile_1")

	var uploadProgress_1= document.getElementById("uploadProgress_1");
	var progressBar_1=uploadProgress_1.getElementsByClassName("progress-bar")[0]
	var errorMsg_1=document.getElementById("errorMsg_1");
	var successMsg_1=document.getElementById("successMsg_1");


	var uploadSpatialFileIs=null
	var outputTypes = document.getElementsByClassName("outputType")
	var outputType="Geojson"


	var uploadSpatialFileIs_1=null
	var outputTypes_1 = document.getElementsByClassName("outputType_1")
	var outputType_1="Geojson"


	function checkOutputType(type) {
		if(type==0) {
			for(var o in outputTypes) {
				if(outputTypes[o].checked) {
					outputType = outputTypes[o].value;
				}
			}
		} else if(type==1) {
			for(var o in outputTypes_1) {
				if(outputTypes_1[o].checked) {
					outputType_1 = outputTypes_1[o].value;
				}
			}
		}
	}

	function lockOutputType(type,lock) {
		if(type==0) {
			for(var o in outputTypes) {
				outputTypes[o].disabled=lock
			}
		} else if(type==1) {
			for(var o in outputTypes_1) {
				outputTypes_1[o].disabled=lock
			}
		}
	}


	// initialise
	uploadGeoJsonFile_1.disabled = true
	resetMapViewBtn.disabled = true
	clearMapViewBtn.disabled = true
	exportBtn.getElementsByTagName("span")[0].className="caret"
	exportBtn.disabled=false

	var boundaryNumVal = 0
	var coordinatesNumVal = 0
	boundaryNum.innerHTML=""
	coordinatesNum.innerHTML=""

	var errorMsgArr=[]
	var imgBounds=null
	var layerBounds=null

	var boundaryLayer=null
	var coordinatesLayer=null

	lockOutputType(0,false)
	lockOutputType(1,true)

	lockMapAction(true)
	function lockMapAction(toLock) {
		mapContainer["style"]["touch-action"]=toLock ? "none": "auto"
		mapContainer["style"]["pointer-events"]=toLock ? "none": "auto"
	}
	var map = L.map("mapAlt", {
		zoomControl: false
	})
	map.on("zoomend", function(e) {
		renderImageBounds()
	});
	map.on("dragend", function(e) {
			renderImageBounds()
	});
	map.on("viewreset", function(e) {
			renderImageBounds()
	});
	map.on("moveend", function(e) {
			renderImageBounds()
	});
	map.on("load", function(e) {
			renderImageBounds()
	});
	map.on("resize", function(e) {
			renderImageBounds()
	});

	function resetMapView() {
		layerBounds=boundaryLayer.getBounds()
		let northEastLat = layerBounds._northEast.lat
		let northEastLng = layerBounds._northEast.lng

		let southWestLat = layerBounds._southWest.lat
		let southWestLng = layerBounds._southWest.lng

		map.fitBounds([
		    [northEastLat, northEastLng],
		    [southWestLat, southWestLng]
		])
	}

	resetMapViewBtn.onclick=function(e) {
		resetMapView()
	}

	for(var ex in exportOutputBtnList) {
		var exportOutputBtn = exportOutputBtnList[ex]
		exportOutputBtn.disabled = true

		exportOutputBtn.onclick=function(e) {
			var exportFormat = e.target.value

			exportBtn.getElementsByTagName("span")[0].className="spinner-border spinner-border-sm"
			exportBtn.disabled=true

			const deepCopyObj = (obj) => {
				let resultObj={}
				for(var o in obj) {
					resultObj[o]=obj[o]
				}
				return resultObj
			};
			const deepCopyArr = (arr) => {
				let resultArr={}
				for(var a in arr) {
					var obj=deepCopyObj(arr[a])
					resultArr.push(obj)
				}
				return resultArr
			};

			var geocodedPoints=[]

			var coordinateLayers = coordinatesLayer._layers
			for(var pointIndex in coordinateLayers) {
			    var pointFeature=coordinateLayers[pointIndex].feature
			    var pointGeometry=pointFeature["geometry"]
			    var pointGeomType=pointGeometry["type"]
			    var pointCoordinates=pointGeometry["coordinates"]
			    
			    if(pointGeomType=="Point") {
			    	var ptLng=pointCoordinates[0]
			    	var ptLat=pointCoordinates[1]

			    	var pointProps=pointFeature["properties"]
					pointProps["Latitude"]=ptLat
					pointProps["Longitude"]=ptLng

			    	var pt=turf.point([ptLng, ptLat])
					var pointInPoly=false

					var boundaryLayers = boundaryLayer._layers
					for(var layerIndex in boundaryLayers) {
					    var boundaryFeature=boundaryLayers[layerIndex].feature
					    var boundaryGeometry=boundaryFeature["geometry"]
					    var boundaryGeomType=boundaryGeometry["type"]
					    var boundaryCoordinates=boundaryGeometry["coordinates"]
					    
					    if(boundaryGeomType=="Polygon") {
					        var poly = turf.polygon(boundaryCoordinates)
					        pointInPoly=turf.booleanPointInPolygon(pt,poly)
					    } else if(boundaryGeomType=="MultiPolygon") {
					        var multiPoly = turf.multiPolygon(boundaryCoordinates)
					        pointInPoly=turf.booleanPointInPolygon(pt,multiPoly)
					    }
					    
					    if(pointInPoly) {
				        	var geocodedPoint=deepCopyObj(pointProps)
				        	var boundaryProps=deepCopyObj(boundaryFeature["properties"])
				        	var geocodedCoordinate=Object.assign(geocodedPoint, boundaryProps)
				        	geocodedPoints.push(geocodedCoordinate)
				        	break
					    }
					} // end inner for-loop of each boundary
				} // end if-block
			} // end for-loop of each coordinate

			var toOutput=JSON.stringify(geocodedPoints)
			
			if (!window.Blob) {
	            alert("Your browser does not support HTML5 'Blob' function required to save a file.");
	        } else {
	        	let dwnlnk = document.createElement("a");
	        	if(exportFormat == "JSON") {
					let textblob = new Blob([toOutput], {
	                    type: "application/json"
	                });
	                dwnlnk.download = "geocoded_output.json"
	                dwnlnk.innerHTML = "Download File";
	                if (window.webkitURL != null) {
	                    dwnlnk.href = window.webkitURL.createObjectURL(textblob);
	                } 
	                dwnlnk.click()
	                exportBtn.getElementsByTagName("span")[0].className="caret"
					exportBtn.disabled=false
				} else if(exportFormat == "CSV") {
					let outputJSONObj = geocodedPoints
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
			            if (!window.Blob) {
			                alert("Your browser does not support HTML5 'Blob' function required to save a file.");
			            } else {
			                let textblob = new Blob([csvDataOutput], {
			                    type: "text/plain"
			                });
			                dwnlnk.download = "geocoded_output.csv"
			                dwnlnk.innerHTML = "Download File";
			                if (window.webkitURL != null) {
			                    dwnlnk.href = window.webkitURL.createObjectURL(textblob);
			                } 
			                dwnlnk.click()
			                exportBtn.getElementsByTagName("span")[0].className="caret"
							exportBtn.disabled=false
			            }
			        })
			        .catch((err) => {
			        	console.log("ERROR: " + err.message)
			        });
				} // end if-else
	        } // end if-else
		};
	}


	clearMapViewBtn.onclick=function(e) {
		uploadGeoJsonFile.disabled = false
		uploadGeoJsonFile_1.disabled = true
		resetMapViewBtn.disabled = true
		clearMapViewBtn.disabled = true
		for(var ex in exportOutputBtnList) {
			var exportOutputBtn = exportOutputBtnList[ex]
			exportOutputBtn.disabled = true
		}

		uploadSpatialFileIs=null
		outputTypes[0].checked=true
		outputType="Geojson"

		uploadSpatialFileIs_1=null
		outputTypes_1[0].checked=true
		outputType_1="Geojson"

		lockOutputType(0,false)
		lockOutputType(1,true)

		map.eachLayer(function(layer) {
			map.removeLayer(layer)
		})

		errorMsgArr=[]
		imgBounds=null
		layerBounds=null
		
		boundaryLayer=null
		coordinatesLayer=null

		uploadGeoJsonFileClickFunc(0)
		uploadGeoJsonFile.value=""
		uploadGeoJsonFileClickFunc(1)
		uploadGeoJsonFile_1.value=""

		imgBounds_Left.innerHTML=""
		imgBounds_Right.innerHTML=""

		imgBounds_Bottom.innerHTML=""
		imgBounds_Top.innerHTML=""

		boundaryNumVal = 0
		coordinatesNumVal = 0
		boundaryNum.innerHTML=""
		coordinatesNum.innerHTML=""

		exportBtn.getElementsByTagName("span")[0].className="caret"
		exportBtn.disabled=false
		lockMapAction(true)
	}

	function renderImageBounds() {
		imgBounds=map.getBounds()
		imgBounds_Left.innerHTML=imgBounds._southWest.lng
		imgBounds_Right.innerHTML=imgBounds._northEast.lng

		imgBounds_Bottom.innerHTML=imgBounds._southWest.lat
		imgBounds_Top.innerHTML=imgBounds._northEast.lat
	}

	function uploadGeoJsonFileClickFunc(type) {
		if(type==0) {
			successMsg.innerHTML="";
			errorMsg.innerHTML="";
		} else if(type==1) {
			successMsg_1.innerHTML="";
			errorMsg_1.innerHTML="";
		}
	}
	uploadGeoJsonFile.onclick = function(e) {
		uploadGeoJsonFileClickFunc(0)
		e.target.value = "";
	}

	uploadGeoJsonFile_1.onclick = function(e) {
		uploadGeoJsonFileClickFunc(1)
		e.target.value = "";
	}

	function performGeojsonBoundaryCheck(type,geojson) {
		var invalidFormat=false;
	    var errors = geojsonhint.hint(geojson, {
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
	    	if(geojson["type"] !== "FeatureCollection" || !Array.isArray(geojson["features"])) {
	    		errorMsgArr.push("JSON structure must be the same as the above (i.e. A FeatureCollection object).");
				invalidFormat=true;
			}
	    }

	    if(type==0) {
	        // check if GeoJSON contains Polygon or MultiPolygon features
	        if(!invalidFormat) {
	        	let geojsonFeatures=geojson["features"]
	        	invalidFormat=true
	        	for(let gf in geojsonFeatures) {
	        		let geomType=geojsonFeatures[gf]["geometry"]["type"]
	        		if(geomType=="Polygon" || geomType=="MultiPolygon") {
	        			invalidFormat=false
						boundaryNumVal++
	        		}
	        	}
	        	if(invalidFormat) {
	        		errorMsgArr.push("GeoJSON has no Polygon or MultiPolygon feature(s) to tag to coordinate(s).");
	        	}
	        }
	        

			if(!invalidFormat) {
				uploadedGeojsonObj = geojson
				uploadGeoJsonFile_1.disabled=false;
				successMsg.innerHTML = "✓ File is uploaded successfully."
				uploadGeoJsonFile.disabled=true
				clearMapViewBtn.disabled=false
				resetMapViewBtn.disabled=false

				boundaryNum.innerHTML=boundaryNumVal

				boundaryLayer = L.geoJSON(uploadedGeojsonObj, {
				    style: function (feature) {
				        return {
				        	fillColor: "#F8F9FA",
				        	color: "#000000",
				        	weight:1.0,
				        	opacity: 1.0,
				        	fillOpacity: 0.65
				        }
				    }
				}).bindPopup(function (layer) {
				    return jsonObjToHTMLTable(layer.feature.properties)
				}).addTo(map)
				resetMapView()
				lockOutputType(0,true)
				lockOutputType(1,false)
			}
			displayErrorMsg(0)
		} else if(type==1) {
			if(!invalidFormat) {
				let geojsonFeatures=geojson["features"]
	        	invalidFormat=true
				for(let gf in geojsonFeatures) {
	        		let geomType=geojsonFeatures[gf]["geometry"]["type"]
	        		if(geomType=="Point") {
	        			invalidFormat=false
	        			coordinatesNumVal++;
	        		}
	        	}
	        	if(invalidFormat) {
	        		errorMsgArr.push("GeoJSON has no Point feature to geocode.");
	        	}
	        }

	    	if(!invalidFormat) {
				uploadedGeojsonObj = geojson
				uploadGeoJsonFile_1.disabled = true
				resetMapViewBtn.disabled = false
				clearMapViewBtn.disabled = false
				for(var ex in exportOutputBtnList) {
					var exportOutputBtn = exportOutputBtnList[ex]
					exportOutputBtn.disabled = false
				}

				coordinatesNum.innerHTML=coordinatesNumVal

				successMsg_1.innerHTML = "✓ File is uploaded successfully."
				coordinatesLayer = L.geoJSON(uploadedGeojsonObj, {
				    pointToLayer: function (feature, latlng) {
						return L.marker(latlng, {
						   icon: L.divIcon({      
						       html: '<svg class="icon-coordinate icon icon-map-marker-2"><use xlink:href="img/symbol-defs.svg#icon-map-marker-2"></use></svg>'
						   })
						}).addTo(map)
					}
				}).bindPopup(function (layer) {
				    return jsonObjToHTMLTable(layer.feature.properties)
				}).addTo(map)
				
				lockMapAction(false)
				resetMapView()
				lockOutputType(0,true)
				lockOutputType(1,true)
			}
			displayErrorMsg(1)
		}
	};

	uploadGeoJsonFile.onchange = function(uploadFle) {
		if(uploadFle.target.value !== "" && uploadFle.target.files.length>0) {
			uploadGeoJsonFileClickFunc(0)
			uploadedGeojsonObj=null
			errorMsgArr=[]
			for(var ex in exportOutputBtnList) {
				var exportOutputBtn = exportOutputBtnList[ex]
				exportOutputBtn.disabled = true
			}
			clearMapViewBtn.disabled = true
			uploadGeoJsonFile_1.disabled=true
			resetProgressBar(0)

			boundaryNumVal = 0
			boundaryNum.innerHTML=""
			// check which spatial format is selected
			checkOutputType(0)

	        if (!window.FileReader) {
	            alert("Your browser does not support HTML5 'FileReader' function required to open a file.");
	        } else {
	            var fileis = uploadGeoJsonFile.files[0]
	            var fileredr = new FileReader()
	        	if(outputType=="SHP") {
	        		fileredr.readAsArrayBuffer(fileis)
	        	} else if(outputType=="KML" || outputType=="Geojson") {
	            	fileredr.readAsText(fileis)
	            }
	            fileredr.onload = function (fle) {
	            	errorMsgArr=[]

	            	loadProgressBar(0)
	            	var filecont = fle.target.result // array buffer
	               	uploadSpatialFileIs=filecont
		            if(outputType=="SHP") {
		            	shp(uploadSpatialFileIs).then(function(geojsonObj) {
						  	performGeojsonBoundaryCheck(0,geojsonObj)
						}) // end shp-file
		            } else if(outputType=="KML") {
		            	let geojsonObj=KMLStrtoGeoJSON(uploadSpatialFileIs)
		            	performGeojsonBoundaryCheck(0,geojsonObj)
		            } else if(outputType=="Geojson") {
		            	let geojsonObj=null
		            	try {
		            		geojsonObj=JSON.parse(uploadSpatialFileIs)
		            	} catch(err) {
		            		if(err.message.indexOf("SyntaxError: Unexpected token") < 0) {
		            			geojsonObj=null
		            			errorMsgArr.push("Invalid JSON format.");
		            			displayErrorMsg(0)
		            		}
		            	}
		            	if(geojsonObj !== null) {
							performGeojsonBoundaryCheck(0,geojsonObj)				            	
		            	}
		            }
	           } // end file-reader onload
	        }; // end if-else
	    }
	}; // uploadGeoJsonFile func



	uploadGeoJsonFile_1.onchange = function(uploadFle) {
		if(uploadFle.target.value !== "" && uploadFle.target.files.length>0) {
			uploadGeoJsonFileClickFunc(1)
			uploadedGeojsonObj=null
			errorMsgArr=[]
			for(var ex in exportOutputBtnList) {
				var exportOutputBtn = exportOutputBtnList[ex]
				exportOutputBtn.disabled = true
			}
			clearMapViewBtn.disabled=false
			resetProgressBar(1)

			coordinatesNumVal=0
			coordinatesNum.innerHTML=""

			// check which spatial format is selected
			checkOutputType(1)

	        if (!window.FileReader) {
	            alert("Your browser does not support HTML5 'FileReader' function required to open a file.");
	        } else {
	            var fileis = uploadGeoJsonFile_1.files[0]
	            var fileredr = new FileReader()
	        	if(outputType_1=="SHP") {
	        		fileredr.readAsArrayBuffer(fileis)
	        	} else if(outputType_1=="KML" || outputType_1=="Geojson") {
	            	fileredr.readAsText(fileis)
	            }
	            fileredr.onload = function (fle) {
	            	errorMsgArr=[]

	            	loadProgressBar(1)
	            	var filecont = fle.target.result // array buffer
	               	uploadSpatialFileIs_1=filecont
		            if(outputType_1=="SHP") {
		            	shp(uploadSpatialFileIs_1).then(function(geojsonObj) {
						  	performGeojsonBoundaryCheck(1,geojsonObj)
						}) // end shp-file
		            } else if(outputType_1=="KML") {
		            	let geojsonObj=KMLStrtoGeoJSON(uploadSpatialFileIs_1)
		            	performGeojsonBoundaryCheck(1,geojsonObj)
		            } else if(outputType_1=="Geojson") {
		            	let geojsonObj=null
		            	try {
		            		geojsonObj=JSON.parse(uploadSpatialFileIs_1)
		            	} catch(err) {
		            		if(err.message.indexOf("SyntaxError: Unexpected token") < 0) {
		            			geojsonObj=null
		            			errorMsgArr.push("Invalid JSON format.");
		            			displayErrorMsg(1)
		            		}
		            	}
		            	if(geojsonObj !== null) {
							performGeojsonBoundaryCheck(1,geojsonObj)				            	
		            	}
		            }
	           } // end file-reader onload
	        }; // end if-else
	    }
	}; // uploadGeoJsonFile func



	function deepCopyObj(obj) {
		let resultObj={};
		for(let o in obj) {
			resultObj[o]=obj[o];
		}
		return resultObj;
	}

	function resetProgressBar(type) {
		progress=0;

		if(type==0) {
			uploadProgress["style"]["display"]="none";
			progressBar.setAttribute("aria-valuenow", 0);
	    	progressBar["style"]["width"]=0+"%";
	    	progressBar.innerHTML=0+"%";
		} else if(type==1) {
			uploadProgress_1["style"]["display"]="none";
			progressBar_1.setAttribute("aria-valuenow", 0);
	    	progressBar_1["style"]["width"]=0+"%";
	    	progressBar_1.innerHTML=0+"%";
		}
	}

	function loadProgressBar(type) {
		if(type==0) {
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
		} else if(type==1) {
			uploadProgress_1["style"]["display"]="block";
			t=setInterval(function() {
	    		if(progress > 99) {
	    			clearInterval(t);
	    		} else {
	    			progressBar_1.setAttribute("aria-valuenow", progress);
	        		progressBar_1["style"]["width"]=progress+"%";
	        		progressBar_1.innerHTML=progress+"%";
	        		progress++;
	    		}
	    	}, 100);
		}
	}

	function displayErrorMsg(type) {
		resetProgressBar(type);
		var errorMsgHtmlStr="";
		if(errorMsgArr.length>0) {
			errorMsgHtmlStr+="<ol>"
		}
		for(var e in errorMsgArr) {
			errorMsgHtmlStr+="<li>"+errorMsgArr[e]+" ✗</li>"
		}
		if(errorMsgArr.length>0) {
			errorMsgHtmlStr+="</ol>";
			for(var ex in exportOutputBtnList) {
				var exportOutputBtn = exportOutputBtnList[ex]
				exportOutputBtn.disabled = true
			}
		}
		errorMsg.innerHTML=errorMsgHtmlStr;
	}

	function jsonObjToHTMLTable(jsonObj) {
		let output="<div class='table-responsive table-condensed small'><table class='table table-bordered table-condensed small'><thead><th>" + Object.keys(jsonObj).join("</th><th>") + "</th></thead>"
		output+="<tbody>"
		output+="<tr><td>" + Object.values(jsonObj).join("</td><td>") + "</td></tr>"
		output+="</tbody></table></div>"

		return output
	}
};