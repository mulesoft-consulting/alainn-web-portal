To consume self-signed cert from Ping download the pem file from Firefox (don't know how in Chrome)

keytool -import -trustcacerts -file ~/Downloads/pingfed.pem -alias localhost -keystore x.jks

then make reference to the cacert in the httpsConnector

<https:tls-server path="x.jks" storePassword="changeit" />

			