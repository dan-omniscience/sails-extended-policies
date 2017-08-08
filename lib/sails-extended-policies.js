var extended_policies = function (req, res, policy, fn) {
  var debug = sails.config.extendedPolicies.debug || false;
  if (debug) {
    sails.log.debug("Extended Policy");
    sails.log.debug("================================");
  }

  var obj = {};

  if (req.options.controller) {
    if (debug) {
      if (debug) {
        sails.log.debug("Controller");
      }
    }
    obj = sails.controllers[req.options.controller];
  } else if (req.options.model) {
    if (debug) {
      sails.log.debug("Model");
    }
    obj = sails.models[req.options.model]["meta"];
  }
  sails.log.debug("needAuth attribute", obj[policy]);
  // Default if no needAuth in controller is to deny
  if (!obj.hasOwnProperty(policy)) {
    if (debug) {
      sails.log.debug("no needAuth attribute => DENY REQUEST");
      sails.log.debug("================================");
    }
    return fn();
  }
  if (!_.isObject(obj[policy])) {
    if (debug) {
      sails.log.debug("needAuth is not an object");
    }
    if (_.isBoolean(obj[policy]) && !obj[policy]) {
      // needAuth: false => allow all actions
      if (debug) {
        sails.log.debug("needAuth false => ALLOW REQUEST");
        sails.log.debug("================================");
      }
      return fn(true);
    } else {
      if (_.isString(obj[policy])) {
        //if string lookup policy
        if (debug) {
          sails.log.debug("needAuth is a policy => redirect to " + obj[policy]);
          sails.log.debug("================================");
        }
        return sails.hooks.policies.lookupFn(obj[policy])(req, res, fn);
      } else {
        // if not boolean and not string deny all
        if (debug) {
          sails.log.debug("needAuth is not a boolean and not a string => DENY REQUEST");
          sails.log.debug("================================");
        }
        return fn();
      }
    }
  } else {
    if (debug) {
      sails.log.debug("needAuth is an object");
    }
    // needAuth = { "action": [boolean|function|string], "*": [boolean|function|string] }
    if (!_.isEmpty(req.options.action) && obj[policy].hasOwnProperty(req.options.action)) {
      var action = req.options.action;
      sails.log.debug("req.options.action", action);
      sails.log.debug("needAuth Action", obj[policy][action]);
      if (_.isBoolean(obj[policy][action]) && !obj[policy][action]) {
        // "action": false => allow action
        if (debug) {
          sails.log.debug("action false => ALLOW REQUEST");
          sails.log.debug("================================");
        }
        // req.session.authenticated = true;
        return fn(true);
      } else if (_.isString(obj[policy][action])) {
        if (debug) {
          sails.log.debug("action is a policy => redirect to " + obj[policy][action]);
          sails.log.debug("================================");
        }
        return sails.hooks.policies.lookupFn(obj[policy][action])(req, res, fn);
      } else {
        // if not boolean and not string deny all
        if (debug) {
          sails.log.debug("action is not a boolean and not a string => DENY REQUEST");
          sails.log.debug("================================");
        }
        return fn();
      }
    } else {
      if (debug) {
        sails.log.debug("No action in needAuth");
      }
      if (obj[policy].hasOwnProperty("*")) {
        if (debug) {
          sails.log.debug("Global check *");
        }
        if (_.isBoolean(obj[policy]["*"])) {
          if (!obj[policy]["*"]) {
            // "*": false => "allow all actions"
            if (debug) {
              sails.log.debug("* is false => ALLOW REQUEST");
              sails.log.debug("================================");
            }
            return fn(true);
          } else {
            // "*": true => "deny all actions"
            if (debug) {
              sails.log.debug("* is true => DENY REQUEST");
              sails.log.debug("================================");
            }
            return fn();
          }
        } else {
          if (_.isString(obj[policy]["*"])) {
            if (debug) {
              sails.log.debug("* is a policy => redirect to " + obj[policy]["*"]);
              sails.log.debug("================================");
            }
            return sails.hooks.policies.lookupFn(obj[policy]["*"])(req, res, fn);
          }
        }
      }
    }
  }
};

module.exports.check = extended_policies;