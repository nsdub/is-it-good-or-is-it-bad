import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Cards = new Mongo.Collection('cards');

Meteor.methods({
  'cards.insert'(title, stack, order, morality) {
    check(title, String);
    check(stack, Number);
    check(order, Number);
    check(morality, String);

    // Make sure the user is logged in before inserting a card
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Cards.insert({
      title: title,
      stack: stack,
      order: order,
      morality: morality,
      responded_count: 0,
      correct_count: 0,
      createdAt: new Date(),
    });
  },

  'cards.update'(card_id, var_mapping) {
    // Make sure the user is logged in before updating card
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Cards.update(card_id, var_mapping);
  },

  'cards.update_stats'(card_id, var_mapping) {
    // User should not need to be logged in
    Cards.update(card_id, var_mapping);
  },

  'cards.remove'(card_id) {
    // Make sure the user is logged in before updating card
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Cards.remove(card_id);
  },
});
