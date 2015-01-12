#!/usr/bin/python

f = open('top10k.txt', 'r')
fw = open('testList.txt', 'w')
while (1): 
	content = f.readline().replace("\n","")
	fw.write("'" + content + "',")
	


print content