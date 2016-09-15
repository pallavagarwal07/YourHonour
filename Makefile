.PHONY: wrapper

all: wrapper dockerfiles/*

dockerfiles/%: wrapper
	docker build -t pallavagarwal07/judge-$(*F) -f dockerfiles/$(*F) .
	docker push pallavagarwal07/judge-$(*F)

wrapper:
	cd wrapper; make;
