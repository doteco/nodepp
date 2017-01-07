var express = require("restify");
var bodyParser = require("body-parser");
var moment = require('moment');
var nconf = require('./utilities/config.js').getConfig();
var logger = require('./utilities/logging.js').getLogger(nconf);
var ProtocolState = require('./lib/protocol-state');

logger.debug("Starting epp server.", process.argv);

var appConfig = nconf.get('app-config');



var app = restify.createServer();
app.use(bodyParser.json());
var ips = nconf.get('whitelisted_ips');
app.use(ipfilter(ips, {"mode": "allow"}));

app.get('/:command', function(req, res){
});

app.post('/command/:registry/:command', function(req, res) {
    var registry = req.params.registry;
    var queryData = req.body;

    var a = moment();
    var processChild = function (childProcess) {
        childProcess.once('message', function(m) {
            var b = moment();
            var diff = b.diff(a, 'milliseconds');
            logger.info('Request elapsed time: '+ diff.toString() + ' ms');
            res.send(m);
            eventDispatch.childFree(registry);
        });
        childProcess.send({
            "command": req.params.command,
            "data": queryData
        });
    };
    listener.pushChildQueue(processChild);
    eventDispatch.queueChild(registry);
});
app.listen(nconf.get('listen'));

