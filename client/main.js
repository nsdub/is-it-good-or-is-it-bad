import '../imports/startup/accounts-config.js';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Cards } from '../imports/api/cards.js';

var timeoutLength = 25;

function createItem(event) {
  var title = event.target.title.value;
  var stack = Number(event.target.stack.value);
  var order = Number(event.target.order.value);
  var morality = event.target.morality.value;

  // Insert a card into the collection
  Meteor.call('cards.insert', title, stack, order, morality);
}

function saveItem(event) {
  var title = event.target.title.value;
  var stack = Number(event.target.stack.value);
  var order = Number(event.target.order.value);
  var morality = event.target.morality.value;

  var editItem = {
    title: title,
    stack: stack,
    order: order,
    morality: morality
  }

  // Update card in collection
  Meteor.call('cards.update', Session.get('editItemId'), {$set: editItem});

  Session.set('editItemId', null);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function generateStackNumber() {
  Session.set('stackNumber', getRandomInt(1, 7)); // This needs to be modified to have a max value of the number of stacks present
};

function getStack(stackNumber) {
  return Cards.find({
    stack: stackNumber
  });
};

function getCurrentCard() {
  return Cards.find({
    stack: Session.get('stackNumber'),
    order: Session.get('stackOrder')
  });
};

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
};

function getFlashMessageSubtext(response) {
  var completedCards = Session.get('completedCards');

  if (response == "correct") {
    if (completedCards == 0) {
      var arr = ["Finally, someone who gets it.",]
    } else if (completedCards == 1) {
      var arr = ["The world needs more people like you.", "Faith in humanity restored."]
    } else if (completedCards == 2) {
      var arr = ["This. A million times this.",]
    } else if (completedCards == 3) {
      var arr = ["At last! Some sanity!",]
    } else if (completedCards == 4) {
      var arr = ["YAAAAASSSS!!",]
    }
  } else if (response == "incorrect") {
    if (completedCards == 0) {
      var arr = ["Um, how about no.", "Let's pretend you didn't mean that."];
    } else if (completedCards == 1) {
      var arr = ["You cannot be serious right now.", "This needs to stop."]
    } else if (completedCards == 2) {
      var arr = ["Go back to whatever hole you crawled out of.", "Don't infect us with your views."];
    } else if (completedCards == 3) {
      var arr = ["Are you deaf, dumb, blind, or all of the above?", "You should be ashamed of yourself."]
    } else if (completedCards == 4) {
      var arr = ["You are literally worse than Hitler.", "You and Satan sure have a lot in common."]
    }
  };
  return getRandomItem(arr);
};

function generateFlashMessage(message, thing) {
  var subtext = getFlashMessageSubtext(thing);

  $(".response-feedback #overlay h1").text(message);
  $(".response-feedback #overlay h4").text(subtext);
  $(".response-feedback #overlay").removeClass().addClass(thing).fadeIn(50);

  setTimeout(function(){
    $(".response-feedback #overlay").fadeOut(200);
  }, timeoutLength)
};

function clearFlashMessages() {
  $(".response-feedback #message").hide();
};

function checkResponse(val) {
  var currentScore = Session.get('userScore');
  var cardMorality = getCurrentCard().fetch().map(function(card) {
    return card.morality;
  });

  clearFlashMessages();

  if(cardMorality == val && Session.get('userScore') < 6) {
    Session.set('userScore', currentScore + 1);
    Session.set('lastPrompt', "correct");
    generateFlashMessage("RIGHT!", "correct");
  }
  else {
    Session.set('lastPrompt', "incorrect");
    generateFlashMessage("WRONG!", "incorrect")
  }
};

function updateCardStats(event) {
  var current_card = Cards.findOne({
    stack: Session.get('stackNumber'),
    order: Session.get('stackOrder')
  });
  var old_responded_count = current_card.responded_count;
  var old_correct_count = current_card.correct_count;
  if (Session.get('lastPrompt') == "correct"){
    var new_correct_count = old_correct_count + 1;
  } else {
    var new_correct_count = old_correct_count;
  };
  var editStats = {
    responded_count: old_responded_count + 1,
    correct_count: new_correct_count
  };

  Meteor.call('cards.update_stats', current_card._id, {$set: editStats});
};

