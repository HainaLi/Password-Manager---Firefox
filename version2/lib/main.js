const {Cc,Ci,Cr} = require("chrome");
const {components} = require("chrome"); 
var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
var file = require("sdk/io/file");
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var pageWorker = require("sdk/page-worker");
var self = require("sdk/self");
var profilePath = require("sdk/system").pathFor("ProfD");
var fileComponent = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
var testFile = require("./testList");
var windows = require("sdk/windows").browserWindows;

var testFileArrayIndex = 0; 	
var testList = testFile.testList[testFileArrayIndex];
var current = 0; 
var clickReceived = 0; 
var isHTTPs = 2; // 1 indicates is HTTPs, 0 indicates HTTP, 2 indicates default
var compareActionAndPosturl = 3; 
var formAction = "";
var POSTurl = ""; 
var loginResult = 4; //4 is default
var findLoginButtonAndForm = ""; 
var loginbuttonid = ""; 
var nextCount = 0; 

var searchDepth = 3; 

var logfile = ""; 

/**
Results file: for each website, 
1 -> works for both username and password
0 -> works for neither
2 -> works for username but not password
3 -> works for password but not username
**/

var usernameinASCII = "100,117,109,109,121,85,115,101,114,78,97,109,101,37,52,48,103,109,97,105,108,46,99,111,109";
var passwordinASCII = "100,117,109,109,121,80,97,115,115,119,111,114,100"; 

exports.main = function (options, callbacks) {

  current = options.staticArgs.startnum; 
  console.log(current); 
  tabs.open(testList[current]); 
  logfile = options.staticArgs.logfile; 
  //timeOutNextWebsite(); 
 
};

/**
current = 3; 
tabs.open(testList[current]); 
logfile = "file.txt";
**/
pageMod.PageMod({
	include: "*",
	contentScriptFile: [self.data.url("jquery-1.4.2.min.js"), self.data.url("modifyForm.js"),self.data.url("findLoginForm.js")],
	onAttach: changeWeb, 
	contentScriptWhen: "end"

});


/*
function timeOutNextWebsite() {
  setTimeout(nextWebsite, 10000);
}
*/

function nextWebsite() {
  saveResultToFile(logfile); 
}



function changeWeb(worker)  {
	worker.port.on("findLoginForm.js to main.js: login form id", function(message)  {
		console.log("loginformid received from findLoginForm.js");
		console.log("sending loginformid to modifyForm.js");
		worker.port.emit("loginformid found", message); 
	});	
	worker.port.on("no login form id", function(message)  {
		findLoginButtonAndForm = "no login form id"; 
		saveResultToFile(logfile); 
	});
	worker.port.on("cannot complete modifyForm", function(message)  {
		findLoginButtonAndForm = "cannot complete modifyForm"; 
		next(); 
	});	
	
	worker.port.on("login form ids", function(message) {
	
		findLoginButtonAndForm = message; 
		//saveResultToFile(logfile);  
	});
	
	worker.port.on("no button/forms found", function() {
		findLoginButtonAndForm = "button and form not found"
		next(); 
	});

	worker.port.on("Intercept Post Request", function() {
		console.log("main.js: InterceptPost message received!"); 
		clickReceived = 1; 
	});
	worker.port.on("form action is https", function(message) {
	
		isHTTPs = 1; 
		formAction = message; 
	
	}); 

	worker.port.on("form doesn't have action", function(message) {
			formAction = "form doesn't have action"; 
	
	});

	worker.port.on("form action is NOT https", function(message) {
	
		isHTTPs = 0; 
		formAction = message; 
	
	});

}

function next() {
	nextCount ++; 
	console.log("nextCount: " + nextCount); 
	if (nextCount > 2) {
		findLoginButtonAndForm = "neither login form nor button found"; 
		saveResultToFile(logfile); 
	}


}
function startTest(website) {
	tabs.open({
		url: website,
		inBackground:true,
		//inNewWindow: true
	});
	 

}

var closeAllOtherTabs = function(){
	if (tabs.length <= 1) return;
	for each (var tabIterator in tabs){
		if (tabIterator.i != 1) 
			tabIterator.close();
	}
}

function advanceToNext(website) {
	resetResults(); 
	closeAllOtherTabs();
	startTest(website); 
}

function resetResults() {
	//console.log("resetResults()"); 
	clickReceived = 0; 
	isHTTPs = 2; // 1 indicates is HTTPs, 0 indicates HTTP, 2 indicates default
	formAction = ""; 
	POSTurl = ""; 
	loginResult = 4; //4 is default
	compareActionAndPosturl = 2;
	loginbuttonid = ""; 
	findLoginButtonAndForm = ""; 

}


