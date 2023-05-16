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
  usage: osclisten [options] port1[:/route1] [[ poert2[/route2] ] ... ]

options: --help,-h    : displays this help message
         --verbose,-v : prints diagnostics

         Listen for osc messages on all given ports, adds the proper /route to the 
         address of the message and writes the message to stdout.
       
         The options are always saved in ~/.oscaddroute.json and are applied, when 
         oscaddroute is called without arguments. It is possible to directly 
         edit ~/.oscaddroute.json .

         The /route can be empty: Use port , when no route sould be added.
```

## Examples
### Basic Usage

Listen on port 8008 for OSC messages and write then to stdout:

```osclisten 8008 ```

Listen on port 8008 for OSC messages and record the message on file ```record.osc```:

```osclisten 8008 | oscreord record.osc```

The messages are also written to stdout. This can be used for inspection or it can be piped to
```oscemit```:

```osclisten 8008 | oscreord record.osc | oscemit / 192.168.1.123:9000```

This will record the messages in file ```record.osc``` and additionaly send then to host
```192.168.1.123``` on port ```9000```.

To playback the recorded messages in file ```record.osc``` to host ```192.168.1.123``` 
on port ```9000``` use:

```oscplay record.osc | oscemit / 192.168.1.123:900```

### Advanced Usage

Listen on port ```8008```, add the route ```/ardour``` and listen on port ```800```, add the route ```/jadeo``` to the messages:
``` ```
