package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"strconv"
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

	cmd_setup := `
set -e
adduser dummy >/dev/null 2>&1 << EOF
dummypass
dummypass
EOF

echo -e 'dummy\thard\tnproc\t2' >> /etc/security/limits.conf

chown dummy:dummy $(which wrapper)
chmod a+s $(which wrapper)
mkdir /IO
chmod 700 /IO
echo "done"`

	ret, err := exec.Command("sh", "-c", cmd_setup).CombinedOutput()
	if strings.TrimSpace(string(ret)) != "done" {
		fmt.Println("-9090\nUser manipulation command failed.",
			"Server Error. Aborting")
		fmt.Println(string(ret))
		os.Exit(1)
	}

	out, err := os.Create("/IO/config.json")
	check(err)
	defer out.Close()
	resp, err := http.Get(os.Args[1])
	check(err)
	defer resp.Body.Close()
	_, err = io.Copy(out, resp.Body)
	check(err)

	var rcfile Config
	str, _ := ioutil.ReadFile("/IO/config.json")
	json.Unmarshal(str, &rcfile)

	out, err = os.Create(rcfile.Filename)
	check(err)
	defer out.Close()
	resp, err = http.Get(os.Args[2])
	check(err)
	defer resp.Body.Close()
	_, err = io.Copy(out, resp.Body)
	check(err)

	quesUrl := string(os.Args[3])
	numInputs, err := strconv.Atoi(string(os.Args[4]))
	check(err)

	for i := 1; i <= numInputs; i++ {

		inp_name := quesUrl + "/inputs/" + strconv.Itoa(i)
		out_name := quesUrl + "/outputs/" + strconv.Itoa(i)

		out, err = os.Create("/IO/in" + strconv.Itoa(i))
		check(err)
		defer out.Close()
		resp, err = http.Get(inp_name)
		check(err)
		defer resp.Body.Close()
		_, err = io.Copy(out, resp.Body)
		check(err)

		out, err = os.Create("/IO/out" + strconv.Itoa(i))
		check(err)
		defer out.Close()
		resp, err = http.Get(out_name)
		check(err)
		defer resp.Body.Close()
		_, err = io.Copy(out, resp.Body)
		check(err)
	}

	command := `
set -e
ip link set eth0 down >/dev/null 2>&1
chown -R dummy:dummy $(pwd)
sync
echo "done"`

	ret, err = exec.Command("sh", "-c", command).CombinedOutput()
	if strings.TrimSpace(string(ret)) != "done" {
		fmt.Println("-9090\nUser manipulation command failed.",
			"Server Error. Aborting")
		fmt.Println(string(ret))
		os.Exit(1)
	}

	for i := 1; i <= numInputs; i++ {

		command = `
set -e
cp ` + "/IO/in" + strconv.Itoa(i) + ` ` + rcfile.Input + `
cp ` + "/IO/out" + strconv.Itoa(i) + ` ` + rcfile.Output + `
cp /IO/config.json ./config.json
chown -R dummy:dummy $(pwd)
sync
echo "done"`

		ret, err = exec.Command("sh", "-c", command).CombinedOutput()
		if strings.TrimSpace(string(ret)) != "done" {
			fmt.Println("-9090\nUser manipulation command failed.",
				"Server Error. Aborting")
			fmt.Println(string(ret))
			os.Exit(1)
		}

		cmd := exec.Command("wrapper")
		ret, err = cmd.CombinedOutput()
		if err != nil {
			fmt.Println(fmt.Sprint(err) + ": " + string(ret) + "----BARRIER----")
			break
		} else {
			fmt.Println(string(ret) + "----BARRIER----")
			if val, _ := strconv.Atoi(strings.Split(string(ret), "\n")[0]); val != 0 {
				break
			}
		}
	}

	// Cleaning up
	os.Remove("config.json")
	os.Remove(rcfile.Filename)
	os.Remove(rcfile.Input)
	os.Remove(rcfile.Output)
}
