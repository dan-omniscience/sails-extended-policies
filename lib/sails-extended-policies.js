var extended_policies = function(req, res, policy, fn) {
  sails.log.info("Extended Policy");
  sails.log.info("================================");

  var obj = {};

  if (req.options.controller) {
    sails.log.info("Controller");
    obj = sails.controllers[req.options.controller];
  } else if (req.options.model) {
    sails.log.info("Model");
    obj = sails.models[req.options.model]["meta"];
  }
  sails.log.info("needAuth attribute", obj[policy]);
  // Default if no needAuth in controller is to deny
  if (!obj.hasOwnProperty(policy)) {
    sails.log.info("no needAuth attribute => DENY REQUEST");
    // req.session.authenticated = false;
    sails.log.info("================================");
    return fn();
  }
  if (!_.isObject(obj[policy])) {
    sails.log.info("needAuth is not an object");
    if (_.isBoolean(obj[policy]) && !obj[policy]) {
      // needAuth: false => allow all actions
      sails.log.info("needAuth false => ALLOW REQUEST");
      // req.session.authenticated = true;
      sails.log.info("================================");
      return fn(true);
    } else {
      if (_.isString(obj[policy])) {
        //if string lookup policy
        sails.log.info("needAuth is a policy => redirect to " + obj[policy]);
        sails.log.info("================================");
        return sails.hooks.policies.lookupFn(obj[policy])(req, res, fn);
      } else {
        // if not boolean and not string deny all
        sails.log.info("needAuth is not a boolean and not a string => DENY REQUEST");
        // req.session.authenticated = false;
        sails.log.info("================================");
        return fn();
      }
    }
  } else {
    sails.log.info("needAuth is an object");
    // needAuth = { "action": [boolean|function|string], "*": [boolean|function|string] }
    if (!_.isEmpty(req.options.action) && obj[policy].hasOwnProperty(req.options.action)) {
      var action = req.options.action;
      sails.log.info("req.options.action", action);
      sails.log.info("needAuth Action", obj[policy][action]);
      if (_.isBoolean(obj[policy][action]) && !obj[policy][action]) {
        // "action": false => allow action
        sails.log.info("action false => ALLOW REQUEST");
        // req.session.authenticated = true;
        sails.log.info("================================");
        return fn(true);
      } else if (_.isString(obj[policy][action])) {
        sails.log.info("action is a policy => redirect to " + obj[policy][action]);
        sails.log.info("================================");
        return sails.hooks.policies.lookupFn(obj[policy][action])(req, res, fn);
      } else {
        // if not boolean and not string deny all
        sails.log.info("action is not a boolean and not a string => DENY REQUEST");
        // req.session.authenticated = false;
        sails.log.info("================================");
        return fn();
      }
    } else {
      sails.log.info("No action in needAuth");
      if (obj[policy].hasOwnProperty("*")) {
        sails.log.info("Global check *");
        if (_.isBoolean(obj[policy]["*"])) {
          if (!obj[policy]["*"]) {
            // "*": false => "allow all actions"
            sails.log.info("* is false => ALLOW REQUEST");
            // req.session.authenticated = true;
            sails.log.info("================================");
            return fn(true);
          } else {
            // "*": true => "deny all actions"
            sails.log.info("* is true => DENY REQUEST");
            // req.session.authenticated = false;
            sails.log.info("================================");
            return fn();
          }
        } else {
          if (_.isString(obj[policy]["*"])) {
            sails.log.info("* is a policy => redirect to " + obj[policy]["*"]);
            sails.log.info("================================");
            return sails.hooks.policies.lookupFn(obj[policy]["*"])(req, res, fn);
          }
        }
      }
    }
  }

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
