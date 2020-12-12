JQ_VERSION := 1.6
POSTGRES_VERSION := 10.10-1
REDIS_VERSION := 5.0.5
REDIS_SHA256SUM := 2139009799d21d8ff94fc40b7f36ac46699b9e1254086299f8d3b223ca54a375

DATE_FORMAT := "+%Y-%m-%dT%H:%M:%S.000Z"

FEEL_VERSION := $(shell jq --raw-output .version ../package.json)
NODEJS_VERSION := $(shell cat ../.nvmrc)

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
include linux.mk
else ifeq ($(UNAME_S),Darwin)
include darwin.mk
endif
# defaults
CP ?= cp
DATE ?= date
DOWNLOAD ?= wget --no-verbose
GNUPG ?= gpg2
INSTALL ?= install
LN ?= ln

.PHONY: all
all: check release/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64.tar.gz.SHA256

.PHONY: check
check:
ifndef FEEL_NETWORK
	$(error The FEEL_NETWORK environment variable must be set.)
endif
ifeq "$(FEEL_VERSION)" "null"
	$(error FEEL_VERSION could not be read from ../package.json.)
endif
ifndef NODEJS_VERSION
	$(error NODEJS_VERSION could not be read from ../.nvmrc.)
endif

release/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64.tar.gz.SHA256: release/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64.tar.gz
	cd release/ && sha256sum feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64.tar.gz |tee feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64.tar.gz.SHA256

release/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64.tar.gz: src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64
	cd src/ && GZIP=-9 tar czf ../$@ feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64: src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/finished
	rm -rf src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_temp
	$(CP) -rf src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_temp
	rm -f src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_temp/finished
	mv src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_temp $@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/finished: \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/.build \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/REVISION \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/config.json \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/env.sh \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/feel.sh \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/feel_snapshot.sh \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/tune.sh \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/jq \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/feel \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/node \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/pm2 \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/redis-cli \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/redis-server \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/etc/pm2-feel.json \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/etc/redis.conf \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/var/db/blockchain.db.gz \
		| \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/logs \
		src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/redis
	touch $@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image: ../feel-core-$(FEEL_VERSION).tgz src/postgresql-$(POSTGRES_VERSION)-$(POSTGRES_ARCH)-binaries.$(POSTGRES_EXT) src/postgresql-$(POSTGRES_VERSION)-$(POSTGRES_ARCH)-binaries.$(POSTGRES_EXT).sha256sum
	rm -rf src/package
	tar xfm ../feel-core-$(FEEL_VERSION).tgz --directory=src
	cd src/ && sha256sum --check postgresql-$(POSTGRES_VERSION)-$(POSTGRES_ARCH)-binaries.$(POSTGRES_EXT).sha256sum
	tar xfm src/postgresql-$(POSTGRES_VERSION)-$(POSTGRES_ARCH)-binaries.$(POSTGRES_EXT) \
	  --exclude=doc --exclude=include --exclude="pgAdmin 4*" --exclude=stackbuilder \
	  --directory=src/package
	mv src/package $@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	mkdir $@
src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/etc: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	mkdir $@
src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/lib: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	mkdir $@
src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/logs: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	mkdir $@
src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/redis: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	mkdir $@
src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/var: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	mkdir $@
src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/var/db: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/var
	mkdir $@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/.build: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	$(DATE) --utc $(DATE_FORMAT) >$@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/REVISION: ../.git/HEAD | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	git rev-parse HEAD >$@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/config.json: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	echo '{}' >$@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/env.sh: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	( cat target/env.sh; echo "export FEEL_NETWORK=$(FEEL_NETWORK)" ) |tee $@
src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/%.sh: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	$(INSTALL) --mode=0755 target/$(@F) $@
src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/etc/%: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/etc
	$(INSTALL) --mode=0644 target/etc/$(@F) $@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/node_modules: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	cd $(@D)/ && PATH="${PWD}/src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH)/bin:${PATH}" npm ci --production

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/jq: src/jq | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin
	$(INSTALL) --mode=0755 --strip src/jq --target-directory=$(@D)

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/feel: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/node_modules src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin
	$(LN) --symbolic ../node_modules/feel-commander/bin/run $@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/node: src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image
	tar xfm src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz --strip-components=1 --directory=src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image --exclude=README.md

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/pm2: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/node_modules src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin
	$(LN) --symbolic ../node_modules/pm2/bin/pm2 $@

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin/redis-%: src/redis-$(REDIS_VERSION)/src/redis-% | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/bin
	$(INSTALL) --mode=0755 --strip src/redis-$(REDIS_VERSION)/src/$(@F) --target-directory=$(@D)

