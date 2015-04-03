var Sublist=[];
var Rctlist=[];
var tempsubl=[];

function sum(list){return list.reduce(function(a,b){return Number(a)+Number(b)},0)}

function arrayMin(arr) {
  var len = arr.length, min = Infinity;
  while (len--) {
    if (arr[len] < min) {
      min = arr[len];
    }
  }
  return min;
};

function arrayMax(arr) {
  var len = arr.length, max = -Infinity;
  while (len--) {
    if (arr[len] > max) {
      max = arr[len];
    }
  }
  return max;
};

function substance(Name,concent,issource){
    this.Name=Name;

    this.concenti=Number(concent);
    this.concent=this.concenti
    if (issource=='True'){
        this.issource=true;
    }else{
        this.issource=false;
    }
}

function source(Name,bconcent,pointed){
    bconcent = typeof bconcent !== 'undefined' ? bconcent:0.0;
    pointed = typeof pointed !== 'undefined' ? pointed:[];
    bconcent = bconcent == "" ? 0.0:Number(bconcent)
    this.base=substance;
    this.base(Name,bconcent,'True');
    console.log(pointed);
    console.log(bconcent);
    this.concent=Number(bconcent)+sum(pointed.map(function(x){return Sublist[x].concent}));
    console.log(this.concent)
    this.bconcent=Number(bconcent);
    this.pointed=pointed;
}

source.prototype=new substance;
function reaction(forward,backward,A1,A2,B){
    this.forward=forward;
    this.backward=backward;
    this.R1=A1;
    this.R2=A2;
    this.P=B;
}

function resetstate(){
    for (sub in Sublist){
        Sublist[sub].concent=Sublist[sub].concenti;
    }
    updatesource();
}

function updatesource(){
    for (sub in Sublist){
        if (Sublist[sub].issource){
            Sublist.concent=Sublist.bconcent+sum(Sublist[sub].pointed.map(function(x){return Sublist[x].concent}));
        }
     }
}

function updateall(){
    //to be used only for input
    updatefeedsub();
    updatefeedrct();
    updatedrop();
}

function upstep(dt,showstuff){
     dt = typeof dt !== 'undefined' ? dt : 0.001;
     showstuff = typeof showstuff !== 'undefined' ? true : false;
     //console.log("called upstep time:"+dt.toString())
     var error;
     var templ=Array.apply(null, new Array(Sublist.length)).map(Number.prototype.valueOf,0);
     for (rct in Rctlist){
        var rxn=Rctlist[rct];
        var ffwd=rxn.forward*Sublist[rxn.R1].concent*Sublist[rxn.R2].concent*1.0;
        var fbck=rxn.backward*Sublist[rxn.P].concent*1.0;
        var cc=ffwd-fbck;
        //console.log(cc);
        templ[rxn.R1]-=cc;
        templ[rxn.R2]-=cc;  
        templ[rxn.P]+=cc;
        //console.log(templ);
     } 
     var indicator1=sum(templ.map(function(x){return Math.pow(x,2)}));
     for (sub in Sublist){
        if (!Sublist[sub].issource){
            Sublist[sub].concent+=templ[sub]*dt;
            //console.log(Sublist[sub].concent);
        }
     }

    updatesource();
     var templ=Array.apply(null, new Array(Sublist.length)).map(Number.prototype.valueOf,0);
     for (rct in Rctlist){
        var rxn=Rctlist[rct];
        var ffwd=rxn.forward*Sublist[rxn.R1].concent*Sublist[rxn.R2].concent;
        var fbck=rxn.backward*Sublist[rxn.P].concent;
        var cc=ffwd-fbck;
        //console.log(cc);
        templ[rxn.R1]-=cc;
        templ[rxn.R2]-=cc;
        templ[rxn.P]+=cc;
        //console.log(templ);
     } 

     var indicator2=sum(templ.map(function(x){return Math.pow(x,2)}));
     //console.log("finished step")
     //updatefeedsub();
     //console.log(indicator1);
     //console.log(indicator2);
     return [Math.abs(indicator1-indicator2)/indicator1,indicator1]
}

