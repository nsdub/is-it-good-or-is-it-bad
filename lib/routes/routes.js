Router.configure({
  layoutTemplate: 'main_layout'
});

Router.map(function(){
  this.route('home', {
    path: '/',
    template: 'home'
  });
  this.route('manage', {
    path: '/manage',
    template: 'manage'
  });
  this.route('what-is-this', {
    path: '/what-is-this',
    template: 'what_is_this'
  });
});
