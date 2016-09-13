all:
	cd wrapper; make;
	docker build -t pallavagarwal07/judge-gcc -f dockerfiles/gcc .
	docker push pallavagarwal07/judge-gcc
	docker build -t pallavagarwal07/judge-node -f dockerfiles/node .
	docker push pallavagarwal07/judge-node
