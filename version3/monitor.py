import os
import signal



def timeout(timeout_duration=1):
    class TimeoutError(Exception):
        pass

    def handler(signum, frame):
        raise TimeoutError()

    # set the timeout handler
    signal.signal(signal.SIGALRM, handler) 
    signal.alarm(timeout_duration)
	
    try:
        #result = func(*args, **kwargs)
		os.system('cfx run -p test0')
    except TimeoutError as exc:
        #result = default
		print "TimeoutError"
    finally:
        signal.alarm(0)

    #return result
	
if __name__ == '__main__':
	timeout() 
