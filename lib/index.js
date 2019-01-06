'use strict';

/**
 * Module dependencies
 */

/* eslint-disable import/no-unresolved */
/* eslint-disable prefer-template */
// Public node modules.
const _ = require('lodash');
const SparkPost = require('sparkpost');

/* eslint-disable no-unused-vars */
module.exports = {
  provider: 'sparkpost',
  name: 'Sparkpost',
  auth: {
    sparkpost_default_from_name: {
      label: 'Sparkpost Default From Name',
      type: 'text'
    },
    sparkpost_default_from: {
      label: 'Sparkpost Default From Email',
      type: 'text'
    },
    sparkpost_default_replyto: {
      label: 'Sparkpost Default Reply-To Email',
      type: 'text'
    },
    sparkpost_api_key: {
      label: 'Sparkpost API Key',
      type: 'text'
    },
    sparkpost_api_endpoint: {
      label: 'Sparkpost API Endpoint URL (i.e. https://api.sparkpost.com:443 or https://api.eu.sparkpost.com:443).',
      type: 'text'
    }
  },
  init: config => {
    const client = new SparkPost(config.sparkpost_api_key, {
      endpoint: config.sparkpost_api_endpoint || 'https://api.sparkpost.com:443'
    });

    return {
      send: (options, cb) => {
        return new Promise((resolve, reject) => {
          // Default values.
          options = _.isObject(options) ? options : {};
          options.from = options.from || config.sparkpost_default_from;
          options.fromName =
            options.fromName || config.sparkpost_default_from_name;
          options.replyTo = options.replyTo || config.sparkpost_default_replyto;
          options.text = options.text || options.html;
          options.html = options.html || options.text;

          client.transmissions
            .send({
              content: {
                from: {
                  name: options.fromName,
                  email: options.from
                },
                subject: options.subject,
                html: options.html,
                reply_to: options.replyTo,
                text: options.text
              },
              recipients: [{ address: options.to }]
            })
            .then(data => {
              resolve();
            })
            .catch(result => {
              const messages = result.errors.map(
                error =>
                  `${error.code}: ${error.message} - ${error.description}`
              );
              let err = new Error(messages.join('\n'));
              err.stack = `\nCaused By:\n` + result.stack;
              reject(err);
            });
        });
      }
    };
  }
};
