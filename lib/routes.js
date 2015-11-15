/**
 * MailDev - routes.js
 */

var express = require('express')
var router = express.Router()

module.exports = function (app, mailserver) {
  // Get all emails
  router.get('/email', function (req, res) {
    mailserver.getAllEmail(function (err, emailList) {
      if (err) {
        return res.status(404).json([])
      }

      res.json(emailList)
    })
  })

  // Get single email
  router.get('/email/:id', function (req, res) {
    mailserver.getEmail(req.params.id, function (err, email) {
      if (err) {
        return res.status(404).json({ error: err.message })
      }

       // Mark the email as 'read'
      email.read = true

      res.json(email)
    })
  })

  // Delete all emails
  router.delete('/email/all', function (req, res) {
    mailserver.deleteAllEmail(function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json(true)
    })
  })

  // Delete email by id
  router.delete('/email/:id', function (req, res) {
    mailserver.deleteEmail(req.params.id, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json(true)
    })
  })

  // Get Email HTML
  router.get('/email/:id/html', function (req, res) {
    mailserver.getEmailHtml(req.params.id, function (err, html) {
      if (err) {
        return res.status(404).json({ error: err.message })
      }

      res.send(html)
    })
  })

  // Serve Attachments
  router.get('/email/:id/attachment/:filename/:download?', function (req, res) {
    mailserver.getEmailAttachment(req.params.id, req.params.filename, function (err, contentType, readStream) {
      if (err) {
        return res.status(404).json('File not found')
      }

      // If the route is initiated from the browser, just download it
      if (req.params.download === 'download') {
        res.setHeader('Content-disposition', 'attachment; filename=' + req.params.filename)
      }

      res.contentType(contentType)
      readStream.pipe(res)
    })
  })

  // Serve email.eml
  router.get('/email/:id/download', function (req, res) {
    mailserver.getEmailEml(req.params.id, function (err, contentType, filename, readStream) {
      if (err) {
        return res.status(404).json('File not found')
      }

      res.setHeader('Content-disposition', 'attachment; filename=' + filename)
      res.contentType(contentType)
      readStream.pipe(res)
    })
  })

  // Get email source from .eml file
  router.get('/email/:id/source', function (req, res) {
    mailserver.getRawEmail(req.params.id, function (err, readStream) {
      if (err) {
        return res.status(404).json('File not found')
      }

      readStream.pipe(res)
    })
  })

  // Relay the email
  router.post('/email/:id/relay', function (req, res) {
    mailserver.getEmail(req.params.id, function (err, email) {
      if (err) {
        return res.status(404).json({ error: err.message })
      }

      mailserver.relayMail(email, function (err) {
        if (err) {
          return res.status(500).json({ error: err.message })
        }

        res.json(true)
      })
    })
  })

  return router
}
