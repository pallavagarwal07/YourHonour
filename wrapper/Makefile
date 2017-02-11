.PHONY: clean

OBJECTS=bin/main.o
FLAGS= 
CC=g++ --std=c++11 -static -g -rdynamic

all: setup wrapper

setup: src/setup.go
	CGO_ENABLED=0 go build src/setup.go

wrapper: $(OBJECTS)
	$(CC) -o wrapper $(OBJECTS) $(FLAGS)

bin/%.o: src/%.cpp
	mkdir -p bin
	$(CC) -c $< -o $@ $(FLAGS)

clean:
	rm -f wrapper $(OBJECTS)
