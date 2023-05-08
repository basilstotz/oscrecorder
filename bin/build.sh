#!/bin/sh

find . -name "oscrecorder_*_all.deb" -exec rm \{\} \;
sed  oscrecorder/DEBIAN/control.template -e "s/%%version%%/$(date +%s)/" > oscrecorder/DEBIAN/control
dpkg-deb -b oscrecorder .
rm oscrecorder/DEBIAN/control

