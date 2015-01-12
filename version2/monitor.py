import subprocess, threading, time

profile = 0
p = 0

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
			print 'Terminating process'            
			self.process.terminate()
			thread.join()
			status = 1; 
			return status; 
		print self.process.returncode

start = 3
numsites = 9999; 
for x in range (start,numsites):
	currentwebsite = str(x)
	prof = str(profile)
	commandline = 'cfx run -p test'+ prof + ' --static-args=\"{\\\"startnum\\\": \\\"' + currentwebsite + '\\\", \\\"logfile\\\": \\\"results.txt\\\" }\"'
	command = Command(commandline)
	result = command.run(timeout=7)
	if (result == 1):
		time.sleep(5)
