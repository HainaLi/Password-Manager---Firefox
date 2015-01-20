#!/usr/bin/python

import numpy as np
import os

#important variables
indices = []; 
siteurl = []; 
forminfo = []; 
formaction = []; 
isFormActionHTTPS = []; 
postURL = []; 
post_matches_action = []; 
nodecryption = []; 

failedtofindstring = "Failed to find login form after repeated clicks"; 

notfindloginstring = 0; 
numHTTPS = 0; 
num_post_matches_action = 0; 
num_success = 0; 
useronly = 0; 
passwordonly = 0; 

#load contents of file
fw = open('analyzedresult.txt', 'w')

with open('results_1_20_15.txt') as f:
	line = f.readlines()

for website in line:
	webinfo = website.split(",")
	indices.append(webinfo[0])
	siteurl.append(webinfo[1])
	forminfo.append(webinfo[2])
	formaction.append(webinfo[3])
	isFormActionHTTPS.append(webinfo[4])
	postURL.append(webinfo[5])
	post_matches_action.append(webinfo[6])
	nodecryption.append(webinfo[7])

	if (webinfo[2].find(failedtofindstring)!=-1):
		notfindloginstring = notfindloginstring + 1; 
	if (webinfo[4] == "1"):
		numHTTPS = numHTTPS + 1; 
	if ((webinfo[6] == "1") & (webinfo[5] != "")):
		num_post_matches_action = num_post_matches_action + 1;
	if (webinfo[7] == "1\n"):
		num_success = num_success + 1; 
	if (webinfo[7] == "2\n"):
		useronly = useronly + 1; 
	if (webinfo[7] == "3\n"):
		passwordonly = passwordonly + 1; 
		
		
numnotdie = float(len(indices))
numtested = float(indices[len(indices)-1])
foundloginform = numnotdie-notfindloginstring
numHTTPS = float(numHTTPS)
num_post_matches_action = float(num_post_matches_action)
num_success = float(num_success)
useronly = float(useronly)
passwordonly = float(passwordonly)

print "Number of websites successfully tested:", numnotdie, "out of",numtested, ", percentage:", numnotdie/numtested
print "Found Login forms:", foundloginform, "out of", numnotdie, ", percentage:", (foundloginform)/numnotdie
print "Form Action is HTTPS:", numHTTPS, "out of", foundloginform, ", percentage:", numHTTPS/foundloginform
print "Post matches Action URL:", num_post_matches_action, "out of", foundloginform, ", percentage:", num_post_matches_action/foundloginform
print "Successful dummy insertion:", num_success, "out of", foundloginform, ", percentage:", num_success/foundloginform
print "Username only:", useronly, "out of", foundloginform, ", percentage:", useronly/foundloginform
print "Password only:", passwordonly, "out of", foundloginform, ", percentage", passwordonly/foundloginform
