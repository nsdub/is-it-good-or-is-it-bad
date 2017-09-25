import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Template } from 'meteor/templating';
import { Cards } from '../imports/api/cards.js';
import '../imports/startup/accounts-config.js';

// Meteor.startup(() => {
//   Cards = new Mongo.Collection('cards');
// });
