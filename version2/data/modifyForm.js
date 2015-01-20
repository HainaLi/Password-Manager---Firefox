

debugger;  
var user = 0; 
var password = 0; 
var formChanged = 0; 
var actionChanged = 0; 
var dummyInserted = 0; 
var trafficIntercepted = 0; 
var submitbuttondetected = 0;
var clicked = 0; 
var dummyUser = "dummyUserName@gmail.com";
var dummyPass = "dummyPassword"; 
var actualUser = "ActualUser"; 
var actualPass = "ActualPass"; 


var usernameid = ''; 
var passwordid = '';
var loginFormid = ''; 
var submitbuttonid = '';





self.port.on("loginformid found", function(message){
	
	setIds(message); 
}); 

function setIds(loginformid) {
	console.log("modifyForm.js: setIds"); 
	var regexes = [/user/gi, /name/gi, /email/gi];
	loginFormid = loginformid; 
	
	var formelements = document.getElementById(loginformid).elements; 
	for (var i = 0; i < formelements.length; i++) {
		var currentid = ""; 
		var currentplaceholder = ""; 
		if (formelements[i].hasAttribute("id")) { //"" means has id, but empty string
			currentid = formelements[i].id; 
			console.log("currentid: " + currentid); 
		}
		else {
			var attr = document.createAttribute("id"); 
			attr.value = "";
			formelements[i].setAttributeNode(attr);
			currentid = ""; 
		}
		
		if (formelements[i].hasAttribute("placeholder")) {
			currentplaceholder = formelements[i].placeholder; 
		}
		else {
			currentplaceholder = ""; 
		}
		
		for (var j = 0; j < regexes.length; j++) {
			if ((currentid.match(regexes[j]) != null) || (currentplaceholder.match(regexes[j]) != null)) {
				usernameid = currentid;  
				if (usernameid == "") {
					usernameid = "usernameid123"; 
					formelements[i].id = usernameid; 
				}
				if (document.getElementById(usernameid).hasAttribute("autocomplete")) {
					document.getElementById(usernameid).autocomplete = "on"; 
				}
				break; 
			}
		}
		
		if (!(formelements[i].hasAttribute("type"))) {
			continue; 
		}
		
		if (formelements[i].type == "password") {
			passwordid = currentid; 
			if (passwordid == "") {
				passwordid = "passwordid123"; 
				formelements[i].id = passwordid; 
			}
			console.log("modifying form password id: " + passwordid); 
			if (document.getElementById(passwordid).hasAttribute("autocomplete")) {
				document.getElementById(passwordid).autocomplete = "on"; 
			}
		}
		if (formelements[i].type == "submit") {
			submitbuttonid = currentid; 
			if (submitbuttonid == "") {
				submitbuttonid = "submitbuttonid123"; 
				formelements[i].id = submitbuttonid; 
			}
		}
	}
	self.port.emit("login form ids", loginFormid+usernameid+passwordid+submitbuttonid); 
	console.log(usernameid + passwordid + submitbuttonid); 
	if (usernameid != "" & passwordid != "" & submitbuttonid != "") {
		run(); 
	}
	
}

function clearCache() {

	chrome.runtime.sendMessage({greeting: "Clear Cache"}, function(response) {
	  console.log(response.farewell);
	});
}
function checkUserPasswdField() { //returns true if the password and username fields are found
	if (document.querySelector("#" + usernameid) != null ) {
		user = 1; 
		console.log("username field found"); 
	}
	else {
		//console.log("username field not found"); 
	}
	
	if (document.querySelector("#" + passwordid) != null ) {
		password = 1; 
		console.log("password field found"); 
	}
	else {
		//console.log("password field not found"); 
	}
	
	if (user == 1 & password == 1) {
		return true; 
	}
	else {
		return false; 
	}
	
} 

function changeAction() { //of the sign in submit button
	if (user == 1 & password == 1) {
		actionChanged = 1;
		jQuery("#" + loginFormid).attr('action', 'https://localhost'); 	
	}
	else {
		return false; 
	}

} 
 
function blockSignInForm() {
	if (user == 1 & password == 1) {
		console.log("Changing Login Form");
		jQuery("#" + usernameid).hide(); 
		jQuery("#" + loginFormid).prepend("<h2>Your Username and Password Have Been Saved By Password Manager</h2>"); 
		jQuery("#" + passwordid).hide(); 
		jQuery("#" + loginFormid).prepend("<h2>Please Press Login to Continue</h2>"); 
		formChanged = 1; 
		return true; 
	}
	else {
		return false; 
	}

}

function insertDummy() {
	console.log("modifyForm.js: insertDummy()"); 
	if (formChanged == 1) {
		console.log("Inserting dummy username and password");
		document.getElementById(usernameid).value = dummyUser; 
		document.getElementById(passwordid).value = dummyPass; 
		dummyInserted = 1; 
		user = 0;
		password = 0; 
		
		document.querySelector("#" + submitbuttonid).addEventListener('click', function() {
			submitbuttondetected = 1; 
			interceptPost(); 
			//alert("submit button click detected!"); 
		}, false); 
		return true; 
	}
	
	else {
		return false; 
	}

}

function getAction() {

	if(document.getElementById(loginFormid).hasAttribute("action") == "false") {
		console.log("hasAttribute action returned false"); 
		self.port.emit("form doesn't have action",""); 
		return; 
	}

	if (document.getElementById(loginFormid).action.indexOf("https://") != -1){
		//sent through https 
		self.port.emit("form action is https", document.getElementById(loginFormid).action);
	}
	else {
		self.port.emit("form action is NOT https", document.getElementById(loginFormid).action);
		
	}

}
function interceptPost() {

	if (dummyInserted == 1 & submitbuttondetected == 1) {
		console.log("Intercepting Post"); 
		self.port.emit("Intercept Post Request", "Intercept Post Request"); 
		
		
		trafficIntercepted = 1; 
		return true; 
	}
	else {
		return false; 
	}
}
 
function clickSubmit() {
	if (dummyInserted == 1 & clicked == 0) {
		jQuery("#" + submitbuttonid).click(); 
		clicked = 1; 
		return true; 
	}
	else {
		return false; 
	}

}


function run() {	
	checkUserPasswdField(); 
	blockSignInForm(); 
	getAction(); 
	insertDummy();
	clickSubmit(); 
}
