package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
)

func check(err error) {
	if err != nil {
		panic(err)
	}
}

type Config struct {
	Name        string
	Filename    string
	Compile     string
	Compile_cmd []string
	Execute     []string
	Timeout     int
	Output      string
	Input       string
}

func main() {

	os.Setenv("PATH", os.Getenv("PATH")+":.")

	if len(os.Args) < 5 {
		fmt.Println("Usage: ./setup <config_url> <code_url> <input_url>",
			"<output_url>")
		os.Exit(0)
	}
	out, err := os.Create("config.json")
	check(err)
	defer out.Close()
	resp, err := http.Get(os.Args[1])
	check(err)
	defer resp.Body.Close()
	_, err = io.Copy(out, resp.Body)
	check(err)

	var rcfile Config
	str, _ := ioutil.ReadFile("config.json")
	json.Unmarshal(str, &rcfile)

	out, err = os.Create(rcfile.Filename)
	check(err)
	defer out.Close()
	resp, err = http.Get(os.Args[2])
	check(err)
	defer resp.Body.Close()
	_, err = io.Copy(out, resp.Body)
	check(err)

	out, err = os.Create(rcfile.Input)
	check(err)
	defer out.Close()
	resp, err = http.Get(os.Args[3])
	check(err)
	defer resp.Body.Close()
	_, err = io.Copy(out, resp.Body)
	check(err)

	out, err = os.Create(rcfile.Output)
	check(err)
	defer out.Close()
	resp, err = http.Get(os.Args[4])
	check(err)
	defer resp.Body.Close()
	_, err = io.Copy(out, resp.Body)
	check(err)

	cmd := exec.Command("wrapper")
	var output bytes.Buffer
	cmd.Stdout = &output
	err = cmd.Run()
	check(err)
	fmt.Print(output.String())

	// Cleaning up
	os.Remove("config.json")
	os.Remove(rcfile.Filename)
	os.Remove(rcfile.Input)
	os.Remove(rcfile.Output)
}
