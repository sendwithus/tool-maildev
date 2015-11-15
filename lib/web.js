/**
 * MailDev - web.js
 */

var path = require('path')
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)

var pkg = require('../package.json')
var routes = require('./routes')
var auth = require('./auth')
var logger = require('./logger')

/**
 * WebSockets
 */

function emitNewMail (socket) {
  return function (email) {
    socket.emit('emailNew', email)
  }
}

function emitDeleteMail (socket) {
  return function (email) {
    socket.emit('emailDelete', email)
  }
}

function webSocketConnection (mailserver) {
  return function onConnection (socket) {
    // When a new email arrives, the 'new' event will be emitted
    mailserver.on('new', emitNewMail(socket))
    mailserver.on('delete', emitDeleteMail(socket))

    socket.on('disconnect', function () {
      mailserver.removeListener('new', emitNewMail(socket))
      mailserver.removeListener('delete', emitDeleteMail(socket))
    })
  }
}

/**
 * Start the web server
 */

module.exports.start = function (port, host, mailserver, user, password) {
  var staticPath = path.resolve(__dirname, '../', 'dist')
  var apiRouter = routes(app, mailserver)

  if (user && password) {
    app.use(auth(user, password))
  }

  app.use(bodyParser.json())

  app.use('/', express.static(staticPath))

  app.use('/api', apiRouter)

  // Get any config settings for display
  app.use('/config', function (req, res) {
    res.json({
      version: pkg.version,
      smtpPort: mailserver.port,
      isOutgoingEnabled: mailserver.isOutgoingEnabled(),
      outgoingHost: mailserver.getOutgoingHost()
    })
  })

  // Hack for HTML5 Angular routing
  app.use('/*', function (req, res, next) {
    return res.sendFile(staticPath + '/index.html')
  })

  io.on('connection', webSocketConnection(mailserver))

  port = port || 1080
  host = host || '0.0.0.0'

  server.listen(port, host)

  logger.info('MailDev app running at %s:%s', host, port)
}
