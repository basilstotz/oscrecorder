# OSCtools

## Objective

When one would like to record sceenes working with Open Sound Control there are two main issues:
- The OSC messages do not contain information of the used network parameters, such as the used ip address 
and port number.
- When using more than one OSC client (udp-sender), there is no way to synchronize the messages.



## Usage

### oscrecord

```
usage: oscrecord port [filename]

       Listen at <port> for osc-messages and dump them to stdout.
       When <filename> is given the messages, augmented with ablolute 
       and relative time information, are appended to <filename>.
       
       The saved file can be replayed with the same timing witch oscplay.
```

### oscplay
```
usage: oscfile filename
       
       Read osc-messages from <filename> and dump them, using the relative time 
       information, to stdout.
```

### oscroute

```
usage: orcroute /route1@path1 host1:port1 [[ /route2@path2 host2:port2 ] ... ]

       Reads osc-messages form stdin and sends the messages matching /route/path, 
       discarding the /route part, to host:port.
       
       The options are always saved in ~/.oscroute.rc and are applied, when oscroute
       is called without options. It is possible to directly edit ~/.oscroute.rc .

       THe /route part or the @path part can bei empty. Use a single "/" for a catch all route.
```