function fileNameSanitize(str)
{
	return str.replace(/[^a-zA-Z0-9]*/g,"").substr(0,32)+".txt";
}


function saveResultToFile(fileName)
{
	if (formAction == "form doesn't have action") {
		compareActionandPosturl = 2; 
	}
	else {
		if (formAction == POSTurl)  {
			compareActionAndPosturl = 1;
		}
		else {
			compareActionAndPosturl = 0;
		}
	}
	content = current + "," + testList[current] + "," +findLoginButtonAndForm + "," + formAction + "," + isHTTPs + "," + POSTurl + "," + compareActionAndPosturl + "," + loginResult; 
	fileName = fileNameSanitize(fileName);
	var filePath = file.join(profilePath, "testResults", fileName);

	fileComponent.initWithPath(filePath); 

	var foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
	foStream.init(fileComponent, 0x02 | 0x08 | 0x10, 0666, 0); 
	foStream.write(content+"\n", content.length+1);
	foStream.close();
	current ++; 
	advanceToNext(testList[current]);
}


if (typeof CCIN == "undefined") {
	function CCIN(cName, ifaceName){
		return Cc[cName].createInstance(Ci[ifaceName]);
	}
}
if (typeof CCSV == "undefined") {
	function CCSV(cName, ifaceName){
		if (Cc[cName])
			return Cc[cName].getService(Ci[ifaceName]); 
		else
			dumpError("CCSV fails for cName:" + cName);
	};
}


function TracingListener() {
    this.originalListener = null;
	this.receivedData = [];
}

TracingListener.prototype =
{
    onDataAvailable: function(request, context, inputStream, offset, count)
    {
        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
        var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1","nsIBinaryOutputStream");

        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

        // Copy received data as they come.
        var data = binaryInputStream.readBytes(count);
        this.receivedData.push(data);	
		//console.log(data); 
				
		//to modify response, modify the variable 'data' above. The next statement is going to write data into outputStream and then pass it to the next listener (and eventually the renderer).
        binaryOutputStream.writeBytes(data, count);

        this.originalListener.onDataAvailable(request, context, storageStream.newInputStream(0), offset, count);
		//console.log(request); 
    },

    onStartRequest: function(request, context) {
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode)
    {
 
		this.originalListener.onStopRequest(request, context, statusCode);

    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Cr.NS_NOINTERFACE;
    }
}

observerService.addObserver({
    observe: function(aSubject, aTopic, aData) {
		if ("http-on-modify-request" == aTopic) {
			var gchannel = aSubject.QueryInterface(Ci.nsIHttpChannel)
			var url = gchannel.URI.spec;

			var postDATA = "";
			var cookies = "";

			try {cookies = gchannel.getRequestHeader("cookie");} catch(e){}						//this creates lots of errors if not caught

			if (gchannel.requestMethod == "POST") {

				var channel = gchannel.QueryInterface(Ci.nsIUploadChannel).uploadStream;  
				var prevOffset = channel.QueryInterface(Ci.nsISeekableStream).tell();
				channel.QueryInterface(Ci.nsISeekableStream).seek(Ci.nsISeekableStream.NS_SEEK_SET, 0);  
				var stream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);  
				stream.setInputStream(channel); 
				

	
				var postBytes = stream.readByteArray(stream.available());  			//this is going to mess up with POST action.
				var poststr = postBytes.toString();
				if (poststr.indexOf(usernameinASCII) > -1 & clickReceived == 1) {
					clickReceived = 0; 
					POSTurl = url; 
					if (poststr.indexOf(passwordinASCII) > -1) {
						console.log("both dummy strings detected!");
						loginResult = 1; 
					}	
					else {
						console.log("username was detected, but password was NOT detected!"); 
						loginResult = 2; 	
						
					}
					saveResultToFile(logfile); 
				}
				
				else if (clickReceived == 1){
					clickReceived = 0; 
					POSTurl = url; 
					if (poststr.indexOf(passwordinASCII) > -1) {
						console.log("password was detected, but username was NOT detected");
						loginResult = 3; 

					}	
					else {
						console.log("Neither username nor password detected!");
						loginResult = 0; 

					}
					saveResultToFile(logfile); 
				
				}

				
				
				channel.QueryInterface(Ci.nsISeekableStream).seek(Ci.nsISeekableStream.NS_SEEK_SET, prevOffset);
			}
		}
	}	
}, "http-on-modify-request", false);
