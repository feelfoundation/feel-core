.PHONY: clean coldstart mrproper up
all: up

feel_net := $(shell grep ^ENV_FEEL_NETWORK= .env |tail -n 1 |awk -F = '{ gsub("net$$", ""); print $$2 }')
ifeq ($(feel_net),)
$(error .env file does not exist or ENV_FEEL_NETWORK variable is not set.)
endif
feel_db := $(shell grep ^ENV_FEEL_DB_DATABASE= .env |tail -n 1 |awk -F = '{ gsub("net$$", ""); print $$2 }')
ifeq ($(feel_net),)
$(error .env file does not exist or ENV_FEEL_DB_DATABASE variable is not set.)
endif

%blockchain.db.gz:
ifeq ($(feel_net),$(filter $(feel_net),main test))
	curl --output $(feel_net)_blockchain.db.gz https://downloads.feel.surf/feel/$(feel_net)/blockchain.db.gz
else
	touch $(feel_net)_blockchain.db
	gzip $(feel_net)_blockchain.db
endif

up:
	docker-compose up --detach

compose := docker-compose -f docker-compose.yml -f docker-compose.make.yml
coldstart: $(feel_net)_blockchain.db.gz up
	docker-compose stop feel
	docker-compose start db
	$(compose) run --rm db-task dropdb --if-exists $(feel_db)
	$(compose) run --rm db-task createdb $(feel_db)
	gzip --decompress --to-stdout $(feel_net)_blockchain.db.gz |$(compose) run --rm db-task psql >/dev/null
	docker-compose start feel

clean:
	rm -f *blockchain.db.gz

mrproper: clean
	docker-compose down --volumes --remove-orphans
