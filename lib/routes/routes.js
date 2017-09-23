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
  this.route('about', {
    path: '/about',
    template: 'about'
  });
});
