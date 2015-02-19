'use strict';
var Joi = require('joi');
var Verror = require("verror");
var log = require('debug')('status:validator');

var Validator = function(){
  var self = this;

  self.validate = validateSchema;


  ////////////   SCHEMA DEFINITION   ////////////

  var categoryCodes = ["CDN", "TRT", "RTE", "UPL"];
  var statusCodes = ["OK", "ERR", "MNT", "DGR"];
  var systemCodes = ["MCC", "TCC", "LLS", "LIS", "ODS", "UCC"];
  var serviceCodes = ["HLG", "HSM", "ADN", "ING", "DLY", "FTP", "STG", "PRG", "SRT", "ADA", "SZT", "API"];
  var locationCodes = ["DCA", "IAD", "ATL", "FTY", "MDW", "ORD", "DFW", "FTW", "BUR", "CPM", "LAX", "OXR",
                       "FLL", "MIA", "EWR", "LGA", "BNG", "RHV", "SJC", "CGH", "PAE", "SEA", "AMS", "RTM",
                       "CPH", "FCN", "FRA", "FRF", "HEL", "LCY", "LHR", "MAD", "TOJ", "MXP", "CDG", "ORY",
                       "ARN", "STO", "VIE", "WAW", "BTH", "HHP", "CGK", "KHH", "MEL", "KIX", "SIN", "SYD",
                       "HND", "NRT", "MCC", "TCC", "UCC", "LIS", "LLS", "ODS"];

  var locationSchema = Joi.array().includes(
    Joi.object().keys({
      code: Joi.string().valid(locationCodes).required(),
      name: Joi.string().required(),
      region: Joi.string().required()
    })).required();

  var serviceSchema = Joi.array().includes(
    Joi.object().keys({
      code: Joi.string().valid(serviceCodes).required(),
      name: Joi.string().required(),
      locations: locationSchema
    })).required();

  var systemSchema = Joi.array().includes(
    Joi.object().keys({
      code: Joi.string().valid(systemCodes).required(),
      name: Joi.string().required(),
      status: Joi.string().valid(statusCodes).required()
    }))
    .when('code', {is: 'RTE', then: Joi.optional(), otherwise: Joi.required()});

  var categorySchema = Joi.object().keys({
    code: Joi.string().valid(categoryCodes).required(),
    name: Joi.string().required(),
    systems: systemSchema,
    services: serviceSchema
  });

  var schema = Joi.array().includes(categorySchema);

  ////////////  END SCHEMA DEFINITION   ////////////


  var options = {
    stripUnknown: true,
    presence: "optional"
  };

  function validateSchema(data, done){


    Joi.validate(data, schema, options, function(err, value){
      var error = null;

      if (err) {
        error = new Verror(err, 'Schema Validator Error');
        log('FAILED: ' + value + ' - ' + JSON.stringify(err, null, 2));
      } else {
        log('OK: ' + JSON.stringify(value));
      }
      done(error, value);
    });
  }

  return self;
};


module.exports = Validator;
