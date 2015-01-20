import subprocess, threading, time, os, psutil

profile = 0
p = 0
def kill_proc_tree(pid, including_parent=True):    
	parent = psutil.Process(pid)
	for child in parent.children(recursive=True):
		child.kill()
	if including_parent:
		parent.kill()
		
class Command(object):
	p = profile

	def __init__(self, cmd):
		self.cmd = cmd
		self.process = None

	def run(self, timeout):
		status = 0; 
		def target():
			print 'Thread started'
			self.process = subprocess.Popen(self.cmd, shell=True)
			self.process.communicate()
			print 'Thread finished'

		thread = threading.Thread(target=target)
		thread.start()

		thread.join(timeout)
		if thread.is_alive():
			print 'Terminating test prematurely'            
			me = self.process.pid
			kill_proc_tree(me)
			thread.join()
			status = 1; 
			return status; 
		#print self.process.returncode

start = 0
numsites = 10000; 
for x in range (start,numsites):
	currentwebsite = str(x)
	prof = str(x%5)
	commandline = 'cfx run -p test'+ prof + ' --static-args=\"{\\\"startnum\\\": \\\"' + currentwebsite + '\\\", \\\"logfile\\\": \\\"results.txt\\\" }\"'

	command = Command(commandline)
	print 'Starting to test', currentwebsite
	result = command.run(timeout=20)		
	print 'Finished testing', currentwebsite
	if (result == 1):
		time.sleep(5)
