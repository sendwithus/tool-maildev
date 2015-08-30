# SWUMailDev

## NOTE: PLEASE DON'T USE THIS PACKAGE, REFER TO THE ORIGINAL PROJECT @ https://github.com/djfarrelly/MailDev THANKS!

## Install & Run

```shell
$ npm install -g swu-maildev
$ swu-maildev
```

## Usage

```shell
swu-maildev [options]

  -h, --help                    output usage information
  -V, --version                 output the version number
  -s, --smtp <port>             SMTP port to catch emails [1025]
  -w, --web <port>              Port to run the Web GUI [1080]
  --ip <ip address>             IP Address to bind services to [0.0.0.0]
  --outgoing-host <host>        SMTP host for outgoing emails
  --outgoing-port <port>        SMTP port for outgoing emails
  --outgoing-user <user>        SMTP user for outgoing emails
  --outgoing-pass <pass>        SMTP password for outgoing emails
  --outgoing-secure             Use SMTP SSL for outgoing emails
  --auto-relay                  Use auto relay mode
  --auto-relay-rules <file>     Filter rules for auto relay mode
  --incoming-user <user>        SMTP user for incoming emails
  --incoming-pass <pass>        SMTP password for incoming emails
  --web-ip <ip address>         IP Address to bind HTTP service to, defaults to --ip
  --web-user <user>             HTTP basic auth username
  --web-pass <pass>             HTTP basic auth password
  -o, --open                    Open the Web GUI after startup
  -v, --verbose
```

## API

SWUMailDev can be used in your Node.js application. For more info view the [API docs](https://github.com/sendwithus/tool-maildev/blob/master/docs/rest.md).

```javascript
var MailDev = require('maildev');

var maildev = new MailDev();

maildev.listen();

maildev.on('new', function(email){
  // We got a new email!
});
```

SWUMailDev also has a **REST API**. For more info [view the docs](https://github.com/sendwithus/tool-maildev/blob/master/docs/rest.md).

## Outgoing email

Maildev optionally supports selectively relaying email to an outgoing SMTP server.  If you configure outgoing email with the --outgoing-* options you can click "Relay" on an individual email to relay through MailDev out to a real SMTP service that will *actually* send the email to the recipient.

Example:

```shell
$ swu-maildev --outgoing-host smtp.gmail.com \
          --outgoing-secure \
          --outgoing-user 'you@gmail.com' \
          --outgoing-pass '<pass>'
```

### Auto relay mode

Enabling the auto relay mode will automatically send each email to it's recipient without the need to click the "Relay" button mentioned above. The outgoing email options are required to enable this feature.

Additionally, you can pass a valid json file with additional configuration for what email addresses you would like to `allow` or `deny`. The last matching rule in the array will be the rule MailDev will follow.

  Example:

    $ swu-maildev --outgoing-host smtp.gmail.com \
              --outgoing-secure \
              --outgoing-user 'you@gmail.com' \
              --outgoing-pass '<pass>' \
              --auto-relay \
              --auto-relay-rules file.json

  Rules example file:
```javascript
[
	{ "allow": "*" },
	{ "deny":  "*@test.com" },
	{ "allow": "ok@test.com" },
	{ "deny":  "*@utah.com" },
	{ "allow": "johnny@utah.com" }
]
```
  This would allow `angelo@fbi.gov`, `ok@test.com`, `johnny@utah.com`, but deny
  `bodhi@test.com`.

## Configure your project

Configure your application to send emails via port `1025` and open `localhost:1080` in your browser.

**Nodemailer (v1.0+)**

```javascript
var transport = nodemailer.createTransport({
  port: 1025,
  ignoreTLS: true,
  // other settings...
});
```

**Django** -- Add `EMAIL_PORT = 1025` in your settings file [[source]](https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-EMAIL_PORT)

**Rails** -- config settings:

```ruby
config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
        :address => "localhost",
        :port => 1025
    }
```

## Features

* Toggle between HTML, plain text views as well as view email headers
* Test Responsive Emails w/ resizeable preview pane available for 320/480/600px screen sizes
* Ability to receive and view email attachments
* Websockets keep the interface in sync once emails are received
* Command line interface for configuring SMTP and Web interface ports
* Ability to relay email to an upstream SMTP server

## Contributing

To run **SWUMailDev** during development:

```shell
# grunt-cli is needed by grunt; ignore this if already installed
npm install -g grunt-cli
npm install
grunt dev
```


The `grunt dev` task will run the project using nodemon and restart automatically when changes are detected. SASS files will be compiled automatically on save also. To trigger some emails for testing run `node test/send.js` in a separate shell. Please run jshint to your lint code before submitting a pull request; run `grunt lint`.

To run the test suite:

```shell
$ npm run test
```
