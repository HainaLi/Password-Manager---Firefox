debugger;  

var loginformid = "null"; 
var numclicks = 0; 
var nobuttonform = 0; 


function findLoginForm() {
	console.log("findLoginForm()"); 

	try {
		
		var forms_ = document.forms;
		
		var i = 0;
		var j = 0; 		
		
		for (i = 0; i < forms_.length; i++) {
			var ids = forms_.item(i).elements;
			for (j = 0; j < ids.length; j++) {
				var id = ids[j]; 
				if (id.type == "password") {
					loginformid = forms_.item(i).id; 
					console.log("from findloginform.js: " + loginformid); 
					if (loginformid == "") {
						console.log("No login form id"); 
						self.port.emit("no login form id", ""); 
						return; 
					}
					console.log("Login form found: " + loginformid);
					self.port.emit("findLoginForm.js to main.js: login form id", loginformid); 
					return true; 
				}
			}
			return false;  			
		}
		
	} 
	catch (err){
		console.log("Error finding forms"); 
	}
	
	return false; 

}

function findLoginButton() {
	console.log("findLoginButton()"); 
	var regexes = [/log[\s-_]?[io]n/gi, /sign[\s-_]?[io]n/gi];
	var possibleIds = []; 
	var idHash = {}; 
	var allElements = document.getElementsByTagName("*"); 
	for (var i = 0, n = allElements.length; i < n; ++i) { 
		if (allElements[i].hasAttribute("href")) {
			for (var j = 0; j < regexes.length; j++) {
				console.log(allElements[i].id); 
				if (allElements[i].innerHTML.match(regexes[j]) != null | allElements[i].id.match(regexes[j]) != null |allElements[i].getAttribute("href").match(regexes[j]) != null) {
					allElements[i].click();
					
					
					//self.port.emit("possible login buttons", ""); 
					return; 
				
				}
				
			}
		
		}
	}
	//self.port.emit("no possible login buttons", ""); 
	


}


if (findLoginForm() == false) {
	findLoginButton(); 
}  

/**
setTimeout(
	function(){
		console.log("entered setTimeout findLoginForm.js");
		findLoginForm(); 
		self.port.emit("no button/forms found", ""); 
	}, 15000);

**/





