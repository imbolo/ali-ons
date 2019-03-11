'use strict';

const logger = require('./logger');
const config = require('./config');
const httpclient = require('urllib');
const Producer = require('../lib').Producer;
const Message = require('../lib').Message;

const producer = new Producer(Object.assign({ httpclient, logger }, config));
producer.localTransactionChecker = async function (msg) {
  console.log('check transaction: ', msg);
  const state = 'COMMIT_MESSAGE';
  console.log('get local check state:', state);
  return state || 'UNKNOW';
};
(async () => {
  try {
    await producer.ready();
    const msg = new Message(config.topic, // topic
      'TagA', // tag
      'Hello ONS !!! ' // body
    );

    const sendResult = await producer.sendMessageInTransaction(msg, async () => 'UNKNOW');
    console.log(sendResult);
  } catch (err) {
    console.error(err)
  }
})();