function graph(data){

    console.log("called graph")

    document.getElementById("graphs").innerHTML=""
    var n=data.length
    //switching to Flot!!!
    var dlist=[];
    for (var i=0;i<Sublist.length;i++){
        dlist.push({label:Sublist[i].Name, data:data.map(function(d){return [d[0],d[i+1]]}), lines: { show: true, fill: false}})
    }
    $.plot($("#graphs"), dlist)
    console.log("over");
    return dlist
}


function state(i){
    var ret=Sublist.map(function(Sub){return Sub.concent});
    ret.unshift(i);
    return ret
}

function Simulate(n,dt){
    console.log("sim")
    document.getElementById("graphs").innerHTML="<span>loading...</span>"
    dt = typeof dt !== 'undefined' ? dt : 1; //max dt
    n = typeof n !== 'undefined' ? n : 10000; 
    var data=[];
    console.log(n)
    console.log(dt)
    console.log("started calculation")
    console.log(state(0));
    var timesim=0.0;
    var step=0.00001;
    console.log("step: "+step)
    var a;
    var startvalue;
    var test=1;
    for (var i=0; i<n; i++){
        //console.log(state(i));
        
        data.push(state(timesim));
        a=upstep(step);
        if (i==1){
            startvalue=a[1];
        }
        timesim+=step;
        if (a[0]<0.001 && 2*step<dt){
            step=2*step;
            //console.log("step: "+step)
        }else if (a[0]>0.01 && step/2 > 0.00001){
            step=step/2;
            //console.log("step: "+step)
        }
        if (a[1]/startvalue<0.001 && i>1000){
            console.log("quit")
            console.log(i)
            break;
        }
        if (i%500==0 && test==1){
            console.log(state(i));
            console.log(a[0]/startvalue)
            console.log(a[1])
            console.log(timesim)
        }

    }

    return data;
}


function cleandata(data){
    //cleans data to <1000 pts
    var time=0;
    var out=2000;
    var step=data[data.length-1][0]/out;
    var ret=[];
    console.log(step);
    for (var i=0;i<data.length-1;i++){
        if (data[i][0]>time){
            ret.push(data[i])
            time=data[i][0]+step
        }
    }
    console.log(ret[0])
    console.log(ret[100])
    return ret
}

function updatefeedrct(){
    console.log("rctfeed")
    var writeout="<table><tr><th>Reactant 1</th><th>Reactant 2</th><th>Product</th><th>Forward Rate</th><th>Backward Rate</th></tr>";
    for (var rct in Rctlist){
        writeout+="<tr><th>"+Sublist[Rctlist[rct].R1].Name+"</th><th>"+Sublist[Rctlist[rct].R2].Name+"</th><th>"
        writeout+=Sublist[Rctlist[rct].P].Name+"</th><th>"+Rctlist[rct].forward.toString()+"</th><th>"+Rctlist[rct].backward.toString()+"</th></tr>";
    }
    
    writeout+="</table>";
    document.getElementById("rcttext").innerHTML = writeout;
}


function updatefeedsub(){
    console.log("subfeed")
    var writeout="<table><tr><th>Name</th><th>Concentration</th><th>Source</th></tr>";
    for (var sub in Sublist){
        writeout+="<tr><th>"+Sublist[sub].Name+"</th><th>"+Sublist[sub].concent+"</th><th>"+Sublist[sub].issource.toString()+"</th></tr>";
    }
    writeout+="</table>";
    document.getElementById("subtext").innerHTML = writeout;
}


function updatedrop(){
    var writeout="<option selected=\"selected\">(Select)</option>"
    for (var sub in Sublist){
        writeout+="<option value=\"sub_"+sub.toString()+"\">"+Sublist[sub].Name+"</option>";
    }

    document.getElementById("selectR1").innerHTML = writeout;
    document.getElementById("selectR2").innerHTML = writeout;
    document.getElementById("selectP").innerHTML = writeout;
    document.getElementById("sourcedrop").innerHTML=writeout;
}
function clearinputsub(){
    console.log("clearsub")
    var x = document.forms["substance_input"];
    x.issource.checked=false;
    x.Name.value="";
    x.concent.value="";
    tempsubl=[];
}
function clearinputrct(){
    console.log("clearrct");
}

function sourcebox(){
    console.log("source");
}

