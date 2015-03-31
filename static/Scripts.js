var Sublist=[];
var Rctlist=[];
var tempsubl=[];

function sum(list){return list.reduce(function(a,b){return Number(a)+Number(b)},0)}

function substance(Name,concent,issource){
    this.Name=Name;
    this.concent=Number(concent);
    if (issource=='True'){
        this.issource=true;
    }else{
        this.issource=false;
    }
}

function source(Name,bconcent,pointed){
    bconcent = typeof bconcent !== 'undefined' ? bconcent:0.0;
    pointed = typeof pointed !== 'undefined' ? pointed:[];
    this.base=substance;
    this.base(Name,bconcent,'True');
    this.concent=Number(bconcent)+sum(pointed.map(function(x){Sublist[x]}));
    this.bconcent=bconcent;
    this.pointed=pointed
    this.update=function(){
        this.concent=this.bconcent+sum(this.pointed.map(function(x){Sublist[x]}));
    }
}

source.prototype=new substance;

function reaction(forward,backward,A1,A2,B){
    this.forward=forward;
    this.backward=backward;
    this.R1=A1;
    this.R2=A2;
    this.P=B;
}

function upstep(dt){
     dt = typeof dt !== 'undefined' ? dt : 0.001;
     console.log("called upstep time:"+dt.toString())

     var templ=Array.apply(null, new Array(Sublist.length)).map(Number.prototype.valueOf,0);
     for (rct in Rctlist){
        var rxn=Rctlist[rct];
        var ffwd=rxn.forward*Sublist[rxn.R1].concent*Sublist[rxn.R2].concent*dt;
        var fbck=rxn.backward*Sublist[rxn.P].concent*dt;
        var cc=ffwd-fbck;
        console.log(cc);
        templ[rxn.R1]-=cc;
        templ[rxn.R2]-=cc;
        templ[rxn.P]+=cc;
        console.log(templ);
     } 

     for (sub in Sublist){
        if (!Sublist[sub].issource){
            Sublist[sub].concent+=templ[sub];
            console.log(Sublist[sub].concent);
        }
     }
     for (sub in Sublist){
        if (Sublist[sub].issource){
            Sublist[sub].update();
        }
     }
     console.log("finished step")
     updatefeedsub();

}

function updatefeedrct(){
    console.log("rctfeed")
    var writeout="<table><tr><th>Reactant 1</th><th>Reactant 2</th><th>Product</th><th>Forward Rate</th><th>Backward Rate</th></tr>";
    for (var rct in Rctlist){
        writeout+="<tr><th>"+Sublist[Rctlist[rct].R1].Name+"</th><th>"+Sublist[Rctlist[rct].R2].Name+"</th><th>"+Sublist[Rctlist[rct].P].Name+"</th><th>"+Rctlist[rct].forward.toString()+"</th><th>"+Rctlist[rct].backward.toString()+"</th></tr>";
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
    writeout="<p>"
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
        alert("concentration not a number")
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
    $( "#addtosourcelist" ).click(function() {
        var toadd=$("#sourcedrop option:selected").index();
        if (toadd!==0 && !(tempsubl.indexOf(toadd-1) > -1)){
            tempsubl.push(toadd-1);
        }
        console.log(tempsubl);
        updatesourcelist();
    });

});