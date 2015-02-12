all: 0.8 0.10 0.11 0.12

%:
	n $@ && npm test

.PHONY: all