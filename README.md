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
   
options: -h, --help : show this message

         Reads lines from stdin and writes them unaltered to stdout
         and to <filename>.
```

### oscplay
```
  usage: oscplay [options] filename
       
options: -h, --help                : show this message
         -s, --speed <speed>       : replay speed (default: 1.0)
         -l, --loop                : loops forever
	 
         Read osc messages from <filename> and write them, using the same timing
	 when recorded, to stdout.
```

### oscemit
```
  usage: oscemit [options] /route1[@path1] host1:port1 [[ /route2[@path2] host2:port2 ] ... ]

options: -h, --help                    : displays this help message
         -v, --verbose                 : prints diagnostics
	 -t, --timeoffset <timeoffset> : scedules messages <timeoffset> ms it the future [defalult=100]  
         -m, --messages                : do not send bundles, do sen messages.
	 
         Reads messages or arbirarly nested bundles from stdin and sends all found messages 
	 matching /route/path, discarding the /route part, as bundles to host:port.
	 
	 Use a  "/ hostN:portN" (as the last argument) for a catch all route.
       
         The options are always saved in ~/.oscemit.json and are applied, when oscroute
         is called without arguments. It is possible to directly edit ~/.oscemit.json .
```

### osclisten
```
  usage: osclisten [options] port1[:/route1] [[ port2[:/route2] ] ... ]

options: -h, --help     : displays this help message
         -v, --verbose  : prints diagnostics
         -n, --nodelay  : do not delay bundles, pass them tru

         Listen for messages or arbitraly nested bundles on all given ports
         and writes all found messages as bundles to stdout. When a message
	 is received, the current time will be used as timetag.

         When a </route> is given, </route/> is prependend to the address on every 
	 message incomming at this port.

         As default bundles are delayed, when the timetag lyes in the future,
         but when the option --nodelay is given the output is instantly.

         The arguments are always saved in ~/.osclisten.json and are applied, when
         osclisten is called without arguments. It is possible to directly
         edit ~/.osclisten.json .
```

## Examples
### Basic Usage

Listen on port 8008 for OSC messages and write then to stdout:

```osclisten 8008 ```

The output can bu used for inspection or it can be piped to ```oscrecord```. 

```osclisten 8008 | oscreord record.osc```

This will listen on port 8008 for OSC messages and record the message on file ```record.osc```.
The messages are also written to stdout. This can be used for inspection or it can be piped to
```oscemit```:

```osclisten 8008 | oscreord record.osc | oscemit / 192.168.1.123:9000```

This will record the messages in file ```record.osc``` and additionaly send then to host
```192.168.1.123``` on port ```9000```.

To playback the recorded messages in file ```record.osc``` to host ```192.168.1.123``` 
on port ```9000``` use:

```oscplay record.osc | oscemit / 192.168.1.123:900```

### Install

#### Linux



#### MacOs


#### Android
