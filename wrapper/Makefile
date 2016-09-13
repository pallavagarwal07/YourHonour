OBJECTS=bin/main.o
FLAGS= -g
CC=g++ --std=c++11 -static

all: setup wrapper

setup: src/setup.go
	CGO_ENABLED=0 go build src/setup.go

wrapper: $(OBJECTS)
	$(CC) -o wrapper $(OBJECTS)

bin/%.o: src/%.cpp
	$(CC) -c $< -o $@ $(FLAGS)

clean:
	rm -f wrapper $(OBJECTS)
