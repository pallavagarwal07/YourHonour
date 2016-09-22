arrayMappings = {};
arrayMappings[1] = '<a href="javascript:;" data-toggle="popover" title="Non Zero Exit Code" ADD_PROPERTY>NZEC</a>'
arrayMappings[0]  = '<a href="javascript:;" data-toggle="popover" title="Accepted" ADD_PROPERTY>AC</a>';
arrayMappings[-1] = '<a href="javascript:;" data-toggle="popover" title="Compiler Error" ADD_PROPERTY>CE</a>';
arrayMappings[-2] = '<a href="javascript:;" data-toggle="popover" title="Wrong Answer" ADD_PROPERTY>WA</a>';
arrayMappings[-3] = '<a href="javascript:;" data-toggle="popover" title="Runtime Error" ADD_PROPERTY>RE</a>';
arrayMappings[-4] = '<a href="javascript:;" data-toggle="popover" title="Time Limit Exceeded" ADD_PROPERTY>TLE</a>';

function populate() {
    $.get("/allsubmissions", function(data) {
        arr = JSON.parse(data);
        for(var i=arr.length-1; i>=0; i--) {
            id = arr[i];
            $('#tableBody').append("<tr id='"+id+"'><td>"+(i+1)+"</td><td>"+
                    id+"</td><td id='"+id+"-state'></td><td id='"+id+"-res'></td></tr>");
            payload = { 'id': id };
            update(id);
        }
    });
}

function update(id) {
    payload = { 'id': id, };
    $.get("/getstatus", payload, function(retData){
        states = JSON.parse(retData);
        data = states.state;
        $('#'+id+"-state").text(data);
        if(states.retCd != undefined) {
            var err;
            if(states.retCd > 0)
                err = arrayMappings[1]; 
            else
                err = arrayMappings[states.retCd];
            err = err.replace('ADD_PROPERTY', "data-placement='bottom' data-trigger='focus' data-html='true' data-content='<pre>"+states.messg.replace(/'/g, "`")+"</pre>'");

            console.log(err);
            $('#'+id+"-res").html(err);
            $(function(){ $('[data-toggle="popover"]').popover(); });
        }
        else
            setTimeout(update, 1000, [id]);
    });
}

$(populate);
$(function(){ $('[data-toggle="popover"]').popover(); });
