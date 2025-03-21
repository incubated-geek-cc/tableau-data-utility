document.addEventListener('DOMContentLoaded', async()=> {
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

	var networkGraph = document.getElementById("networkGraph");

	var alphaTarget = 0.003; // 0.005
    var graphData = null;

    var nodesData = null;
    var linksData = null;

    var simulation = null;

    var containerWidth = 624;
    var height = 1150;
    var width = document.body.clientWidth;

    var ngraphContainer = networkGraph.parentElement;
    ngraphContainer["style"]["padding"] = "10px 0";
    ngraphContainer["style"]["position"] = "relative";
    ngraphContainer["style"]["min-height"] = "33px";
    
    ngraphContainer.parentElement["style"]["max-width"] = containerWidth + "px";
    ngraphContainer.parentElement["style"]["margin-left"] = (((width-containerWidth)/2)-34) + "px";
    ngraphContainer.parentElement["style"]["margin-right"] = ((width-containerWidth)/2) + "px";
	
    var cssValsMapping={
        "background": "#ffffff",
        "position": "fixed",
        "top": 0,
        "bottom": 0,
        "left": 0,
        "right": 0,
        "overflow": "auto",
        "border": "2px solid #000000"
    };
    var cssUnsetValsMapping={
        "background": "",
        "position": "",
        "top": "",
        "bottom": "",
        "left": "",
        "right": "",
        "overflow": "",
        "border": ""
    };
    function assignCssMapping(ele,mappingObj) {
        for(let k in mappingObj) {
            ele["style"][k]=mappingObj[k];
        }
    }
    var networkGraphScreen=ngraphContainer.parentElement.parentElement;

    const goFullScreen = "⛶";
    const exitFullScreen = "▢";
    var toggleFullScreen = document.getElementById("toggleFullScreen");
    toggleFullScreen.addEventListener("click", makeFullScreen);

    function makeFullScreen(ev) {
        var currentValue=ev.target.value;
        
        if(currentValue==goFullScreen) {
            assignCssMapping(networkGraphScreen,cssValsMapping);
            toggleFullScreen.value=exitFullScreen;
            toggleFullScreen.innerHTML=exitFullScreen;
        } else {
            assignCssMapping(networkGraphScreen,cssUnsetValsMapping);
            toggleFullScreen.value=goFullScreen;
            toggleFullScreen.innerHTML=goFullScreen;
        }
    };

    var svg = null;
    var link = null;
    var node = null;
    var t = null;


    var nodesize=document.getElementById("nodesize");
    var nodecollide=document.getElementById("nodecollide");
    var nodestrength=document.getElementById("nodestrength");
    var nodedistance=document.getElementById("nodedistance");

    var exportNodesData = document.getElementById("exportNodesData");
	var exportLinksData = document.getElementById("exportLinksData");
	var inputJsonFile = document.getElementById("inputJsonFile");

    
    // on input
    nodesize.oninput = function(e) {
    	let newVal = parseFloat(e.target.value);
	 	document.getElementById(e.target.id + "caption").innerHTML=newVal;
    };
    nodecollide.oninput = function(e) {
    	let newVal = parseFloat(e.target.value);
	 	document.getElementById(e.target.id + "caption").innerHTML=newVal;
    };
    nodestrength.oninput = function(e) {
    	let newVal = parseFloat(e.target.value);
	 	document.getElementById(e.target.id + "caption").innerHTML=newVal;
    };
    nodedistance.oninput = function(e) {
    	let newVal = parseFloat(e.target.value);
	 	document.getElementById(e.target.id + "caption").innerHTML=newVal;
    };

    // on change
    nodesize.onchange = function(e) {
    	let newVal = parseFloat(e.target.value);
	 	document.getElementById(e.target.id + "caption").innerHTML=newVal;
	 	networkGraph.innerHTML="";
        startLoad();
        simulation.alphaTarget(alphaTarget).restart();
        renderGraph(graphData);

        t = setInterval(() => {
            if(simulation.alpha() < alphaTarget) {
                stopLoad();
                clearInterval(t);
            }
        },1000); // end time interval
    };
    nodecollide.onchange = function(e) {
    	let newVal = parseFloat(e.target.value);
	 	document.getElementById(e.target.id + "caption").innerHTML=newVal;
	 	networkGraph.innerHTML="";
        startLoad();
        simulation.alphaTarget(alphaTarget).restart();
        renderGraph(graphData);

        t = setInterval(() => {
            if(simulation.alpha() < alphaTarget) {
                stopLoad();
                clearInterval(t);
            }
        },1000); // end time interval
    };
    nodestrength.onchange = function(e) {
    	let newVal = parseFloat(e.target.value);
	 	document.getElementById(e.target.id + "caption").innerHTML=newVal;
	 	networkGraph.innerHTML="";
        startLoad();
        simulation.alphaTarget(alphaTarget).restart();
        renderGraph(graphData);

        t = setInterval(() => {
            if(simulation.alpha() < alphaTarget) {
                stopLoad();
                clearInterval(t);
            }
        },1000); // end time interval
    };
    nodedistance.onchange = function(e) {
    	let newVal = parseFloat(e.target.value);
	 	document.getElementById(e.target.id + "caption").innerHTML=newVal;
	 	networkGraph.innerHTML="";
        startLoad();
        simulation.alphaTarget(alphaTarget).restart();
        renderGraph(graphData);

        t = setInterval(() => {
            if(simulation.alpha() < alphaTarget) {
                stopLoad();
                clearInterval(t);
            }
        },1000); // end time interval
    };

	

    function startLoad() {
    	exportNodesData.innerHTML="<span class='spinner-border spinner-border-sm'></span> Loading...";
    	exportLinksData.innerHTML="<span class='spinner-border spinner-border-sm'></span> Loading...";
        
        inputJsonFile.disabled=true;
        exportLinksData.disabled=true;
        exportNodesData.disabled=true;
        nodesize.disabled=true;
        nodecollide.disabled=true;
        nodestrength.disabled=true;
        nodedistance.disabled=true;
    }

    function stopLoad() {
        exportNodesData.innerHTML="Export nodes.csv";
       	exportLinksData.innerHTML="Export links.csv";

       	inputJsonFile.disabled=false;
        exportLinksData.disabled=false;
        exportNodesData.disabled=false;
        nodesize.disabled=false;
        nodecollide.disabled=false;
        nodestrength.disabled=false;
        nodedistance.disabled=false;
    }


    function dragstarted(d) {
        if (!d3.event.active) {
            startLoad();
            simulation.alphaTarget(alphaTarget).restart();
        }

        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }
        stopLoad();

        d.fx = null;
        d.fy = null;
    }

    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    function renderGraph(graph) {
        let strength = parseInt(nodestrength.value);
        let distance = parseInt(nodedistance.value);
        let size = parseInt(nodesize.value);
        let collide = parseInt(nodecollide.value);

        svg = d3.select("svg").attr("viewBox", [-width/2,-height /2,width,height]);

        link = svg.append("g")
                    .attr("class", "links")
                    .attr("stroke", "#dddddd")
                    .attr("stroke-opacity", 1)
                .selectAll("line")
                .data(graph.links)
                .enter().append("line")
                    .attr("stroke-width", d => 2.5);
                    //.attr("stroke-width", d=> Math.sqrt(d.value));

        node = svg.append("g")
                        .attr("class", "nodes")
                        .attr("stroke", "#000000")
                        .attr("stroke-width", 0.5)
                    .selectAll("g")
                    .data(graph.nodes)
                    .enter().append("g")
                    .append("circle")
                        .attr("r", d => size)
                        //.attr("r", d => Math.sqrt(d.nodesize))
                        //.attr("fill", d => color(d.group))
                        .on("mouseover", function() {
                            d3.select(this)
                                .transition()
                                .duration(50)
                                .attr("fill", "#f00000")
                        })
                        .on("mouseout", function(){
                            d3.select(this)
                                .transition()
                                .duration(50)
                                .attr("fill", "#a6a6a6")
                        })
                        .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended)
                    );

        simulation = d3.forceSimulation()
                            .nodes(graph.nodes)
                            .force("link", d3.forceLink(graph.links).id(d=> d.id))
                            .force("charge", d3.forceManyBody().strength(-strength))
                            //.force("charge", d3.forceManyBody())
                            .force("collide", d3.forceCollide(d=> size+collide ))
                            .force("x", d3.forceX())
                            .force("y", d3.forceY());
              
        simulation.force("link")
            .links(graph.links)
            .distance(distance);

        simulation
            .on("tick", ()=>{
                link
                    .attr("x1", d=> d.source.x)
                    .attr("y1", d=> d.source.y)
                    .attr("x2", d=> d.target.x)
                    .attr("y2", d=> d.target.y);
                node
                    .attr("cx", d=>d.x)
                    .attr("cy", d=>d.y);
            });

        nodesData = graph.nodes;
        linksData = graph.links;
    }

    d3.json("data/data.json", function(error, graph) { // data/stackoverflow.json
        if (error) {
            console.log(error);
        }
        graphData = graph;
        networkGraph.innerHTML="";
        startLoad();
        renderGraph(graph);

        exportLinksData.onclick = function(e) {
            let saveas = e.target.value;

            let links_data = [];
            for(let linkIndex in linksData) {
                let linkObj = linksData[linkIndex];
             
                let obj = {
                    "key": linkObj["index"],
                    "type": "source"
                };
                let linkKey = "";
                for(linkKey in linkObj["source"]) {
                    linkObj["source"][linkKey] = linkObj["source"][linkKey];
                    obj[linkKey] = linkObj["source"][linkKey];
                }
                links_data.push(obj);
                
                obj = {
                    "key": linkObj["index"],
                    "type": "target"
                };
                linkKey = "";
                for(linkKey in linkObj["target"]) {
                    linkObj["target"][linkKey] = linkObj["target"][linkKey];
                    obj[linkKey] = linkObj["target"][linkKey];
                }
                links_data.push(obj);
            }

            // derive "link_id" from links_data
            var link_id = "";
            for(let lk in links_data) {
                if(lk % 2 == 1) { // target
                    link_id+=links_data[lk]["id"];
                    links_data[lk-1]["link_id"] = link_id;
                    links_data[lk]["link_id"] = link_id;

                    link_id="";
                } else { // source
                    link_id+=links_data[lk]["id"] + "_";
                }
            }

            converter.json2csvAsync(links_data, {
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
                let txtwrt = csvDataOutput;
                if (!window.Blob) {
                    alert("Your browser does not support HTML5 'Blob' function required to save a file.");
                } else {
                    let textblob = new Blob([txtwrt], {
                        type: "text/plain"
                    });
                    let dwnlnk = document.createElement("a");
                    dwnlnk.download = saveas;
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
            .catch((err) => console.log('ERROR: ' + err.message));
        };
        
        exportNodesData.onclick = function(e) {
            let saveas = e.target.value;

            converter.json2csvAsync(graphData["nodes"], {
                prependHeader: true,
                sortHeaderv: true,
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
                let txtwrt = csvDataOutput;
                if (!window.Blob) {
                    alert("Your browser does not support HTML5 'Blob' function required to save a file.");
                } else {
                    let textblob = new Blob([txtwrt], {
                        type: "text/plain"
                    });
                    
                    let dwnlnk = document.createElement("a");
                    dwnlnk.download = saveas;
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
            .catch((err) => console.log("ERROR: " + err.message));
        }; 

        if(simulation.alpha() < alphaTarget) {
            simulation.stop();
        }
    }); // end d3.json

    t = setInterval(() => {
        if(simulation.alpha() < alphaTarget) {
            stopLoad();
            clearInterval(t);
        }
    },1000); // end time interval

    inputJsonFile.onclick=function(e) {
        e.target.value = "";
    };

    inputJsonFile.onchange=function(e) {
        let fileName = e.target.value;
        fileName = fileName.split("\\")[2];
        let n = fileName.lastIndexOf(".");
        fileName = fileName.substring(0,n) + ".csv";

        exportNodesData.value="nodes_" + fileName;
        exportLinksData.value="links_" + fileName;

        if (!window.FileReader) {
            alert("Your browser does not support HTML5 'FileReader' function required to open a file.");
        } else {
            let fileis = this.files[0];
            let fileredr = new FileReader();
            fileredr.onload = function (fle) {
                let filecont = fle.target.result;
                
                let graph = JSON.parse(filecont);
                graphData = graph;

                simulation.alphaTarget(alphaTarget).restart();
               	networkGraph.innerHTML="";
                startLoad();
                renderGraph(graph);

                t = setInterval(() => {
                    if(simulation.alpha() < alphaTarget) {
                        stopLoad();
                        clearInterval(t);
                    }
                },1000); // end time interval
            }
            fileredr.readAsText(fileis);
        }
    }; // new file input

});