help:
	@echo "usage: make osctools-update|osctools-install|debian" 
osctools-update:
	@./bin/osctools-update.sh
install:
	@./bin/osctools-install.sh
debian:
	@./bin/build.sh

