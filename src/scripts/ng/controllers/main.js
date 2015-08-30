/* global app */

/**
 * Main App Controller -- Manage all emails visible in the list
 */

app.controller('MainCtrl', [
  '$scope', '$rootScope', '$http', '$route', '$location', '$notification', 'Email',
  function ($scope, $rootScope, $http, $route, $location, $notification, Email) {
    $scope.items = []
    $scope.currentItemId = null
    $scope.autoShow = false
    $scope.unreadItems = 0

    var countUnread = function () {
      $scope.unreadItems = $scope.items.filter(function (email) {
        return !email.read
      }).length
    }

    // Load all emails
    var loadData = function () {
      $scope.items = Email.query()
      $scope.items.$promise.then(function () {
        countUnread()
      })
    }

    $rootScope.$on('uiRefresh', function (e, d) {
      loadData()
    })

    $scope.$on('$routeChangeSuccess', function (e, route) {
      if (route.params) {
        $scope.currentItemId = route.params.itemId
      }
    })

    var refreshTimeout = null

    $scope.$on('emailNew', function (e, newEmail) {
      // Show a browser notification for the new message
      $notification('SWUMailDev - New Email!', {
        body: newEmail.subject
      })
      .$on('click', function () {
        console.log('NOTIFICATION CLICKEDDDD')
        // Give the browser time to take focus before changing page state
        $location.path('/email/' + newEmail.id)
      })

      // update model
      $scope.items.push(newEmail)
      countUnread()

      // update DOM at most 5 times per second
      if (!refreshTimeout) {
        refreshTimeout = setTimeout(function () {
          refreshTimeout = null
          if ($scope.autoShow === true) {
            $location.path('/email/' + newEmail.id)
          }
          $scope.$apply()
        }, 200)
      }
    })

    $scope.$on('emailDelete', function (e, email) {
      if (email.id === 'all') {
        $rootScope.$emit('uiRefresh')
        $location.path('/')
      } else {
        var idx = $scope.items.reduce(function (p, c, i) {
          if (p !== 0) return p
          return c.id === email.id ? i : 0
        }, 0)

        var nextIdx = $scope.items.length === 1 ? null :
                      idx === 0 ? idx + 1 : idx - 1
        if (nextIdx !== null) {
          $location.path('/email/' + $scope.items[nextIdx].id)
        } else {
          $location.path('/')
        }

        $scope.items.splice(idx, 1)
        countUnread()
        $scope.$apply()
      }
    })

    // Click event handlers
    $scope.markRead = function (email) {
      email.read = true
      countUnread()
    }

    $scope.toggleAutoShow = function () {
      $scope.autoShow = !$scope.autoShow
    }

    // Initialize the view
    loadData()

    $http({
      method: 'GET',
      url: 'config'
    })
    .success(function (data) {
      $rootScope.config = data
      $scope.config = data
    })
  }
])

/**
 * Navigation Controller
 */

app.controller('NavCtrl', [
  '$scope', '$rootScope', 'Email',
  function ($scope, $rootScope, Email) {
    $scope.refreshList = function () {
      $rootScope.$emit('uiRefresh')
    }

    $scope.deleteAll = function () {
      Email.delete({ id: 'all' })
    }
  }
])
