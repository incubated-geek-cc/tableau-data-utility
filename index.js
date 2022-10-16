const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 5000;

const engine = require("consolidate");
const request = require('request').defaults({ encoding: null });
const bodyParser = require('body-parser');
const compression = require('compression');

app.use(compression());

// set up router
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json()); 
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ORIGIN || "*");
    next();
});

// https://stamen-tiles.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png
router.get('/map_tile/:urlPrefix/:z/:x/:y/:ext', (req, res) => {
	try {
	  	let urlPrefix=req.params.urlPrefix;
	  	urlPrefix=atob(urlPrefix); // decoded
	  	urlPrefix=urlPrefix.replace('{s}','a');
	  	
	  	let z=parseInt(req.params.z);
	  	let x=parseInt(req.params.x);
	  	let y=parseInt(req.params.y);
	  	let ext=req.params.ext;

		let srcUrl=urlPrefix+'/'+z+'/'+x+'/'+y+'.'+ext;
		// console.log(srcUrl);

		request({ url: srcUrl }, (_err, _res, _body) => {
			if (_err) {
				// console.log(_err);
				return res.status(500).json({
				    type: "error", 
				    message: (_err !== null && typeof _err.message !== "undefined") ? _err.message : "Error. Unabled to retrieve data from map service API."
			  	});
			}
			res.send(Buffer.from(_body));
		})
	} catch(err) {
		// console.log(err);
	  	return res.status(500).json({
	    	type: "error", 
	    	message: (err !== null && typeof err.message !== "undefined") ? err.message : "Error. Unabled to retrieve data from map service API."
	  	});
	}
});

// REGISTER ALL ROUTES -------------------------------
app.use("/api", router); // all of the routes will be prefixed with /api

app.use(express.static(path.join(__dirname, "public")))
.set("views", path.join(__dirname, "views"))
.engine("html", engine.mustache)
.set("view engine", "html")
.get("/", (req, res) => res.render("index.html"))
.listen(port, () => {
	console.log(`Tableau Data Utility app is listening on port ${port}!`)
});

router.get("/wake_up", (req, res) => {
  res.json({"status":"app_is_awake"});
});