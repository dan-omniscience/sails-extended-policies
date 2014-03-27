var extended_policies = function(req,policy,fn){
    var obj={};
    if(req.options.controller){
        obj = sails.controllers[req.options.controller];
    }else if(req.options.model){
        obj = sails.models[req.options.model]['meta'];
    }
    if(obj.hasOwnProperty(policy)){
        if(_.isObject(obj[policy]) && req.options.action){
            if(obj[policy].hasOwnProperty(req.options.action) && obj[policy][req.options.action]){
                return fn();
            }
        }else {
            if(obj[policy]){
                return fn();
            }
        }
    }
};

module.exports.check = extended_policies;