var pmx                       = require('pmx');
var pm2                       = require('pm2');
var SysLogger                 = require('ain2');


//var logger    = new SysLogger({tag: 'JSCLUSTER',  facility: 'local7', hostname: process.env.MARIO_UTIL_IP, port: 10598, transport: 'UDP'});
var logger    = new SysLogger({tag: 'JSCLUSTER',  facility: 'local7'});


var conf      = pmx.initModule({
  // Override PID to be monitored
  //pid              : pmx.resolvePidPaths(['/var/run/redis.pid']),
}, function(err, conf) {
  // Now the module is initialized


  //logger.log("pm2-js-cluster", err, conf);

  pm2.launchBus(function(err, bus) {
    bus.on('*', function(event, data){
      if (event == 'process:event') {
        logger.warn('app=pm2 target_app=%s target_id=%s restart_count=%s status=%s (%s)',
                    data.process.name,
                    data.process.pm_id,
                    data.process.restart_time,
                    data.event,
                    JSON.stringify(data));
      }
    });

    bus.on('log:err', function(data) {
      logger.error('app=%s id=%s line=%s (%s)', data.process.name, data.process.pm_id, data.data, JSON.stringify(data));
    });

    bus.on('log:out', function(data) {
      logger.log('app=%s id=%s line=%s (%s)', data.process.name, data.process.pm_id, data.data, JSON.stringify(data));
    });
  });

});

