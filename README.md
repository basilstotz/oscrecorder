# OSCrecorder

## Objective

When one would like to record sceenes working with Open Sound Control there are two main issues:
- The OSC messages do not contain information of the used network parameters, such as the used ip address 
and port number.
- When using more than one OSC client (udp-sender), there is no way to synchronize the messages.



## Usage

### oscrecord

```
usage:   oscrecord [options] port [filename]

options: --help,-h : show this message

         Listen at <port> for osc messages and write them to stdout.

         When <filename> is given the messages, augmented with ablolute 
         and relative time information, are appended to <filename>.
       
         This file can be replayed with the same timing using oscfile.
```

### oscplay
```
usage:   oscfile [options] filename
       
options: --help,-h                : show this message
         --speed,-s <speed>       : replay speed (default: 1.0)

         Read osc messages from <filename> and write them, using the same timing
	 when recorded, to stdout.
```

### oscroute

```
usage: orcroute [options] /route1[@path1] host1:port1 [[ /route2[@path2] host2:port2 ] ... ]

options: --help,-h    : displays this help message
         --verbose,-v : prints diagnostics

         Reads osc messages form stdin and sends the messages matching /route/path, 
         discarding the /route part, to host:port.
       
         The options are always saved in ~/.oscroute.json and are applied, when oscroute
         is called without arguments. It is possible to directly edit ~/.oscroute.json .

         The /route part or the @path part can be empty. Use a single / for a catch all 
         route.
```





