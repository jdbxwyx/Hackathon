/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your application specific code will go here
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojmodule-element-utils', 'ojs/ojknockout', 'ojs/ojmodule-element', 'ojs/ojrouter', 'ojs/ojarraytabledatasource', 'ojs/ojoffcanvas', 'ojs/ojbutton'],
  function(oj, ko, moduleUtils) {
     function ControllerViewModel() {
      var self = this;

      // Router setup
      self.router = oj.Router.rootInstance;
      self.router.configure({
       'dashboard': {label: 'Current Parking'},
       'incidents': {label: 'Parking History'},
       'customers': {label: 'My Settings'},
       'profile': {label: 'My Profile'},
       'signin':{label:'Sign in', isDefault: true},
       'about': {label: 'About Us'}
      });
      oj.Router.defaults['urlAdapter'] = new oj.Router.urlParamAdapter();

      self.moduleConfig = ko.observable({'view':[], 'viewModel':null});

      self.loadModule = function() {
        ko.computed(function() {
          var name = self.router.moduleConfig.name();
          var viewPath = 'views/' + name + '.html';
          var modelPath = 'viewModels/' + name;
          var masterPromise = Promise.all([
            moduleUtils.createView({'viewPath':viewPath}),
            moduleUtils.createViewModel({'viewModelPath':modelPath})
          ]);
          masterPromise.then(
            function(values){
              self.moduleConfig({'view':values[0],'viewModel':values[1]});
            }
          );
        });
      };

      // Navigation setup
      var navData = [
      {name: 'Current Parking', id: 'dashboard',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chart-icon-24'},
      {name: 'Parking History', id: 'incidents',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-fire-icon-24'},
      {name: 'My Settings', id: 'customers',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-people-icon-24'},
      {name: 'Profile', id: 'profile',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-person-icon-24'},
      {name: 'About Us', id: 'about',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-info-icon-24'}
      ];
      self.navDataSource = new oj.ArrayTableDataSource(navData, {idAttribute: 'id'});

      // Drawer setup
      self.toggleDrawer = function() {
        var currentPage = document.getElementsByClassName('oj-navigationlist-item-element oj-navigationlist-item oj-selected')[0];
        if (currentPage.key == "dashboard") {
          var mapDiv = document.getElementById('container');
          mapDiv.style.display = "block";
        } else {
          var mapDiv = document.getElementById('container');
          mapDiv.style.display = "none";
        }
        return oj.OffcanvasUtils.toggle({selector: '#navDrawer', modality: 'modal', content: '#pageContent'});
      }
      // Add a close listener so we can move focus back to the toggle button when the drawer closes
      $("#navDrawer").on("ojclose", function() { $('#drawerToggleButton').focus(); });

      // Header Setup
      self.getHeaderModel = function() {
        this.pageTitle = self.router.currentState().label;
        this.transitionCompleted = function() {
          // Adjust content padding after header bindings have been applied
          self.adjustContentPadding();
        }
        this.toggleDrawer = self.toggleDrawer;
      };

      // Method for adjusting the content area top/bottom paddings to avoid overlap with any fixed regions.
      // This method should be called whenever your fixed region height may change.  The application
      // can also adjust content paddings with css classes if the fixed region height is not changing between
      // views.
      self.adjustContentPadding = function () {
        var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];
        var contentElem = document.getElementsByClassName('oj-applayout-content')[0];
        var bottomElem = document.getElementsByClassName('oj-applayout-fixed-bottom')[0];

        if (topElem) {
          contentElem.style.paddingTop = topElem.offsetHeight+'px';
        }
        if (bottomElem) {
          contentElem.style.paddingBottom = bottomElem.offsetHeight+'px';
        }
        // Add oj-complete marker class to signal that the content area can be unhidden.
        // See the override.css file to see when the content area is hidden.
        contentElem.classList.add('oj-complete');
      }

      //get user info
      self.getUserProfile = function () {
        return new Promise(function(resolve, reject){
          data.getUserProfile().then(function(response){
            processUserProfile(response, resolve, reject);
          }).catch(function(response){
            oj.Logger.warn('Failed to connect to MCS. Loading from local data.');
            self.usingMobileBackend(false);
            //load local profile data
            data.getUserProfile().then(function(response){
              processUserProfile(response, resolve, reject);
            });
          });
        });
      }

      function processUserProfile(response, resolve, reject) {
        var result = JSON.parse(response);
  
        if (result) {
          initialProfile = result;
          self.userProfileModel(ko.mapping.fromJS(result));
          resolve(self.userProfileModel);
          return;
        }
  
        // This won't happen in general, because then that means the entire offline data loading is broken.
        var message = 'Failed to load user profile both online and offline.';
        oj.Logger.error(message);
        reject(message);
      }

      self.updateProfileData = function(updatedModel) {
        imageHelper.loadImage(updatedModel().photo())
          .then(function(base64Image) {
            updatedModel().photo = base64Image;
            initialProfile = ko.mapping.toJS(updatedModel);
            return data.updateUserProfile(initialProfile)
          })
          .then(function() {
            self.getUserProfile();
          })
          .catch(function(response){
            oj.Logger.error(response);
            self.connectionDrawer.showAfterUpdateMessage('Failed to save user profile');
          });
      };

      // Revert changes to user profile
      self.revertProfileData = function() {
        self.userProfileModel(ko.mapping.fromJS(initialProfile));
      };

    }

        // initialise spen plugin
        self.spenSupported = ko.observable(false);
        function isSpenSupported() {
          self.spenSupported(true);
        }
        function initialise() {
          if (window.samsung) {
            samsung.spen.isSupported(isSpenSupported, spenFail);
          }
        }
        function spenFail(error) {
          oj.Logger.error(error);
        }
        initialise();
    
    
        var prevPopupOptions = null;
    
        self.setupPopup = function(imgSrc) {
    
          // Define the success function. The popup launches if the success function gets called.
          var success = function(imageURI) {
    
            if(imageURI.length > 0) {
              // SPen saves image to the same url
              // add query and timestamp for versioning of the cache so it loads the latest
              imageURI = imageURI + '?' + Date.now();
              imgSrc(imageURI);
            }
    
          }
    
          // Define the faliure function. An error message displays if there are issues with the popup.
          var failure = function(msg) {
          oj.Logger.error(msg);
        }
  
        // If there are any previous popups, remove them first before creating a new popup
        if (prevPopupOptions !== null){
          // Call the removeSurfacePopup method from the SPen plugin
          samsung.spen.removeSurfacePopup(prevPopupOptions.id, function() { }, failure);
        }
  
        var popupOptions = {};
        popupOptions.id = "popupId";
  
        popupOptions.sPenFlags = 0;
  
        // strip off suffix from compressed image
        var imageURL;
        if(imgSrc().lastIndexOf('?') > -1) {
          imageURL = imgSrc().slice(0, imgSrc().lastIndexOf('?'));
        } else {
          imageURL = imgSrc();
        }
  
        popupOptions.imageUri = imageURL;
        popupOptions.imageUriScaleType = samsung.spen.IMAGE_URI_MODE_STRETCH;
        popupOptions.sPenFlags = samsung.spen.FLAG_PEN | samsung.spen.FLAG_ERASER | samsung.spen.FLAG_UNDO_REDO |
                              samsung.spen.FLAG_PEN_SETTINGS;
        popupOptions.returnType = samsung.spen.RETURN_TYPE_IMAGE_URI;
  
        //Launch the popup
        prevPopupOptions = popupOptions;
        samsung.spen.launchSurfacePopup(popupOptions, success, failure);
  
      };
      
    return new ControllerViewModel();
  }
);
