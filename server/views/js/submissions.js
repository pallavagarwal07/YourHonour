arrayMappings = {};
arrayMappings[1] = '<a href="javascript:;" title="Non Zero Exit Code" ADD_PROPERTY>NZEC</a>'
arrayMappings[0]  = '<a href="javascript:;" title="Accepted" ADD_PROPERTY>AC</a>';
arrayMappings[-1] = '<a href="javascript:;" title="Compiler Error" ADD_PROPERTY>CE</a>';
arrayMappings[-2] = '<a href="javascript:;" title="Wrong Answer" ADD_PROPERTY>WA</a>';
arrayMappings[-3] = '<a href="javascript:;" title="Runtime Error" ADD_PROPERTY>RE</a>';
arrayMappings[-4] = '<a href="javascript:;" title="Time Limit Exceeded" ADD_PROPERTY>TLE</a>';

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
    console.log(JSON.stringify("here"));
    $.get("/getstatus", payload, function(retData){
        states = JSON.parse(retData);
        data = states.state;
        $('#'+id+"-state").text(data);
        if(states.lists != undefined) {
            var err, err2;
            if(states.retCd > 0) {
                err = arrayMappings[1]; 
            } else {
                console.log(JSON.stringify(states));
                err = arrayMappings[states.lists[states.lists.length-1].retCd];
            }

            var msglist = '<div class="list-group" style="margin-bottom: 0px">';

            for(var i = 0; i < states.lists.length; i++) {
                err2 = arrayMappings[states.lists[i].retCd];
                console.log("Err2 is:");
                console.log( arrayMappings[states.lists[i].retCd] );
                err2 = err2.replace('ADD_PROPERTY>', 'class="list-group-item" data-placement="bottom" data-toggle="popover"' +
                        'data-trigger="focus" data-html="true" data-content="<pre>' +
                        states.lists[i].messg.replace(/'/g, "`") + '</pre>"> Test Case '+(i+1)+': ');
                msglist +=  err2 ;
                console.log(msglist);
            }

            msglist += '</div>';

            console.log(msglist);
            err = err.replace('ADD_PROPERTY', " id='"+id+"-ln' ");
            $('#'+id+"-res").html(err);
            $('#'+id+'-ln').click(function(msglist) { return function(){
                $('#myModal .modal-content').html(msglist);
                $('#myModal').modal('show');
                $(function(){ $('[data-toggle="popover"]').popover(); });
            } }(msglist));
            $(function(){ $('[data-toggle="popover"]').popover(); });
        }
        else
            setTimeout(update, 1000, id);
    });
}

$(populate);
$(function(){ $('[data-toggle="popover"]').popover(); });
