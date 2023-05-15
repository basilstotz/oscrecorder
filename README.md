# OSCrecorder

## Objective
When one would like to record sceenes working with Open Sound Control there are two main issues:
- The OSC messages do not contain information of the used network parameters, such as the used ip address 
and port number.
- When using more than one OSC client (udp-sender), there is no way to synchronize the messages.



## Usage

### oscrecord
```
  usage: oscrecord [options] filename

options: --help,-h : show this message

         Reads osc messages on stdin and copy them to stdout.

         The messages are additionaly appended to <filename>.
         as an OSC bundle, using the current time as timetag.

         This file can be replayed with the same timing with oscplay.
```

### oscplay
```
  usage: oscplay [options] filename
       
options: --help,-h                : show this message
         --speed,-s <speed>       : replay speed (default: 1.0)

         Read osc messages from <filename> and write them, using the same timing
	 when recorded, to stdout.
```

### oscemit
```
  usage: orcemit [options] /route1[@path1] host1:port1 [[ /route2[@path2] host2:port2 ] ... ]

options: --help,-h    : displays this help message
         --verbose,-v : prints diagnostics

         Reads osc messages form stdin and sends the messages matching /route/path, 
         discarding the /route part, to host:port.
       
         The options are always saved in ~/.oscroute.json and are applied, when oscroute
         is called without arguments. It is possible to directly edit ~/.oscroute.json .

         The /route part or the @path part can be empty. Use a single / for a catch all 
         route.
```

### oscreceive
```
  usage: oscreceive [options] /route1:port1 [[ /route2:port2 ] ... ]

options: --help,-h    : displays this help message
         --verbose,-v : prints diagnostics

         Listen for osc messages on all given ports, adds the proper /route to the 
         address of the message and writes the message to stdout.
       
         The options are always saved in ~/.oscaddroute.json and are applied, when 
         oscaddroute is called without arguments. It is possible to directly 
         edit ~/.oscaddroute.json .

         The /route can be empty: Use  :port , when no route sould be added.
```
