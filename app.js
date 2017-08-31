
/**
 *  This is a PM2 module. It simply intercepts logging, and sends it to syslog.
 */

var pmx                       = require('pmx');
var pm2                       = require('pm2');
var SysLogger                 = require('ain2');

// The 'ain2' logging object
var logger    = new SysLogger({tag: 'JSCLUSTER',  facility: 'local7'});


var conf      = pmx.initModule({}, function(err, conf) {
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
      logger.error('app=%s id=%s line=%s', data.process.name, data.process.pm_id, data.data);
    });

    bus.on('log:out', function(data) {
      logger.log('app=%s id=%s line=%s', data.process.name, data.process.pm_id, data.data);
    });
  });

});