function updatesourcelist(){
    var writeout="<p>"
    for (var sub in tempsubl){
        writeout+=String(Sublist[tempsubl[sub]].Name);
        writeout+=", "
    }
    writeout+="</p>"
     document.getElementById("sourcelist").innerHTML = writeout;
}

function SubstanceSubmit() {
    var x = document.forms["substance_input"];
    if (isNaN(x.concent.value)){
        alert("Concentration not a number")
        return false;
    }
    if (x.Name.value == ""){
        alert("Please enter a name")
        return false;
    }
    if (x.issource.checked){
        var sub=new source(x.Name.value,x.concent.value,tempsubl);
    }else{
        var sub=new substance(x.Name.value,x.concent.value,"False");
    }
    console.log(sub);
    Sublist.push(sub);
    clearinputsub();
    updatefeedsub();
    updatedrop();
    updatesourcelist();
    return false;
}

function ReactionSubmit(){
    var x1 = document.getElementById("selectR1");
    var x2 = document.getElementById("selectR2");
    var x3 = document.getElementById("selectP");
    var x = document.forms["reaction_input"];
    var k1 = x.forwardrate.value;
    var k2 = x.backwardrate.value;

    var input1 = x1.selectedIndex
    var input2 = x2.selectedIndex;
    var input3 = x3.selectedIndex;
    console.log(k1);
    if (input1==0 || input2==0 || input3==0){
        alert("invalid input for reaction")
        return false;
    }else if(isNaN(k1)||isNaN(k2)){
        alert("invalid rates")
        return false;
    }else{
        var rct=new reaction(Number(k1),Number(k2),input1-1,input2-1,input3-1);
    }
    console.log(rct);
    Rctlist.push(rct);
    clearinputrct();
    updatefeedrct();
    return false;
}



$(function(){
    //jquery shit
    console.log("loaded page");
    $( "#hidden" ).hide();
    $( "#hidden2" ).hide();
    if ( $('#hidden').html() !== "[]" ) {
        console.log($('#hidden').html())
        var json = $( "#hidden" ).html()
        var obj = JSON.parse(json);
        if (typeof obj.S !== "undefined"){
            console.log(obj);
            Sublist=obj.S;
            Rctlist=obj.R;
            console.log("trying to update")
            updateall();
        }if (typeof obj.S !== "undefined"){
            console.log(obj);
            Sublist=obj.S;
            Rctlist=obj.R;
            console.log("trying to update")
            updateall();
        }
    }
    if ($('#hidden2').html()!="None") {
        console.log("hid2")
        console.log($('#hidden2').html())
        if ($('#hidden2').html()=="true"){
            var data=cleandata(Simulate(10000));       
            $("#graphs").width(600);
            $("#graphs").height(300);
            console.log("tograph")
            graph(data);
            resetstate();

        }
    }
    
    $( "#addtosourcelist" ).click(function() {
        console.log("source")
        var toadd=$("#sourcedrop option:selected").index();
        if (toadd!==0 && !(tempsubl.indexOf(toadd-1) > -1)){
            tempsubl.push(toadd-1);
        }
        console.log(tempsubl);
        updatesourcelist();
    });
    $( "#upload_data" ).click(function() {
        console.log("pressed upload");
        var pdata={S:Sublist,R:Rctlist};
        console.log(pdata);
        console.log(JSON.stringify(pdata));
        $('#link').text("generating url, if this takes too long an error probably has occurred but I can't catch it so try again later")
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: JSON.stringify(pdata),
            contentType: "application/json; charset=utf-8",
            dataType: "text",
            success: function(result) {
                console.log("server says");
                console.log(result);
                var write="Your URL is /permalink/"+result
                $('#link').text(write)
            }
        });

    });
    $( "#simulate" ).click(function() {
        console.log("pressed GO");
        var data=cleandata(Simulate(6000));       
        $("#graphs").width(600);
        $("#graphs").height(300);
        console.log("tograph")
        var graphdata=graph(data);
        //for debug
        /*$.ajax({
            url: '/graphdata',
            type: 'POST',
            data: JSON.stringify(graphdata),
            contentType: "application/json; charset=utf-8",
            dataType: "text",
            success: function(result) {
            }
        });*/
        resetstate();

    });
    
});
