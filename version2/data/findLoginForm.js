debugger;  

var loginformid = "null"; 
var numclicks = 0; 
var nobuttonform = 0; 
var depth = 0; 
var alreadyClicked = []; 
var candidates = []; 

function findLoginForm() {
	console.log("findLoginForm()"); 

	try {
		
		var forms_ = document.forms;
		
		var i = 0;
		var j = 0; 		
		
		console.log("findLoginForm() first method: searching for element with type 'password' in all the forms.")
		for (i = 0; i < forms_.length; i++) {
			var ids = forms_.item(i).elements;
			for (j = 0; j < ids.length; j++) {
				var id = ids[j]; 
				console.log("id type: " + id.type); 
				if (id.type == "password") {
					loginformid = forms_.item(i).id; 
					console.log("from findloginform.js: " + loginformid); 
					if (loginformid == "") {
						console.log("First method: Password element found, but no login form id"); 
						//self.port.emit("Password element found, but no login form id", ""); 
						return; 
					}
					console.log("first method: Login form found: " + loginformid);
					self.port.emit("findLoginForm.js to main.js: login form id", loginformid); 
					return true; 
				}
			}
			return false;  			
		}
		//self.port.emit("No elements with type 'password'" + "");
		console.log("First method: No elements with type 'password'"); 
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
	} 
	catch (err){
		console.log("Error finding forms"); 
	}
	
	return false; 

}

function findLoginButton() {
	console.log("findLoginButton()"); 
	var regexes = [/log[\s-_]?[io]n/gi, /sign[\s-_]?[io]n/gi];
	var allElements = document.getElementsByTagName("*"); 		
	for (var i = 0, n = allElements.length; i < n; ++i) { 
		if (allElements[i].hasAttribute("href")) {
			for (var j = 0; j < regexes.length; j++) {
				console.log(allElements[i].id); 
				if (allElements[i].innerHTML.match(regexes[j]) != null | allElements[i].id.match(regexes[j]) != null |allElements[i].getAttribute("href").match(regexes[j]) != null) {
					allElements[i].click();
					return; 
				
				}
				
			}
		
		}
	}
}


if (findLoginForm() == false) {
	for (var i = 0; i < 3; i++) {
		findLoginButton(); 
	}
}  







