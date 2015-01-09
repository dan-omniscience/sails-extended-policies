var extended_policies = function(req, res,policy,fn){
    var obj={};
    if(req.options.controller){
        obj = sails.controllers[req.options.controller];
    }else if(req.options.model){
        obj = sails.models[req.options.model]['meta'];
    }
    if(obj.hasOwnProperty(policy)){
        if(_.isObject(obj[policy]) && req.options.action){
            if(obj[policy].hasOwnProperty(req.options.action) && obj[policy][req.options.action]){
            	if(_.isFunction(obj[policy][req.options.action])){
	            	return obj[policy][req.options.action]();
               }
               else{
               		if(_.isString(obj[policy][req.options.action])){
		                return sails.hooks.policies.lookupFn(obj[policy][req.options.action])(req, res, fn);
               		}
	               	else{
	               		req.session.authenticated = obj[policy][req.options.action];
	               		return fn();
	               	}
               	}
            }
            else{
            	if(obj[policy].hasOwnProperty('*') && obj[policy]['*']){
            		if(_.isFunction(obj[policy]['*'])){
            			return obj[policy]['*']();
            		}
            		else{
            			if(_.isString(obj[policy]['*'])){
		            		return sails.hooks.policies.lookupFn(obj[policy]['*'])(req, res, fn);
	            		}
		            	else {
		            		req.session.authenticated = obj[policy]['*'];
		            		return fn();
		            	}
	            	}
            	}
	            else{
	            	req.session.authenticated = true; //if no global '*' allow access
	            	return fn();
	            }
            }
        }else {
            if(_.isFunction(obj[policy][req.options.action])){
               	return obj[policy][req.options.action](req, res, fn);
            }
	        else{
	        	if(obj[policy]){
	        		req.session.authenticated = obj[policy];
	        		return fn();
	        	}
	        }
        }
    }
};

module.exports.check = extended_policies;