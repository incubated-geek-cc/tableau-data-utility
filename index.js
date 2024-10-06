const express = require("express");
const app = express();
app.use(express.json({ extended: false }));

const path = require("path");
const port = process.env.PORT || 5000;

const engine = require("consolidate");
const request = require('request').defaults({ encoding: null });
const compression = require('compression');
app.use(compression());

const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const formatDate = ((d) => `${(d.getDate() < 10) ? ("0"+d.getDate()) : d.getDate()} ${month[d.getMonth()]} ${d.getFullYear()}, ${(d.getHours() < 10) ? ("0"+d.getHours()) : d.getHours()}:${(d.getMinutes() < 10) ? ("0"+d.getMinutes()) : d.getMinutes()}`);

// set up router
const router = express.Router();
router.use(express.json()); // for parsing application/json
router.use(express.urlencoded({ extended: false })) // for disabling parsing application/x-www-form-urlencoded
router.use((req, res, next) => {
		// console.log('Time:', formatDate(new Date(Date.now())));
	  // console.log('Request Type:', req.method);
    res.header('Access-Control-Allow-Origin', process.env.ORIGIN || "*");
    next();
});
// REGISTER ALL ROUTES -------------------------------
app.use("/api", router); // all of the routes will be prefixed with /api

// Base64 to Uint8Array
const convertB64ToBitArr = (b64Str) => ( Uint8Array.from(atob( (b64Str.includes(';base64,') ? (b64Str.split(','))[1] : b64Str) ), (v) => v.charCodeAt(0)) );

const emptyImageUrl='data:image/png;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const emptyBinaryArray=convertB64ToBitArr(emptyImageUrl);
console.log(emptyBinaryArray);

const https = require('https');
router.get('/map_tile/:urlPrefix/:z/:x/:y.:ext', async (req, res) => {
		let prevHeader="";
		let rawHeaders=req["rawHeaders"];
		// console.log(rawHeaders);
		let headersObj={};
		for(let i=0;i<rawHeaders.length;i++) {
			let rawHeader=rawHeaders[i].toLowerCase();
			if(i==0 || i%2==0) {
				headersObj[rawHeader]="";
				prevHeader=rawHeader;
			} else if(i%2!=0) {
				headersObj[prevHeader]=rawHeader;
			}
		}
		// console.log(['headersObj',headersObj]);
		const dest = headersObj["sec-fetch-dest"];
  	const accept = headersObj["accept"];
  	const isImage = dest ? dest === "image" : !/text\/html/.test(accept);

  	let urlPrefix=req.params.urlPrefix;
  	urlPrefix=atob(urlPrefix); // decoded
  	urlPrefix=urlPrefix.replace('{s}','c');

  	let ext=req.params.ext;
  	urlPrefix=urlPrefix.replace(`/{z}/{x}/{y}.${ext}`,'');

  	let z=(req.params.z);
  	let x=(req.params.x);
  	let y=(req.params.y);
  	z=parseInt(z);
  	x=parseInt(x);
  	y=parseInt(y);

		let srcUrl=`${urlPrefix}/${z}/${x}/${y}.${ext}`;
		srcUrl= (!srcUrl.startsWith('https') && srcUrl.startsWith('http')) ? srcUrl.replace('http','https') : srcUrl;
  	if(isImage) { 
  		// if is image, end reponse here
  		const _req = https.request(srcUrl, (_res) => {
			    let allChunks = [];
			    _res.on('data', (chunk) => {
			        allChunks=allChunks.concat(chunk);
			    });
			    _res.on('end', () => {
						res.status(200).send(allChunks[0]);
						res.end();
			    });
			});
			_req.on('error', (_err) => {
			    console.error('error', _err);
			    // res.status(200).send(emptyBinaryArray);
			    res.end();
			});
			_req.end();
    } else {
    	let docData=`<html style="height: 100%">
				<head>
					<meta name="viewport" content="width=device-width, minimum-scale=0.1">
					<title>${srcUrl} (256×256)</title>
				</head>
				<body style="display: flex;margin: 0px;height: 100%;background-color: rgb(14, 14, 14);">
					<img 
						style="display: block;-webkit-user-select: none;margin: calc(50vh - 178px) auto;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;" 
						src="${srcUrl}">
				</body>
			</html>`;
    	res.set("Content-Type", "text/html");
			res.status(200).send(docData);
			res.end();
    }
});

app.use(express.static(path.join(__dirname, "public")))
.set("views", path.join(__dirname, "views"))
.engine("html", engine.mustache)
.set("view engine", "html")
.get("/", (req, res) => res.render("index.html"))
.listen(port, () => {
	console.log(`Tableau Data Utility app is listening on port ${port}!`)
});