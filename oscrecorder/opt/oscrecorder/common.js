const OSC = require('osc-js');
const fs = require('fs');
const { execSync } = require('child_process');



function exists(name){
    return fs.existsSync(name);
}
exports.exists = exists;
                                                                                                                                                                                              
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
exports.read=read;

function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}
exports.write=write;


function append(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'a'});
}
exports.append=append;


function shell(command){
    //console.log(args);                                                                                                                                                                                         
    let opts= { encoding: 'utf8' };
    return execSync(command,[], opts);
}
exports.shell=shell;

// functions for forEachMessage

function timestamp(timetag,milliseconds) {

    const SECONDS_70_YEARS = 2208988800;
    const TWO_POWER_32 = 4294967296.0;
 
    let seconds
 
    if (typeof milliseconds === 'number') {
      seconds = milliseconds / 1000
      const rounded = Math.floor(seconds)
 
      timetag.seconds = rounded + SECONDS_70_YEARS
      timetag.fractions = Math.round(TWO_POWER_32 * (seconds - rounded))
 
      return milliseconds
    }
 
    seconds = timetag.seconds - SECONDS_70_YEARS
    //orig: return (seconds + Math.round(timetag.fractions / TWO_POWER_32)) * 1000
    return Math.round((seconds + timetag.fractions / TWO_POWER_32) * 1000)
}
exports.timestamp=timestamp;


function bundleTimestamp(bundle,milliseconds){
	if(bundle.timetag.value){
            return timestamp(bundle.timetag.value,milliseconds);
	}else{
            return timestamp(bundle.timetag,milliseconds);
	}
}    
exports.bundleTimestamp = bundleTimestamp;

// the function forEachMessage(packet,callback) calls callback(message,timestamp) for
// each message found in packet. packet can be a message or an arbitray nested bundle. 
// when packet is a message the actual time will be used as timestamp.

function forEachMessage(packet,callback){
    if(packet.timetag){
	let timestamp = bundleTimestamp(packet);
        packet.bundleElements.forEach( (item) => {
            if(item.timestamp){
                forEachMessage(item,callback);
            }else{
                callback(item,timestamp);
            }
        });
    }else{
        callback(packet,new Date().getTime());
    }
}
exports.forEachMessage = forEachMessage;


function createMessage(message){
    let m= new OSC.Message(message.address);
    message.args.forEach( (arg) => { m.add(arg) });
    return m;
}
exports.createMessage = createMessage;

function createBundle(bundle){
    let b=new OSC.Bundle(bundleTimestamp(bundle));
    bundle.bundleElements.forEach( (item) => {
	if(item.timetag){
	    b.add(createBundle(item));
	}else{
	    b.add(createMessage(item));
	}
    });
    return b;
};
exports.createBundle = createBundle;    


/*
function serializeMessage(message){

    let m=JSON.parse(JSON.stringify(message));
    delete m.offset;
    return JSON.stringify(m);
}  
//exports.serializeMessage = serializeMessage;
*/

/*
{"timetag":{"seconds":3892649641,"fractions":38654976 },"bundleElements":[{"address":"/uhu","types":",i","args":[43]}]}             
*/


function beautifyPacket(packet){
    delete packet.offset;
    if(packet.timetag){
	if(packet.timetag.value)packet.timetag=packet.timetag.value;
	packet.bundleElements.forEach( (item) => {
	    if(item.timetag){
		//this is prob. correct!
		beautifyPacket(item);
	    }else{
		delete item.offset;
	    }
	})
    }
}

function serializePacket(packet){
    let p=JSON.parse(JSON.stringify(packet));
    beautifyPacket(p);
    return(JSON.stringify(p));
}
exports.serializePacket = serializePacket;


