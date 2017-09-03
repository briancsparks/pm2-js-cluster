
/**
 *  This is a PM2 module. It simply intercepts logging, and sends it to syslog.
 */

var _                         = require('underscore');
var pmx                       = require('pmx');
var pm2                       = require('pm2');
var SysLogger                 = require('ain2');

var color                     = process.env.SERVERASSIST_COLOR;
var stack                     = process.env.SERVERASSIST_STACK;
var service                   = process.env.SERVERASSIST_SERVICE;

var tag                       = _.compact(['jsc', color, stack, service]).join('_');


// configuration for logging
var logConfig = {
  facility      : 'local7',
  address       : process.env.SERVERASSIST_UTIL_IP,
  port          : 10698
};

// The main 'ain2' logging object
var logger    = new SysLogger(_.extend({tag:tag}, logConfig));

// The collection of loggers by app name
var loggers   = {};

/**
 *  Gets a logger for an app, and includes the app name into the tag.
 */
var getLogger = function(app) {

  if (loggers[app]) {
    return loggers[app];
  }

  return (loggers[app] = new SysLogger(_.extend({}, logConfig, {tag: [tag, app].join('_')})));
};

// Init with pm2 pmx
var conf = pmx.initModule({}, function(err, conf) {
  // Now the module is initialized

  // Hook into the PM2 'bus'
  pm2.launchBus(function(err, bus) {
    bus.on('*', function(event, data){
      if (event == 'process:event') {
        logger.warn('app=pm2 target_app=%s target_id=%s restart_count=%s status=%s',
                    data.process.name,
                    data.process.pm_id,
                    data.process.restart_time,
                    data.event);
      }
    });

    bus.on('log:err', function(data) {
      var logger = getLogger(data.process.name);
      logger.error('%s', data.data);
    });

    bus.on('log:out', function(data) {
      var logger = getLogger(data.process.name);
      logger.log('%s', data.data);
    });
  });

});

