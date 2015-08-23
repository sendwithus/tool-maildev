# SWU-MailDev

## NOTE: PLEASE DON'T USE THIS PACKAGE, REFER TO THE ORIGINAL PROJECT @ https://github.com/djfarrelly/MailDev THANKS!

## Install & Run

    $ npm install -g swu-maildev
    $ swu-maildev

## Usage

    swu-maildev [options]

      -h, --help              output usage information
      -V, --version           output the version number
      -s, --smtp <port>       SMTP port to catch emails [1025]
      -w, --web <port>        Port to run the Web GUI [1080]
      --ip <ip address>       IP Address to bind services to [0.0.0.0]
      --outgoing-host <host>  SMTP host for outgoing emails
      --outgoing-port <port>  SMTP port for outgoing emails
      --outgoing-user <user>  SMTP user for outgoing emails
      --outgoing-pass <pass>  SMTP password for outgoing emails
      --outgoing-secure       Use SMTP SSL for outgoing emails
      --incoming-user <user>  SMTP user for incoming emails
      --incoming-pass <pass>  SMTP password for incoming emails
      --web-user <user>       HTTP basic auth username
      --web-pass <pass>       HTTP basic auth password
      -o, --open              Open the Web GUI after startup
      -v, --verbose
