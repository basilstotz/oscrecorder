# OSCtools

## oscreceive

```
usage: oscreveive port [filename]

       Listen at <port> for osc-messages and dump them to stdout.
       When <filename> is given the messages, augmented with ablolute 
       and relative time information, are appended to <filename>.
```

## oscfile
```
usage: oscfile filename
       
       Read osc-messages from <filename> and dump them, using the relative time 
       information, to stdout.
```

## oscroute

```
usage: orcroute /route1@path1 host1:port1 [[ /route2@path2 host2:port2 ] ... ]

       Reads osc-messages form stdin and sends the messages matching /route@path, 
       without the /route to host:port.
```


