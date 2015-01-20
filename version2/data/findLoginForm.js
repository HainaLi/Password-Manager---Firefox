debugger;  

var loginformid = "null"; 
var numclicks = 0; 
var nobuttonform = 0; 
var depth = 0; 
var alreadyClicked = []; 
var candidates = []; 
var foundloginform = 0; 

function findLoginForm() {
	console.log("findLoginForm()"); 
	var regexes = [/up/gi, /regist/gi, /new/gi]; 

	//try {
		
		var forms_ = document.forms;
		
		var i = 0;
		var j = 0; 		
		for (i = 0; i < forms_.length; i++) {
			//exclude sign up forms
			if (forms_.item(i).action.match(regexes[0]) != null || forms_.item(i).action.match(regexes[1]) != null || forms_.item(i).action.match(regexes[2]) != null || forms_.item(i).id.match(regexes[0]) != null || forms_.item(i).id.match(regexes[1]) != null || forms_.item(i).id.match(regexes[2]) != null ) {
				continue; 
			}
			//exclude invisible forms
			if (!onTopLayer(forms_.item(i)))
				continue; 
			var elemts = forms_.item(i).elements;
			for (j = 0; j < elemts.length; j++) {
				var elemts_ = elemts[j]; ; 
				if (elemts_.type == "password") {
					if (!(forms_.item(i).hasAttribute("id"))) {
						var attr = document.createAttribute("id"); 
						attr.value = "";
						forms_.item(i).setAttributeNode(attr); 						
					}					
					else {
						loginformid = forms_.item(i).id; 
					}
					
					if (loginformid == "" || loginformid == "null") {
						console.log("First method: Password element found, but no login form id"); 
						console.log("Setting login form id to 'loginformid123'")
						loginformid = "loginformid123"; 
						forms_.item(i).id = "loginformid123"; 
						console.log("Actual form id: " + forms_.item(i).id); 
					}
					console.log("first method: Login form found: " + loginformid);
					self.port.emit("findLoginForm.js to main.js: login form id", loginformid); 
					foundloginform = 1; 
					return true; 
				}
			}	
		}
		//self.port.emit("No elements with type 'password'" + "");
		//console.log("First method: No elements with type 'password'"); 
		/**
		console.log("findLoginForm() first method failed, trying second method: searching through all the elements."); 
		var inputElements = document.querySelectorAll("form"); 	
		for (var i = 0, n = inputElements.length; i < n; ++i) { 

			if (inputElements[i].method.ignoreCase == "post") {
				console.log("element has post: " + inputElements[i].id); 
				var childNodes = inputElements[i].childNodes; 
				for (var j = 0, m = childnodes.length; j<m; ++j) {
						if (childNodes[j].type == "password" ) {
							var attr = document.createAttribute("id"); 	
							attr.value = "pmlogin"; 
							inputElements[i].setAttributeNode(attr); 
							loginformid = "pmlogin"; 
							console.log("sec	ond method succeeded.")
							self.port.emit("findLoginForm.js to main.js: login form id", loginformid); 
							return true; 
						}
					
				}
				console.log("Second method failed. No childNode with type 'password'"); 
			}				
			console.log("Second method failed. No element with method 'POST'"); 
		}
		console.log("Neither methods of finding login form worked."); 
		return false; 
		**/
	/***} 
	catch (err){
		console.log("Error finding forms"); 
	}***/
	return false; 

}

function findLoginButton(count) {
	console.log("findLoginButton()"); 
	var regexes = [/log[\s-_]?[io]n/gi, /sign[\s-_]?[io]n/gi];
	var allElements = document.getElementsByTagName("*"); 		
	for (var i = 0, n = allElements.length; i < n; ++i) { 
	
		if (allElements[i].hasAttribute("href")) {
			for (var j = 0; j < regexes.length; j++) {

				if (((allElements[i].innerHTML.match(regexes[j]) != null | allElements[i].id.match(regexes[j]) != null |allElements[i].getAttribute("href").match(regexes[j]) != null)) && allElements[i].hasAttribute("href")) {
				
					allElements[i].click();
					console.log("href: " + allElements[i].href); 
					
					console.log("Clicked on login button"); 
					
					return;  
				}
				
			}
			 
		}
	}
}

function onTopLayer(ele){

	if (!ele) 
		return false;
	var document = ele.ownerDocument;
	var inputWidth = ele.offsetWidth;
	var inputHeight = ele.offsetHeight;
	if (inputWidth <= 0 || inputHeight <= 0) return false;			//Elements that are on top layer must be visible.
	var position = $(ele).offset();
	var j;
	var score = 0;
	var maxHeight = (document.documentElement.clientHeight - position.top > inputHeight)? inputHeight : document.documentElement.clientHeight - position.top;
	var maxWidth = (document.documentElement.clientWidth > inputWidth)? inputWidth : document.documentElement.clientWidth - position.left;
	//Instead of deciding it on one try, deciding it on 10 tries.  This tackles some weird problems.
	for (j = 0; j < 10; j++)
	{
		score = this.isChildElement(ele,document.elementFromPoint(position.left+1+j*maxWidth/10, position.top+1+j*maxHeight/10)) ? score + 1 : score;
	}
	if (score >= 5) 
		return true;
	else 
		return false;
}

function isChildElement(parent, child){
	if (child == null) return false;
	if (parent == child) return true;
	if (parent == null || typeof parent == "undefined") return false;
	if (parent.children.length == 0) return false;
	var i = 0;
	for (i = 0; i < parent.children.length; i++)
	{
		if (this.isChildElement(parent.children[i],child)) return true;
	}
	return false;
}

//console.log("Script Loaded"); 
//executions

function execute(count) {
	if (findLoginForm() == false) {
		setTimeout(function() {findLoginButton(count); }, 500); 
	}
	else {
		clearInterval(interval); 
	}
}

var clickcount = 0; 
var interval = setInterval(function() {
	if (clickcount > 4) { 	
		clearInterval(interval); 
		self.port.emit("Failed to find login form after repeated clicks", ""); 
	}
	execute(clickcount);
	console.log("clickcount: " + clickcount); 

	clickcount++; 
	}, 
	1000); 
	








