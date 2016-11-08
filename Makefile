.PHONY: wrapper clean

all: wrapper $(subst dockerfiles,build,$(wildcard dockerfiles/*))

build/%: dockerfiles/%
	mkdir -p build
	docker build -t pallavagarwal07/judge-$(*F) -f dockerfiles/$(*F) .
	docker push pallavagarwal07/judge-$(*F)
	touch build/$(*F)

wrapper:
	cd wrapper; make;

clean:
	rm -rf build
