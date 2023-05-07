help:
	@echo "usage: make macos-install|debian" 
macos-install:
	@./bin/osctools-install.sh
debian:
	@./bin/build.sh

