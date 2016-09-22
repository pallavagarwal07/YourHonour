#include <bits/stdc++.h>
#include <chrono>
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <iostream>
#include <sys/time.h>
#include <sys/resource.h>
#include "../include/rapidjson/document.h"
#define dbg() fprintf(stdout, "%d\n", __LINE__);

using namespace std;
using namespace std::chrono;
using namespace rapidjson;

char *errors[24];
int PID;
int timeout = 0;

typedef struct ana {
    int retcode = -3;
    string fault_signal = "";
} analysis;

void init() {
    int i = 0;
    auto err = {"NOT_ERR", "SIGHUP",  "SIGINT", "SIGQUIT", "SIGILL",
                "SIGTRAP", "SIGABRT", "SIGBUS", "SIGFPE",  "SIGKILL",
                "SIGBUS",  "SIGSEGV", "SIGSYS", "SIGPIPE", "SIGALRM",
                "SIGTERM", "SIGURG",  "SIGSTOP"};

    for (auto &a : err)
        errors[i++] = (char *)a;
}

// trim from start
static inline string &ltrim(string &s) {
    s.erase(s.begin(),
            find_if(s.begin(), s.end(), not1(ptr_fun<int, int>(isspace))));
    return s;
}

// trim from end
static inline string &rtrim(string &s) {
    s.erase(
        find_if(s.rbegin(), s.rend(), not1(ptr_fun<int, int>(isspace))).base(),
        s.end());
    return s;
}

// trim from both ends
static inline string &trim(string &s) { return ltrim(rtrim(s)); }

int ctu = 0;
char *readFile(char *name) {
    int n;
    FILE *config = fopen(name, "r");
    char *buffer;

    fseek(config, 0L, SEEK_END);
    n = ftell(config);
    rewind(config);
    buffer = (char *)calloc(1, n + 1);
    fread(buffer, n, 1, config);

    return buffer;
}

analysis analyze(int status, bool compilation) {
    analysis report;

    if (WIFEXITED(status)) {
        report.retcode = WEXITSTATUS(status);
    } else {
        if (WIFSIGNALED(status)) {
            int sig = WTERMSIG(status);
            report.fault_signal = string(errors[sig]);
        } else {
            fprintf(stdout, "This should never be encountered.\n");
            exit(1);
        }
    }

    if (report.retcode == 0) {
        report.fault_signal = string(readFile("out"));
        return report;
    } else if (report.retcode != -3) {
        string strn;
        strn = "Process exited with Non-Zero Exit Code (NZEC)\n";

        if (compilation) {
            report.retcode = -1;
            report.fault_signal = string(readFile("err"));
        } else {
            report.fault_signal = "";
        }

        strn = report.fault_signal + strn;
        report.fault_signal = strn;
        return report;
    } else if (report.fault_signal == "SIGKILL") {
        if (timeout == 1) {
            string strn = "The process Time Limit was Exceeded.\n";
            report.retcode = -4;
            report.fault_signal = strn;
            return report;
        } else {
            string strn = "The Process crashed with SIGNAL SIGSEGV.\n";
            report.retcode = -3;
            report.fault_signal = strn;
            return report;
        }
    } else {
        assert(report.fault_signal != "");
        string strn = "Process crashed with SIGNAL ";
        strn += report.fault_signal;
        strn += "\n";
        report.fault_signal = strn;
        return report;
    }
}

void signalHandler(int signum) {
    int status;
    int ret = waitpid(PID, &status, WNOHANG);
    if (ret == 0) {
        kill(PID, SIGKILL);
        timeout = 1;
    }
}

int main() {
    init();

    int n, timeout;
    analysis report;
    report.retcode = 0;
    report.fault_signal = "";
    Document d;
    FILE *config;
    char *json;
    vector<char *> args;
    long double time_child = 0;

    json = readFile("config.json");

    d.Parse(json);
    timeout = d["timeout"].GetInt();
    Value &s = d["output"];
    char *filename = (char *)s.GetString();
    string contents = readFile(filename);
    remove(filename);
    remove("config.json");

    if (d["compile"].GetBool() == 1) {
        Value &s = d["compile_cmd"];
        for (auto &a : s.GetArray()) {
            args.push_back((char *)a.GetString());
        }
        if (fork() == 0) {
            int fd_out =
                open("out", O_WRONLY | O_CREAT | O_TRUNC, S_IRUSR | S_IWUSR);
            int fd_err =
                open("err", O_WRONLY | O_CREAT | O_TRUNC, S_IRUSR | S_IWUSR);

            if ((n = dup2(fd_out, 1)) < 0) {
                printf("Error :( %s\n", strerror(errno));
                exit(2);
            }

            if ((n = dup2(fd_err, 2)) < 0) {
                printf("Error :( %s\n", strerror(errno));
                exit(3);
            }

            char **arr = (char **)malloc((args.size() + 1) * sizeof(char *));
            for (int i = 0; i < args.size(); i++) {
                arr[i] = (char *)malloc(strlen(args[1]) + 1);
                strcpy(arr[i], args[i]);
            }
            arr[args.size()] = 0;
            execvp(arr[0], arr);
        } else {
            int status;
            waitpid(-1, &status, 0);
            report = analyze(status, true);
        }
    }

    args.clear();
    signal(SIGALRM, signalHandler);

    if (report.retcode == 0) {
        Value &s = d["execute"];

        for (auto &a : s.GetArray()) {
            args.push_back((char *)a.GetString());
        }

        milliseconds ms_start =
            duration_cast<milliseconds>(system_clock::now().time_since_epoch());
        if ((PID = fork()) == 0) {
            int fd_out =
                open("out", O_WRONLY | O_CREAT | O_TRUNC, S_IRUSR | S_IWUSR);
            int fd_err =
                open("err", O_WRONLY | O_CREAT | O_TRUNC, S_IRUSR | S_IWUSR);
            int fd_inp = open((char *)d["input"].GetString(), O_RDONLY);

            if ((n = dup2(fd_inp, 0)) < 0) {
                printf("Error :( %s\n", strerror(errno));
                exit(1);
            }

            if ((n = dup2(fd_out, 1)) < 0) {
                printf("Error :( %s\n", strerror(errno));
                exit(2);
            }

            if ((n = dup2(fd_err, 2)) < 0) {
                printf("Error :( %s\n", strerror(errno));
                exit(3);
            }

            char **arr = (char **)malloc((args.size() + 1) * sizeof(char *));
            for (int i = 0; i < args.size(); i++) {
                arr[i] = (char *)malloc(strlen(args[1]) + 1);
                strcpy(arr[i], args[i]);
            }
            arr[args.size()] = 0;

            execvp(arr[0], arr);
        } else {
            alarm(timeout);
            struct rusage usage;
            int status;
            int i = waitpid(-1, &status, 0);
            milliseconds ms_end = duration_cast<milliseconds>(
                system_clock::now().time_since_epoch());
            time_child = ((long double)(ms_end - ms_start).count()) / 1000.0;
            report = analyze(status, false);
        }
    }

    if (report.retcode == 0) {
        string our_outp = report.fault_signal;

        if (trim(contents) == trim(our_outp)) {
            report.fault_signal = "Submission was successful!\n";
        } else {
            report.retcode = -2;
            report.fault_signal = "Output of the program was incorrect.\n";
        }
    }

    cout << report.retcode << endl << "Time taken (sec): " << time_child << endl
         << string(report.fault_signal);
    fflush(stdout);

    // Clean up
    remove("err");
    remove("out");
    return 0;
}
