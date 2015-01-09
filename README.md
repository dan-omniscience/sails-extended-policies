sails-extended-policies
==============

Module for sails.js for control policies inside controllers or models

## Usage

### Policy file

file:api/policies/extendedPolicies.js
```javascript
// A user may only have a single pet
var ep = require('sails-extended-policies');

module.exports = function(req, res, next) {
  return ep.check(req, res, 'needAuth', function() {
          // User is allowed, proceed to the next policy, 
          // or if this is the last policy, the controller
          if (req.session.authenticated) {
            return next();
          }

          // User is not allowed
          // (default res.forbidden() behavior can be overridden in `config/403.js`)
          return res.forbidden('You are not permitted to perform this action.');
    });  
};
```

### Controller file

file:api/controllers/TestController.js
```javascript
module.exports = {
        needAuth:true, // execute policy for all actions of this controller
	    /*
	    //It support the policies from the user policies directory
	    needAuth: 'isAdmin',
	    
        // for action based policies you can use this
        //It support the policies from the user policies directory
        needAuth:{
           yourAction: true, // execute policy on this action
           yourOtherAction: 'isAdmin'
        }
        */
};
```

### Models
if you want to execute policis in models you can use the 'meta' property in model

file:api/models/Test.js
```javascript
module.exports = {
    attributes: {
    },
    meta: {
        needAuth: true, // execute policy for all actions of this controller
        /*
        // for action based policies you can use this
        //It support the policies from the user policies directory
        needAuth:{
           yourAction: true, // execute policy on this action
           yourOtherAction: 'isAdmin'
        }
        */
    }
};
```



## sails config

file: config/policies.js
```javascript
module.exports.policies = {
  // Default policy for all controllers and actions
  // (`true` allows public access) 
  '*': 'extendedPolicies'
};
```