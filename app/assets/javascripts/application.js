// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require foundation
//= require_tree .

$(function() {
  $(document).foundation();

  $("a.completed").click(function() {
    var overall = parseInt($('.progress').css('width'));
    var add_ten_percent = overall * 0.1;
    var original = parseInt($('#action-completed').css('width'));
    $('#action-completed').css('width', ''+(original+add_ten_percent)+'px');

    $("#notificationBubble").hide();
    state += notificationBonus;
    refreshState();
    currentNotification = null;
    $("a.completed").hide();
  });

  function setStateByName(stateName) {
    var states = ['happy', 'ok', 'sad'];
    for (i in states) {
      var name = states[i];
      var element = $('#' + name);
      if (name == stateName) {
        element.show();
      } else {
        element.hide();
      }
    }
  }
  function refreshState() {
    if (state >= thresholdHappy) {
      setStateByName('happy');
    } else if (state >= thresholdSad) {
      setStateByName('ok');
    } else {
      setStateByName('sad');
    }
  }

  function notify(notification) {
    if (currentNotification) {
      return;
    }
    currentNotification = {
      message: notification.message,
      value: notification.value
    };
    $("a.completed").show();

    $("#notification").text(currentNotification.message);
    $("#notificationBubble").show();

    setTimeout(notifyTimeout, bubbleTimeout);
  }
  function notifyTimeout() {
    $("#notificationBubble").hide();
    state -= notificationPenalty;
    refreshState();

    currentNotification = null;
    $("a.completed").hide();
  }

  var bubbleTimeout = 1000 * 6.5; // millis

  var notificationBonus = 0.25;
  var notificationPenalty = 0.075;

  var bubbleGap = 0.1;
  var thresholdHappy = 0.6667;
  var thresholdHappyBubble = thresholdHappy + bubbleGap;
  var thresholdSad = 0.3333;
  var thresholdSadBubble = thresholdSad + bubbleGap;

  var fetchNotification = function(defaultMessage, defaultValue) {
    return function() {
      $.get('notifications.json', function(data) {
        var notification = {
          message: defaultMessage,
          value: defaultValue
        }
        if (data && data.length > 0) {
          notification = data[0];
        }
        notify(notification);
      });
    }
  };
  var downActions = [ {
    threshold: thresholdHappyBubble,
    action: fetchNotification('Hey guys, would you mind turning the lights off?', 10)
  }, {
    threshold: thresholdHappy,
    action: function() { setStateByName('ok'); }
  }, {
    threshold: thresholdSadBubble,
    action: fetchNotification("Ermahgerd, I'm dying here! I cannae give her no more!", 10)
  }, {
    threshold: thresholdSad,
    action: function() { setStateByName('sad'); }
  }, {
    threshold: 0.0,
    action: function() { if (demo) { demoGettingBetter = true; } }
  } ];

  var upActions = [ {
    threshold: 1.0,
    action: function() { if (demo) { demoGettingBetter = false; } }
  }, {
    threshold: thresholdHappy,
    action: function() { setStateByName('happy'); }
  }, {
    threshold: thresholdSad,
    action: function() { setStateByName('ok'); }
  } ];

  function scaleConsumption(raw) {
    return raw * 0.01;
  }
  function scaleProduction(raw) {
    return raw * 0.01;
  }

  var state = 0.8;
  var lastTime;
  var currentNotification = null;

  var demo = false;
  var demoGettingBetter = false;

  function update() {
    $.get('reports.json', function(data) {
      // update consumption/production
      data = data[0];
      var consumption = scaleConsumption(data.consumption);
      var production = scaleProduction(data.production);

      if (demo) {
        consumption = scaleConsumption(demoGettingBetter ? 3 : 5);
        production = scaleProduction(demoGettingBetter ? 8 : 2);
      }

      // measure timestep
      var now = Date.now();
      if (!lastTime) {
        lastTime = now;
        return;
      }
      var timestep = now - lastTime;
      var oldState = state;

      // update state (factored with timestep)
      state += (production - consumption) * (timestep / 1000.0);
      stateAction(oldState, state);

      // guard state limits
      if (state > 1.0) {
        state = 1.0;
      }
      if (state < 0.0) {
        state = 0.0;
      }

      //console.log("update [" + timestep + "] -> " + state);
      lastTime = now;
    });
  }

  function stateAction(oldState, newState) {
    var crossedThresholdDown = function(threshold) {
      return oldState > threshold && newState <= threshold;
    }
    var crossedThresholdUp = function(threshold) {
      return oldState < threshold && newState >= threshold;
    }

    // check if state has crossed a threshold
    // maybe change display state
    // maybe raise a popup
    // check if popup has timed out
    if (oldState > newState) {
      // getting worse
      for (i in downActions) {
        if (crossedThresholdDown(downActions[i].threshold)) {
          downActions[i].action();
          break;
        }
      }
    } else if (oldState < newState) {
      // getting better
      for (i in upActions) {
        if (crossedThresholdUp(upActions[i].threshold)) {
          upActions[i].action();
          break;
        }
      }
    } // else edge case for staying the same - don't care.
  }

  setInterval(update, 250);

});
