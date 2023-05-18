const OSC = require('osc-js');
//const {Timetag} = require( 'osc-js/src/atomic/timetag.js');

exports.getTime = function(bundle){
    const SECONDS_70_YEARS = 2208988800;
    const TWO_POWER_32 = 4294967296;

    let timetag;
    if(bundle.timetag.value){
	timetag=bundle.timetag.value;
    }else{
	timetag=bundle.timetag;
    }

    let seconds = timetag.seconds - SECONDS_70_YEARS;
    return (seconds + Math.round(timetag.fractions / TWO_POWER_32)) * 1000;
}

exports.getTime2 = function(bundle){
    
    let timetag;
    if(bundle.timetag.value){
	timetag=bundle.timetag.value;
    }else{
	timetag=bundle.timetag;
    }

    let t = new OSC.Timetag(timetag);
    return t.timestamp();
}



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

/*
{"address":"/uhu","types":",i","args":[43] }             
*/


function forEachMessage(packet,callback){
    if(packet.timetag){
	let time;
	if(packet.timetag.value){
            time=timestamp(packet.timetag.value);
	}else{
            time=timestamp(packet.timetag);
	}
        packet.bundleElements.forEach( (item) => {
            if(item.timestamp){
                forEachMessage(item,callback);
            }else{
                callback(item,time);
            }
        });
    }else{
        callback(packet,new Date().getTime());
    }
}


exports.forEachMessage = forEachMessage;


exports.createMessage = function(message){
    let m= new OSC.Message(message.address);
    message.args.forEach( (arg) => { m.add(arg) });
    return m;
}

exports.serializeMessage = function(message){
    delete message.offset;
    return JSON.stringyfy(message);
}  

/*
{"timetag":{"seconds":3892649641,"fractions":38654976 },"bundleElements":[{"address":"/uhu","types":",i","args":[43]}]}             
*/

exports.createBundle = function(bundle){
    let b=new OSC.Bundle(getTime(bundle));
    bundle.bundleElements.forEach( (item) => {
	if(item.timetag){
	    b.add(createBundle(item));
	}else{
	    b.add(createMessage(item));
	}
    });
    return b;
};
    

/*
exports.serializeBundle = function(bundle){                                                                                                                    
    delete bundle.offset;
    bundle.timetag=bundle.timetag.value;
    bundle.bundleElements.forEach( (item) => {
	if(item.timetag){
	    serializeBundle(item);
	}else{
	    serializeMessage(item);
	}
    }
		return(JSON.stringify(bundle));
				   
				 }
    
*/
