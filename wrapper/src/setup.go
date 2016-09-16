package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"strings"
)

func check(err error) {
	if err != nil {
		fmt.Println(err)
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

	command := `
set -e
adduser dummy >/dev/null 2>&1 << EOF
dummypass
dummypass
EOF

ip link set eth0 down >/dev/null 2>&1
rm -f /sbin/ip /sbin/ifconfig /sbin/route /sbin/arp
echo "done"
	`
	ret, err := exec.Command("sh", "-c", command).CombinedOutput()
	if strings.TrimSpace(string(ret)) != "done" {
		fmt.Println("-9090\nUser manipulation command failed. Server Error. Aborting")
		os.Exit(1)
	}

	cmd := exec.Command("wrapper")
	ret, err = cmd.CombinedOutput()
	if err != nil {
		fmt.Println(fmt.Sprint(err) + ": " + string(ret))
	} else {
		fmt.Println(string(ret))
	}

	// Cleaning up
	os.Remove("config.json")
	os.Remove(rcfile.Filename)
	os.Remove(rcfile.Input)
	os.Remove(rcfile.Output)
}