src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/var/db/blockchain.db.gz: | src/feel-$(FEEL_VERSION)-$(UNAME_S)-x86_64_image/var/db
	touch $@

../npm-shrinkwrap.json: ../package-lock.json
	$(CP) ../package-lock.json $@

src/jq: src/jq-$(JQ_ARCH) src/jq-$(JQ_ARCH).sha256sum
	sha256sum -c src/jq-$(JQ_ARCH).sha256sum
	$(CP) -f src/jq-$(JQ_ARCH) $@

src/jq-$(JQ_ARCH):
	$(DOWNLOAD) https://github.com/stedolan/jq/releases/download/jq-$(JQ_VERSION)/jq-$(JQ_ARCH) --output-document=$@

src/jq-$(JQ_ARCH).sha256sum:
	echo "$(JQ_SHA256SUM)  src/jq-$(JQ_ARCH)" |tee $@

src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH): src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz.sha256sum
	cd src/ && sha256sum --check node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz.sha256sum
	tar xfm src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz --directory=src

src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz:
	$(DOWNLOAD) https://nodejs.org/dist/v$(NODEJS_VERSION)/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz --output-document=$@

src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz.sha256sum: src/node-v$(NODEJS_VERSION)_SHASUMS256.txt src/node-v$(NODEJS_VERSION)_SHASUMS256.txt.sig
	$(GNUPG) --no-default-keyring --keyring ./nodejs-keyring.gpg --verify src/node-v$(NODEJS_VERSION)_SHASUMS256.txt.sig src/node-v$(NODEJS_VERSION)_SHASUMS256.txt
	grep node-v$(NODEJS_VERSION)-$(NODEJS_ARCH).tar.xz src/node-v$(NODEJS_VERSION)_SHASUMS256.txt |tee $@

src/node-v$(NODEJS_VERSION)_SHASUMS256.txt:
	$(DOWNLOAD) https://nodejs.org/dist/v$(NODEJS_VERSION)/SHASUMS256.txt --output-document=$@

src/node-v$(NODEJS_VERSION)_SHASUMS256.txt.sig:
	$(DOWNLOAD) https://nodejs.org/dist/v$(NODEJS_VERSION)/SHASUMS256.txt.sig --output-document=$@

../feel-core-$(FEEL_VERSION).tgz: ../npm-shrinkwrap.json src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH)
	cd ../ && PATH="${PWD}/src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH)/bin:${PATH}" npm ci
	cd ../ && PATH="${PWD}/src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH)/bin:${PATH}" npm run build
	cd ../ && PATH="${PWD}/src/node-v$(NODEJS_VERSION)-$(NODEJS_ARCH)/bin:${PATH}" npm pack

src/feel-core-$(FEEL_VERSION).tgz: ../feel-core-$(FEEL_VERSION).tgz
	$(CP) -f ../feel-core-$(FEEL_VERSION).tgz $@

src/redis-$(REDIS_VERSION)/src/redis-%: src/redis-$(REDIS_VERSION)
	cd src/redis-$(REDIS_VERSION)/ && make && make check
	touch $@

src/redis-$(REDIS_VERSION): src/redis-$(REDIS_VERSION).tar.gz src/redis-$(REDIS_VERSION).tar.gz.sha256sum
	cd src/ && sha256sum --check redis-$(REDIS_VERSION).tar.gz.sha256sum
	tar xfm src/redis-$(REDIS_VERSION).tar.gz --directory=src

src/redis-$(REDIS_VERSION).tar.gz:
	$(DOWNLOAD) http://download.redis.io/releases/redis-$(REDIS_VERSION).tar.gz --output-document=$@

src/redis-$(REDIS_VERSION).tar.gz.sha256sum:
	echo "$(REDIS_SHA256SUM)  redis-$(REDIS_VERSION).tar.gz" |tee $@

src/postgresql-$(POSTGRES_VERSION)-$(POSTGRES_ARCH)-binaries.$(POSTGRES_EXT):
	$(DOWNLOAD) https://get.enterprisedb.com/postgresql/postgresql-$(POSTGRES_VERSION)-$(POSTGRES_ARCH)-binaries.$(POSTGRES_EXT) --output-document=$@

src/postgresql-$(POSTGRES_VERSION)-$(POSTGRES_ARCH)-binaries.$(POSTGRES_EXT).sha256sum:
	echo "$(POSTGRES_SHA256SUM)  postgresql-$(POSTGRES_VERSION)-$(POSTGRES_ARCH)-binaries.$(POSTGRES_EXT)" |tee $@

.PHONY: clean
clean:
	rm -rf release/* src/feel-$(FEEL_VERSION)*

.PHONY: mrproper
mrproper: clean
	rm -rf src/* ../npm-shrinkwrap.json ../feel-core-$(FEEL_VERSION).tgz