function generateResults(score) {
  if (score == 0) {
    return "DESPICABLE";
  } else if (score == 1) {
    return "Unequivocally BAD";
  } else if (score == 2) {
    return "Mostly BAD";
  } else if (score == 3) {
    return "Ambiguously BAD";
  } else if (score == 4) {
    return "Mostly GOOD";
  } else if (score == 5) {
    return "Resoundingly GOOD";
  }
};

function renderResults(score) {
  var judgment = generateResults(score);
  $("#judgment").text(judgment);

  $(".prompt").hide();
  $(".results").show();
  $(".results h4").fadeTo(1500, 1);

  // Nested timeout to first show judgment, then social buttons
  setTimeout(function(){
    $("#judgment").fadeTo(3000, 1);
    setTimeout(function(){
      $(".social-buttons").fadeTo(1000, 1);
    }, 2000)
  }, 3000)
}

function fadeInContent() {
  $(".container").fadeIn(1000);
};

Template.main_layout.onRendered(function() {
  fadeInContent();
});

Template.game.onCreated(function setSessionVar() {
  Session.set('completedCards', 0);
  generateStackNumber();
  Session.set('stackOrder', 1);
  Session.set('userScore', 0);
});

Template.game.helpers({
  served: function() {
    return getCurrentCard();
  },
});

Template.game.events({
  'click .response'(event, instance) {
    // See if the user got the prompt correct and increase score and show flash message
    checkResponse(event.target.value);

    // Update the card stats
    updateCardStats(event);

    // Increment question count by one
    var completedCards = Session.get('completedCards');
    Session.set('completedCards', completedCards + 1);

    // Move to next card
    var currentOrder = Session.get('stackOrder');
    setTimeout(function(){
      $(".response-feedback #message").fadeOut(400);
      if(currentOrder < 5){
        Session.set('stackOrder', currentOrder + 1);
        Session.set('completedCards', completedCards + 1);
      };

      if(Session.get('completedCards') == 5) {
        $(".morality-buttons .response").hide();
        $(".reset-button").show();
        renderResults(Session.get('userScore'));
      }
    }, timeoutLength)

    return event.preventDefault();
  },

  'click .reset'(event, instance) {
    Session.set('userScore', 0);
    Session.set('completedCards', 0);
    generateStackNumber();
    Session.set('stackOrder', 1);
    clearFlashMessages();
    $(".reset-button").hide();
    $(".results").hide();
    $(".social-buttons").hide();
    $(".morality-buttons .response").show();
    $(".container").hide();
    fadeInContent();
  },

  // Remove overlay if someone clicks on it before timeout.
  // 'click #overlay'(event, instance){
  //   $('#overlay').fadeOut(200);
  // },
});

Template.metrics.helpers({
  score() {
    return Session.get('userScore');
  },

  counter() {
    return Session.get('stackOrder');
  },
});

Template.manage.helpers({
  cards: function() {
    return Cards.find({});
  },
});

Template.card_view_row.helpers({
  percent_correct: function(responded_count, correct_count) {
    return Math.floor(responded_count / correct_count * 100);
  }
});

Template.manage.events({
  'submit .new-card-form': function(event) {
    createItem(event);
    event.currentTarget.reset();
    return event.preventDefault();
  },
});

Template.card.events({
  'click .delete': function(event) {
    if (confirm("You sure bruh?")) {
      Meteor.call('cards.remove', this._id);
    }
  },
  'click .editItem': function(){
    Session.set('editItemId', this._id);
  },
  'click .cancelItem': function(){
    Session.set('editItemId', null);
  },
  'submit .edit-card-form': function(event){
    saveItem(event);
    return event.preventDefault();
  }
});

Template.card.helpers({
  editing: function() {
    return Session.equals('editItemId', this._id);
  },
});

UI.registerHelper('shareOnFacebookLink', function() {
  // return 'https://www.facebook.com/sharer/sharer.php?&u=' + window.location.href;
  return 'https://www.facebook.com/sharer/sharer.php?&u=www.nsdub.com';
});

UI.registerHelper('shareOnTwitterLink', function() {
  return 'https://twitter.com/intent/tweet?url=' + window.location.href + '&text=' + document.title;
});

UI.registerHelper('shareOnGooglePlusLink', function() {
  return 'https://plus.google.com/share?url=' + window.location.href;<br />
});
