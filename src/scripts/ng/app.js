/* global angular, io */

/**
 * App Config
 */

var app = angular.module('mailDevApp', [
  'ngRoute',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'notification'
])

app.config([
  '$routeProvider', '$locationProvider', '$notificationProvider',
  function ($routeProvider, $locationProvider, $notificationProvider) {
    $locationProvider.html5Mode(true)

    $routeProvider
      .when('/', {
        templateUrl: 'main.html'
      })
      .when('/email/:itemId', {
        templateUrl: 'item.html',
        controller: 'ItemCtrl'
      })
      .otherwise({
        redirectTo: '/'
      })

    // Set notification options
    $notificationProvider.setOptions({
      icon: 'https://www.sendwithus.com/assets/img/parachute.png',
      delay: 5000
    })
  }
])

app.run([
  '$rootScope',
  function ($rootScope) {
    // Connect Socket.io
    var socket = io()

    socket.on('emailNew', function (data) {
      $rootScope.$broadcast('emailNew', data)
    })

    socket.on('emailDelete', function (data) {
      $rootScope.$broadcast('emailDelete', data)
    })

    $rootScope.$on('uiRefresh', function () {
      console.log('Refresh event called.')
    })

    // On DOM content loaded, make the app visible
    $rootScope.loaded = false
    $rootScope.$on('$viewContentLoaded', function () {
      $rootScope.loaded = true
    })
  }
])

/**
 * NewLineFilter -- Converts new line characters to br tags
 */

app.filter('newLines', function () {
  return function (text) {
    return text && text.replace(/\n/g, '<br>') || ''
  }
})

/**
 * HtmlEncodeFilter -- Converts < and > characters to their html encoded version
 */

app.filter('htmlEncode', function () {
  return function (text) {
    if (text !== undefined) {
      text = text.replace(/\>/g, '&gt;')
      text = text.replace(/\</g, '&lt;')
    }
    return text
  }
})

/**
 * Sidebar scrollbar fixed height
 */

;(function () {
  var sidebar = document.querySelector('.sidebar')
  var sidebarHeader = document.querySelector('.sidebar-header')
  var emailList = document.querySelector('.email-list')
  var sidebarHeaderHeight = sidebarHeader.getBoundingClientRect().height
  var resizeTimeout = null

  function adjustEmailListHeight () {
    var newEmailListHeight = sidebar.getBoundingClientRect().height - sidebarHeaderHeight
    emailList.style.height = newEmailListHeight + 'px'
  }

  window.onresize = function () {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(function () {
      adjustEmailListHeight()
      resizeTimeout = null
    }, 300)
  }

  window.onresize()
})()
