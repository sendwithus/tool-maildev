/* global angular, app */

/**
 * Email item Controller -- The UI for the email pane
 */

app.controller('ItemCtrl', [
  '$scope', '$rootScope', '$routeParams', '$location', 'Email', '$http',
  function ($scope, $rootScope, $routeParams, $location, Email, $http) {
    var iframe = null

    // Get the item data by route parameter
    var getItem = function () {
      Email.get({
        id: $routeParams.itemId
      }, function (email) {
        $scope.item = new Email(email)

        // Get the raw email source
        $http({
          method: 'GET',
          url: '/api/email/' + $scope.item.id + '/source'
        })
        .success(function (data) {
          $scope.item.source = data
        })

        if ($scope.item.html) {
          $scope.item.iframeUrl = 'api/email/' + $scope.item.id + '/html'
          prepIframe()
          $scope.panelVisibility = 'html'
        } else {
          $scope.htmlView = 'disabled'
          $scope.panelVisibility = 'plain'
        }
      }, function () {
        console.error('404: Email not found')
        $location.path('/')
      })
    }

    // Prepares the iframe for interaction
    var prepIframe = function () {
      // Wait for iframe to load
      setTimeout(function () {
        iframe = document.getElementsByTagName('iframe')[0]
        var head = iframe.contentDocument.getElementsByTagName('head')[0]
        var baseEl = iframe.contentDocument.createElement('base')

        // Append <base target="_blank" /> to <head> in the iframe so all links open in new window
        baseEl.setAttribute('target', '_blank')

        if (head) {
          head.appendChild(baseEl)
        }

        replaceMediaQueries()
        fixIframeHeight()

        addHideDropdownHandler(iframe.contentDocument.getElementsByTagName('body')[0])
      }, 200)
    }

    // Updates the iframe height so it matches it's content
    // This prevents the iframe from having scrollbars
    var fixIframeHeight = function () {
      var body = iframe.contentDocument.getElementsByTagName('body')[0]
      var newHeight = body.scrollHeight
      iframe.height = newHeight
    }

    // Updates all media query rules to use 'width' instead of device width
    var replaceMediaQueries = function () {
      angular.forEach(iframe.contentDocument.styleSheets, function (styleSheet) {
        angular.forEach(styleSheet.cssRules, function (rule) {
          if (rule.media && rule.media.mediaText) {
            // TODO -- Add future warning if email doesn't use '[max|min]-device-width' media queries
            rule.media.mediaText = rule.media.mediaText.replace('device-width', 'width')
          }
        })
      })
    }

    // NOTE: This is kind of a hack to get these dropdowns working. Should be revisited in the future

    // Toggle a dropdown open/closed by toggling a class on the trigger itself
    $scope.toggleDropdown = function ($event, dropdownName) {
      $event.stopPropagation()
      $scope.dropdownOpen = dropdownName === $scope.dropdownOpen ? '' : dropdownName
    }

    function hideDropdown (e) {
      $scope.$apply(function () {
        $scope.dropdownOpen = ''
      })
    }

    function addHideDropdownHandler (element) {
      angular.element(element)
        .off('click', hideDropdown)
        .on('click', hideDropdown)
    }

    addHideDropdownHandler(window)

    // Toggle what format is viewable
    $scope.show = function (type) {
      if ((type === 'html' || type === 'attachments') && !$scope.item[type]) {
        return
      }

      $scope.panelVisibility = type
    }

    // Sends a DELETE request to the server
    $scope.delete = function (item) {
      Email.delete({ id: item.id })
    }

    // Updates iframe to have a width of newSize, i.e. '320px'
    $scope.resize = function (newSize) {
      iframe.style.width = newSize || '100%'
      fixIframeHeight()
      $scope.iframeSize = newSize
    }

    // Relay email
    $scope.relay = function (item) {
      if (!$rootScope.config.outgoingHost) {
        window.swal({
          type: 'warning',
          title: 'Relay feature has not been configured.',
          text: 'Run maildev --help for configuration info.'
        })
        return
      }

      window.swal({
        type: 'warning',
        title: 'Are you sure?',
        text: 'Are you sure you want to REALLY SEND email to ' +
              '<strong>' + item.to.map(function (to) { return to.address }).join() + '</strong> ' +
              'through <strong>' + $rootScope.config.outgoingHost + '</strong>?',
        html: true,
        showCancelButton: true,
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          $http({
            method: 'POST',
            url: '/api/email/' + item.id + '/relay'
          })
          .success(function (data, status) {
            console.log('Relay result: ', data, status)
            window.swal({
              type: 'info',
              title: 'Relay successful',
              text: 'Continue on with your day'
            })
          })
          .error(function (data) {
            window.swal({
              type: 'error',
              title: 'Relay failed',
              text: data.error
            })
          })
        }
      })
    }

    // Initialize the view by getting the email
    getItem()
  }
])
