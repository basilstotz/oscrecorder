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

         Reads osc messages on stdin and writes them unaltered to stdout
         and to <filename>.
	 
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
  usage: oscemit [options] /route1[@path1] host1:port1 [[ /route2[@path2] host2:port2 ] ... ]

options: --help,-h                    : displays this help message
         --verbose,-v                 : prints diagnostics
	 --timeoffset,-t <timeoffset> : scedules messages <timeoffset> ms it the future [defalult=100]  

         Reads osc messages form stdin and sends the messages matching /route/path, 
         discarding the /route part, to host:port.
       
         The options are always saved in ~/.oscroute.json and are applied, when oscroute
         is called without arguments. It is possible to directly edit ~/.oscroute.json .

         The /route part or the @path part can be empty. Use a single / for a catch all 
         route.
```

### osclisten
```
usage: osclisten [options] port1[:/route1] [[ port2[:/route2] ] ... ]

options: -h, --help     : displays this help message
         -v, --verbose  : prints diagnostics
         -n, --nodelay  : do not delay bundles, pass them tru

         Listen for messages or arbitraly nested bundles on all given ports
         and writes all found messages as bundles to stdout.

         When a </route> is given, </route/> is prependend to each message.

         When a message is received, the current time will be used as timetag.
	 
         As default bundles are delayed, when the timetag lyes in the future,
         but when the option --nodelay is given the output is instantly.

         The options are always saved in ~/.osclisten.json and are applied, when
         oscaddroute is called without arguments. It is possible to directly
         edit ~/.osclisten.json .```

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
