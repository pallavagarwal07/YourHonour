var pg = {};

function langupdate() {
    pg.editor.getSession().setMode("ace/mode/" + pg.dict[pg.data[$("#sel2").val()]]);
    console.log("Set to " + "ace/mode/" + pg.dict[pg.data[$("#sel2").val()]]);
}

function setup() {
    var scripts = document.getElementsByTagName("script");
    pg.data = JSON.parse( eval(scripts[scripts.length - 1].innerHTML) );
    console.log(pg.data);
    pg.editor = ace.edit("editor");
    pg.editor.setTheme("ace/theme/chrome");
    pg.dict = {
        'c': 'c_cpp',
        'cpp': 'c_cpp',
        'go': 'golang',
        'java': 'java',
        'python2': 'python',
        'python3': 'python',
        'node': 'javascript'
    }
    pg.editor.getSession().setMode("ace/mode/" + pg.dict[pg.data[$("#sel2").val()]]);
    pg.textarea = $('#txt');
    pg.editor.getSession().on("change", function () {
        pg.textarea.val(pg.editor.getSession().getValue());
    });
    console.log("Set to " + "ace/mode/" + pg.dict[pg.data[$("#sel2").val()]]);
    $("#sel2").attr("onchange", "langupdate()");
}

$(setup);
