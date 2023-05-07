#!/bin/sh

find . -name "osctools_*_all.deb" -exec rm \{\} \;
sed  osctools/DEBIAN/control.template -e "s/%%version%%/$(date +%s)/" > osctools/DEBIAN/control
dpkg-deb -b osctools .
rm osctools/DEBIAN/control

