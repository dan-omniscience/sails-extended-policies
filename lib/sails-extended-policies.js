var extended_policies = function(req, res, policy, fn){
	var obj={};
	sails.log.info("================================");
	sails.log.info(policy);
	sails.log.info(req.options);
	
    if(req.options.controller){
        obj = sails.controllers[req.options.controller];
    }else if(req.options.model){
        obj = sails.models[req.options.model]['meta'];
	}
	sails.log.info(obj[policy]);
	// Default if no needAuth in controller is to deny
    if(!obj.hasOwnProperty(policy)){
		sails.log.info("1");
		req.session.authenticated = false;
		return fn();
	}
	if(!_.isObject(obj[policy])){
		if(_.isBoolean(obj[policy]) && !obj[policy]){ // needAuth: false => allow all actions
			sails.log.info("2");
			req.session.authenticated = true;
			return fn();
		}
		else{
			if(_.isString(obj[policy])){ //if string lookup policy
				sails.log.info("3");
				return sails.hooks.policies.lookupFn(obj[policy])(req, res, fn);
			}
			else{ // if not boolean and not string deny all
				sails.log.info("4");				
				req.session.authenticated = false;
				return fn();
			}
		}
	}
	else{
		// needAuth = { "action": [boolean|function|string], "*": [boolean|function|string] }
		if(!_.isEmpty(req.options.action) && !_.isEmpty(obj[policy][req.options.action])){
			if(_.isBoolean(obj[policy][req.options.action]) && !obj[policy][req.options.action]){ // "action": false => allow action
				sails.log.info("5");							
				req.session.authenticated = true;
				return fn();
			}
		}
		else{
			if (obj[policy].hasOwnProperty("*")) {
				if(_.isBoolean(obj[policy]["*"])){
					if(!obj[policy]["*"]) { // "*": false => "allow all actions"
						sails.log.info("6");	
						req.session.authenticated = true;
						return fn();
					}
					else{ // "*": true => "deny all actions"
						sails.log.info("7");
						req.session.authenticated = false;
						return fn();
					}
				}
				else{
					if(_.isString(obj[policy]["*"])){
						sails.log.info("8");						
						sails.log(obj[policy]["*"]);
						return sails.hooks.policies.lookupFn(obj[policy]["*"])(req, res, fn);
					}
				}

			}
		}
			
	}
	sails.log.info("================================");

        // sails.log.info(_.isObject(obj[policy]) && req.options.action);
        // if (_.isObject(obj[policy]) && req.options.action) {
        //   if (obj[policy].hasOwnProperty(req.options.action) && obj[policy][req.options.action]) {
        //     if (_.isFunction(obj[policy][req.options.action])) {
        //       sails.log.info("1");
        //       return obj[policy][req.options.action]();
        //     } else {
        //       if (_.isString(obj[policy][req.options.action])) {
        //         sails.log.info("2");
        //         return sails.hooks.policies.lookupFn(obj[policy][req.options.action])(req, res, fn);
        //       } else {
        //         sails.log.info("3");
        //         req.session.authenticated = obj[policy][req.options.action];
        //         return fn();
        //       }
        //     }
        //   } else {
        //     if (obj[policy].hasOwnProperty("*") && obj[policy]["*"]) {
        //       if (_.isFunction(obj[policy]["*"])) {
        //         sails.log.info("4");

        //         return obj[policy]["*"]();
        //       } else {
        //         if (_.isString(obj[policy]["*"])) {
        //           sails.log.info("5");

        //           return sails.hooks.policies.lookupFn(obj[policy]["*"])(req, res, fn);
        //         } else {
        //           sails.log.info("6");

        //           req.session.authenticated = obj[policy]["*"];
        //           return fn();
        //         }
        //       }
        //     } else {
        //       sails.log.info("7");
        //       req.session.authenticated = false; //if no global '*' deny access
        //       return fn();
        //     }
        //   }
        // } else {
        //   // No needAuth object
        //   if (_.isFunction(obj[policy][req.options.action])) {
        //     sails.log.info("8");

        //     return obj[policy][req.options.action](req, res, fn);
        //   } else {
        //     if (obj[policy]) {
        //       sails.log.info("9");

        //       req.session.authenticated = obj[policy];
        //       return fn();
        //     }
        //   }
        // }
    //   }
};

module.exports.check = extended_policies;
