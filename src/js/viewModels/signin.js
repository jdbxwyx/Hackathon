/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/**
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */

 // signin page viewModel
 // In a real app, replace it with your authentication and logic
 'use strict';
 define(['ojs/ojcore', 'knockout', 'jquery', 'appController',
         'ojs/ojrouter',
         'ojs/ojknockout',
         'ojs/ojcheckboxset',
         'ojs/ojinputtext',
         'ojs/ojbutton',
         'ojs/ojvalidationgroup',
         'ojs/ojanimation'], function(oj, ko, $, app) {
   function signin() {
     var self = this;
 
     self.transitionCompleted = function() {
       app.setFocusAfterModuleLoad('signInBtn');
       var animateOptions = { 'delay': 0, 'duration': '1s', 'timingFunction': 'ease-out' };
       oj.AnimationUtils['fadeIn']($('.demo-signin-bg')[0], animateOptions);
     }
 
     self.groupValid = ko.observable();
     self.userName = ko.observable();
     self.passWord = ko.observable();
     self.rememberUserName = ko.observable();
 
     // First time, rememberUserName in sessionStorage will not be set. In this case we default to true.
     if (window.sessionStorage.rememberUserName === undefined || window.sessionStorage.rememberUserName === 'true') {
       app.getUserProfile()
         .then(function(userProfile) {
           self.userName(userProfile.firstName() + ' ' + userProfile.lastName());
         }).catch(function() {
           // This won't happen in general, because then that means the entire offline data loading is broken.
           // Use default user name if at all this happens.
           self.userName("User1");
         });
       self.passWord('password');
       self.rememberUserName(['remember']);
     }
 
     // Replace with sign in authentication
     self.signIn = function() {
       if (self.groupValid() !== "valid")
         return;
       //alert("Welcome to Parking Zoon");
       var _url = "39.104.81.6:8000/api/v1.0";
       //$.post(_url);
       $.ajax({
         type: 'POST',
         url: _url
         // data: data,
         // success: success,
         // dataType: dataType
       });
 
       window.sessionStorage.rememberUserName = '' + (self.rememberUserName() && self.rememberUserName().indexOf('remember') != -1);
       //app.pushClient.registerForNotifications();
       oj.Router.rootInstance.go('dashboard');

      var mapDiv = document.getElementById('container');
      mapDiv.style.display = "block";

     };
 
   }
   return signin;
 });
 