@Library('feel-jenkins') _

pipeline {
	agent { node { label 'feel-build' } }
	options {
		skipDefaultCheckout()
		timeout(time: 30, unit: 'MINUTES')
	}
	stages {
		stage('Checkout SCM') {
			steps {
				cleanWs()
				checkout scm
				sh '''
				VERSION=$( jq --raw-output '.version' package.json )
				SHORT_HASH=$( git rev-parse --short HEAD )
				echo "$VERSION-$SHORT_HASH" >.feel_version
				OUTPUT_FILE="feel-$( cat .feel_version )-Linux-x86_64.tar.gz"
				if s3cmd --quiet info "s3://feel-releases/feel-core/$OUTPUT_FILE" 2>/dev/null; then
				  echo "Build already exists."
				  exit 1
				fi
				'''
			}
		}
		stage('Build Core') {
			steps {
				withCredentials([string(credentialsId: 'npm-feel-io-auth-token-jenkins', variable: 'REGISTRY_AUTH_TOKEN')]) {
					sh '''
					if [ "x$BRANCH_NAME" != "xmaster" ]; then
					  echo 'registry=https://npm.feel.surf/\n//npm.feel.surf/:_authToken=$REGISTRY_AUTH_TOKEN"' >~/.npmrc
					fi
					'''
				}
				dir('build') {
					sh 'make FEEL_NETWORK=testnet'
				}
			}
		}
		stage('Upload build') {
			steps {
				dir('build/release') {
					sh '''
					VERSION=$( jq --raw-output '.version' ../../package.json )
					OUTPUT_FILE="feel-$( cat ../../.feel_version )-Linux-x86_64.tar.gz"
					mkdir "${OUTPUT_FILE%.tar.gz}"
					tar xf "feel-$VERSION-Linux-x86_64.tar.gz" --strip-components=1 --directory="${OUTPUT_FILE%.tar.gz}"
					tar czf "$OUTPUT_FILE" "${OUTPUT_FILE%.tar.gz}"
					sha256sum "$OUTPUT_FILE" >"$OUTPUT_FILE.SHA256"
					s3cmd put --acl-public "$OUTPUT_FILE" "s3://feel-releases/feel-core/$OUTPUT_FILE"
					s3cmd put --acl-public "$OUTPUT_FILE.SHA256" "s3://feel-releases/feel-core/$OUTPUT_FILE.SHA256"
					'''
				}
			}
		}
	}
	post {
		always {
			sh 'rm -f ~/.npmrc'
		}
	}
}
// vim: filetype=groovy
