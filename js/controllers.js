angular.module('starter.controllers', [])
  .controller('AppCtrl', function($scope,$state,$rootScope,$ionicHistory,$window,$ionicViewSwitcher,$ionicSideMenuDelegate,$ionicPlatform, $cordovaNativeAudio,$ionicModal,$ionicPopup,A,$localstorage,Navigation,$ionicPlatform,$ionicSlideBoxDelegate,$ionicScrollDelegate,$timeout,currentUser,$interval,$ionicActionSheet,$state,$sce,$cordovaCamera,$ionicLoading) {		
	
	$rootScope.logged = false;
	$rootScope.hideNav = false;
	$rootScope.trustPhoto = function(url){
		return $sce.trustAsResourceUrl(url);		
	}		
	
	$rootScope.openMenu = function() {
		$ionicSideMenuDelegate.toggleLeft();
	}  	
	$rootScope.toogleMenu = function(){
		alang = $localstorage.getObject('alang');
		$scope.alang = [];
		angular.forEach(alang,function(entry) {						  
		  $scope.alang.push({
			id: entry,
			text: entry.text
		  });
		})		
		$ionicSideMenuDelegate.toggleLeft();
	}
	$rootScope.goToChatGlobal = function(url,slide,val) {
		currentUser.selectedUser=val;
		if(window.cordova){
			$ionicSideMenuDelegate.toggleLeft();
			$state.go(url, val);
		} else {
			$ionicSideMenuDelegate.toggleLeft();
			$state.go(url, val); 		
		} 
	};

	$rootScope.goTo = function(url,slide) {

		/*
		if (url.indexOf('home.menu') !== -1) {
		  $rootScope.hideNav = true; 
		} */
		
		if(window.cordova){
			$state.go(url);

		} else {		
			$state.go(url); 		
		}  
	};	

	$rootScope.goBack = function(){
		$ionicHistory.goBack();	
	}						
	$rootScope.aImages = '';
	$rootScope.cards = [];

	//MENU WIDTH
	var a = $window.innerWidth;
	a = a - 25;
	$rootScope.menuWidth = a;
	var b = $window.innerHeight;
	$rootScope.menuHeight = b;		
	$rootScope.appGifts = [];
	$rootScope.logout = function(){
		var message = oneSignalID;
		A.Query.get({action: 'logout', query: message});
		$localstorage.setObject('user','');
		$localstorage.set('userHistory','');
		chats = [];
		matche = [];
		mylikes = [];
		myfans = [];
		cards = [];
		visitors = [];
		$ionicSideMenuDelegate.toggleLeft();$state.go('loader');		
	}


	$rootScope.loader = function(){
	  try {	
		  $scope.ajaxRequest = A.Device.get({action: 'config', dID: oneSignalID});
		  $scope.ajaxRequest.$promise.then(function(){											
				$localstorage.setObject('config', $scope.ajaxRequest.config);
				$localstorage.setObject('app', $scope.ajaxRequest.app);
				app = $scope.ajaxRequest.app;
				$localstorage.setObject('prices', $scope.ajaxRequest.prices);
				max_ad = $scope.ajaxRequest.ad;
				var isAndroid = ionic.Platform.isAndroid();
				if(isAndroid){
					adMobI = $scope.ajaxRequest.adMobA;
				} else {
					adMobI = $scope.ajaxRequest.adMobI;
				}
				var l1 = $scope.ajaxRequest.lang;
				var l2 = $scope.ajaxRequest.alang;
				angular.forEach(l1,function(entry) {					  
					l1[entry.id].text = entry.text.replace("&#039;", "'");	
				});	
				angular.forEach(l2,function(entry) {					  
				  l2[entry.id].text = entry.text.replace("&#039;", "'");		
				});														
				$localstorage.setObject('lang', l1);
				$localstorage.setObject('alang', l2);
				$localstorage.setObject('user', $scope.ajaxRequest.user);
				$localstorage.setObject('premium_package', $scope.ajaxRequest.premium_package);
				$localstorage.setObject('credits_package', $scope.ajaxRequest.credits_package);					
				$localstorage.setObject('account_basic', $scope.ajaxRequest.account_basic);
				$localstorage.setObject('account_premium', $scope.ajaxRequest.account_premium);
				$localstorage.setObject('gifts', $scope.ajaxRequest.gifts);
				$rootScope.appGifts = $scope.ajaxRequest.gifts;	
				if($scope.ajaxRequest.user != ''){
					$localstorage.setObject('usPhotos', $scope.ajaxRequest.user.photos);
					usPhotos = $scope.ajaxRequest.user.photos;
					sape = $scope.ajaxRequest.user.slike;					
					$state.go('home.explore');
				} else {
					$state.go('home.welcome');
				}
				var style = document.createElement('style');
				style.type = 'text/css';
				style.innerHTML = '.bg-tinder {background:'+app.first_color+'; background: -moz-linear-gradient(left,  '+app.first_color+' 0%, '+app.second_color+' 100%);background: -webkit-linear-gradient(left,  '+app.first_color+' 0%,'+app.second_color+' 100%); background: linear-gradient(to right,  '+app.first_color+' 0%,'+app.second_color+' 100%); color:#fff }';
				document.getElementsByTagName('head')[0].appendChild(style);		
		  },
		  function(){}
		  )		 
	  }
	  catch (err) {
		console.log("Error " + err);
	  }		
	}

    $ionicPlatform.ready(function() {
        $cordovaNativeAudio.preloadSimple('call', 'audio/call.mp3');
        $cordovaNativeAudio.preloadSimple('inchat', 'audio/inchat-sound.mp3');
        $cordovaNativeAudio.preloadSimple('notification', 'audio/notification.wav');
    });

    $rootScope.playSound = function(sound) {
        $cordovaNativeAudio.play(sound);
    };

	//VIDEOCALL SYSTEM	
	  $ionicModal.fromTemplateUrl('templates/modals/video.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.videoModal = modal;
	  });
	  $scope.closeVideoModal = function() {
		$scope.videoModal.hide(); 
		$('body').toggleClass('anim-start');
		window.localStream.stop();	
		window.localStream = null;
	  };

	function peerConnect(con) {
		user = $localstorage.getObject('user');
		config = $localstorage.getObject('config');
		if(con == 1){
			peer.destroy();
		}

		peer = new Peer({
		  host: config.videocall, secure:true, port:443, key: 'peerjs',
		  config: {'iceServers': [
			{ url: 'stun:stun1.l.google.com:19302' },
			{ url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
		  ]}
		});			
						
		peer.on('open', function(){
			var query = user.id+','+peer.id; 
			console.log(query);
			A.Query.get({action: 'updatePeer' ,query: query});					 
		});
		
		peer.on('error', function(err){
			console.log(err);
		});	
		peer.on('call', onReceiveCall);			
	}
	
	
	$interval(function(){
		config = $localstorage.getObject('config');						   
		if(in_videocall === false && user != '' && config != '' && config.videocall != ''){
			peerConnect(1);
		} 
	}, 50000);
	
	
	$timeout(function(){
		config = $localstorage.getObject('config');					  
		if(in_videocall === false && user != '' && config != ''  && config.videocall != ''){
			peerConnect(0);
		} 
	}, 5000);
	
	function getVideo(successCallback, errorCallback){
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		navigator.getUserMedia({audio: true, video: true}, successCallback, errorCallback);
	}
				
	function onReceiveCall(call){

		try {		  
			$scope.getCaller = A.Query.get({action: 'income' ,query: call.peer});
			$scope.getCaller.$promise.then(function(){
				var caller = $scope.getCaller;
				$scope.called = true;				
				$scope.videoModal.show();	
				$scope.name = 'Incoming call';
				$scope.text = caller.name+" wants to start a videocall with you";	
				$('.ball').css("background-image",'url(' + caller.photo + ')');
				$('.videopb').css("background-image",'url(' + caller.photo + ')');				
				setTimeout(function() {
					$('body').toggleClass('anim-start');
				}, 300);
				$scope.acceptCall = function(){
					$scope.called = false;
					in_videocall = true;
					getVideo(
						function(MediaStream){
							call.answer(MediaStream);						
						},
						function(err){
							$ionicPopup.alert({
								title: 'Error',
								template: 'An error occured while try to connect to the device mic and camera'
							});
						}
					);					
				}
		},
			function(){})		 
		}
		catch (err) {
			console.log("Error " + err);
		}
		call.on('stream', function(stream){
			$scope.videoModal.show();
			in_videocall = true;
			var video = document.getElementById('myCam');
			video.src = window.URL.createObjectURL(stream);
			//$('.videocall-container').fadeOut();
		});
	}
	

	function onReceiveStream(stream){	
		$scope.videoModal.show();
		in_videocall = true;
		var video = document.getElementById('myCam');
		video.src = window.URL.createObjectURL(stream);
		//$('.videocall-container').fadeOut();
	}
	$scope.startVideocall = function(val){
		$scope.called = false;
		$scope.videoModal.show();
		$scope.name = chatUser.name;
		$scope.text = 'calling..';
		$('.ball').css("background-image",'url(' + chatUser.photo + ')');
		$('.videopb').css("background-image",'url(' + chatUser.photo + ')');
		setTimeout(function() {
			$('body').toggleClass('anim-start');
		}, 300);			
		getVideo(
			function(MediaStream){	
				window.localStream = MediaStream;
				//var video = document.getElementById('myCam');
				//video.src = window.URL.createObjectURL(MediaStream);
				try {		  
					$scope.getUserPeer = A.Query.get({action: 'getpeerid' ,query: chatUser.id});
					$scope.getUserPeer.$promise.then(function(){
						var userPeer = $scope.getUserPeer.peer;
						var call = peer.call(userPeer, MediaStream);		
						call.on('stream', onReceiveStream);
				},
					function(){})		 
				}
				catch (err) {
					console.log("Error " + err);
				}				
			},
			function(err){
				$ionicPopup.alert({
					title: 'Error',
					template: 'An error occured while try to connect to the device mic and camera'
				});
			}
		);

	};

	$scope.videoModa = function(){
		$scope.videoModal.show();
		$scope.oncall = true;			
	}
	
								  
	$scope.firstOpen = true;							  

	
    $ionicModal.fromTemplateUrl('templates/modals/chat-image.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalChatImage = modal;
    });

    $scope.openChatImageModal = function(image) {
	  $scope.chatImage = image;
      $scope.modalChatImage.show();
    };

    $scope.closeChatImageModal = function() {
      $scope.modalChatImage.hide();
    };	
	 
    $ionicModal.fromTemplateUrl('templates/modals/profile-photos.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $ionicSlideBoxDelegate.slide(0);
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
    $scope.$on('modal.shown', function() {
    });

    // Call this functions if you need to manually control the slides
    $scope.next = function() {
      $ionicSlideBoxDelegate.next();
    };
  
    $scope.previous = function() {
      $ionicSlideBoxDelegate.previous();
    };
  
  	$rootScope.goToSlide = function(index) {
      $scope.modal.show();

      $ionicSlideBoxDelegate.slide(index);
    }
  
    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };

	function onHardwareBackButton() {
		if($('.modal-backdrop.active').length){		
			$scope.profileModal.hide();
			return false;
		}else{
			window.history.back();
			return false;
		}
	}
	

	
	$ionicPlatform.onHardwareBackButton(onHardwareBackButton);
	
    $ionicModal.fromTemplateUrl('templates/modals/profile.html', {
      scope: $scope,
      animation: 'animated fadeIn'
    }).then(function(modal) {
      $scope.profileModal = modal;
    });
	
	
    $ionicModal.fromTemplateUrl('templates/modals/premium.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.premiumModal = modal;
    });

    $scope.openPremiumModal = function() {
		config = $localstorage.getObject('config');
		lang = $localstorage.getObject('lang');

		alang = $localstorage.getObject('alang');
		site_prices = $localstorage.getObject('prices');
		account_premium = $localstorage.getObject('account_premium');
		$scope.pchat = account_premium.chat;
		$scope.dchatprice = site_prices.chat;
		$scope.alang = [];

		angular.forEach(alang,function(entry) {						  
		  $scope.alang.push({
			id: entry,
			text: entry.text
		  });
		});
		$scope.config_email = config.paypal;
		$scope.premium_days = p_quantity;
		$scope.currency = config.currency;
		$scope.cp = $localstorage.getObject('premium_package');		
		$scope.premiumModal.show();
		$scope.buyPremium = function(c,p,i){
			p_quantity = c;
			p_price = p;
			$scope.premium_days = c;
			$scope.premium_price = p;
			$scope.premium_custom = user.id+','+c;			
			$scope.premiumModal.hide();
			var paypalU = site_url +'app/paypal.php?type=2&amount='+p_price+'&custom='+$scope.premium_custom;
			if (window.cordova) {
				cordova.InAppBrowser.open(paypalU, '_blank', 'location=yes');
			} else {
				window.open(paypalU, '_blank', 'location=yes');
			}
		}
	}
    $scope.closePremiumModal = function() {
		$scope.premiumModal.hide();
	}	

    $ionicModal.fromTemplateUrl('templates/modals/credits.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.creditsModal = modal;
    });

    $scope.openCreditsModal = function(photo) {
		config = $localstorage.getObject('config');
		lang = $localstorage.getObject('lang');

		alang = $localstorage.getObject('alang');
		site_prices = $localstorage.getObject('prices');
		account_basic = $localstorage.getObject('account_basic');
		$scope.site_name = config.name;
		$scope.dchat = account_basic.chat;
		$scope.dchatprice = site_prices.chat;
		$scope.alang = [];

		angular.forEach(alang,function(entry) {						  
		  $scope.alang.push({
			id: entry,
			text: entry.text
		  });
		});

		
		if(config.paypal != '' ){ 
			$scope.PAYPAL = true;
		}
		if(config.stripe != '' ){ 
			$scope.STRIPE = true;
		}
		if(config.fortumo != '' ){ 
			$scope.SMS = true;
		}		
		$scope.photo = photo;
		$scope.config_email = config.paypal;
		$scope.credits_amount = c_quantity;
		$scope.currency = config.currency;
		$scope.cp = $localstorage.getObject('credits_package');		
		$scope.creditsModal.show();
		$scope.buyCredit = function(val){
			if(c_quantity == 0){
				alert(lang[79].text);
				return false;
			}
			if(val == 1){
				var c = $scope.credits_custom;
				var paypalU = site_url +'app/paypal.php?type=1&amount='+c_price+'&custom='+c;
					if (window.cordova) {
					cordova.InAppBrowser.open(paypalU, '_blank', 'location=yes');
				} else {
					window.open(paypalU, '_blank', 'location=yes');
				}
			}
			if(val == 2){
				$scope.creditsModal.hide();
				var price = c_price*100;
				var app = 1;
				var handler = StripeCheckout.configure({
					key: config.stripe,
					image: config.logo,
					locale: 'auto',
					token: function(token) {
						$.ajax({
							url: config.ajax_path+'/stripe.php', 
							data: {
								token:token.id,
								price: price,
								app: app,
								quantity: c_quantity,
								uid: user.id,
								de: config.name + ' ' + c_quantity + ' credits'
							},	
							type: "post",
							success: function(response) {
							},
							complete: function(){
								if(app == 1){
									$state.go('loader');
								}
							}
						});
					}
				});
				handler.open({
					name: config.name,
					description: config.name + ' ' + c_quantity + ' credits',
					amount: price
				});
			
				$(window).on('popstate', function() {
					handler.close();
				});				
			}
			if(val == 3){
				var name = config.name + ' ' + c_quantity + ' credits';
				var encode = 'amount='+c_quantity+'callback_url='+config.site_url+'credit_name='+name+'cuid='+user.id+'currency='+config.currency+'display_type=userprice='+c_price+'v=web';			
				$.ajax({ 
					type: "POST", 
					url: config.ajax_path + "/user.php",
					data: {
						action: 'fortumo',
						encode: encode
					},
					success: function(response){
						var md5 = response;
						var callback = encodeURI(config.site_url);
						name = encodeURI(name);
						var href= 'http://pay.fortumo.com/mobile_payments/'+config.fortumo+'?amount='+c_quantity+'&callback_url='+callback+'&credit_name='+name+'&cuid='+user.id+'&currency='+config.currency+'&display_type=user&price='+c_price+'&v=web&sig='+md5;
							if (window.cordova) {
							cordova.InAppBrowser.open(href, '_blank', 'location=yes');
						} else {
							window.open(href, '_blank', 'location=yes');
						}			
					}
				});				
			}	
		}
		$scope.selectCredit = function(q,p,i){
			c_quantity = q;
			c_price = p;
			$scope.credits_price = p;
			$scope.credits_amount = q;			
			$scope.credits_custom = user.id+','+q;
			$('[data-q]').hide();
			$('[data-q='+q+']').fadeIn();
		}		
	}
    $scope.closeCreditsModal = function() {
		$scope.creditsModal.hide();
	}


    $rootScope.blockUser = function() {
      var hideSheet = $ionicActionSheet.show({
		titleText: alang[14].text,									 
        buttons: [
          { text: alang[17].text +' '+name }
        ],
        cancelText: alang[2].text,
        cancel: function() {
            // add cancel code..
          },
        buttonClicked: function(index) {
			if(index == 0){
			   var confirmPopup = $ionicPopup.confirm({
				 title: alang[17].text+' '+ name,
				 template: alang[18].text +' '+ name +'?'
			   });
			
			   confirmPopup.then(function(res) {
				 if(res) {
					var query = user.id+','+id;
					A.Query.get({action: 'block' ,query: query});
					setTimeout(function(){
						$scope.closeProfileModal();
					},550);
				 } else {
				   
				 }
			   });
			 };	
          return true;
        }
      });
    }

    $rootScope.openProfileModal = function(id,name,photo,age,city) {
    	
    	$scope.loading = true;
		var cuser = function () {
		  try {		  
			  $scope.ajaxRequest = A.Chat.get({action: 'cuser',uid1: id,uid2: user.id});
			  $scope.ajaxRequest.$promise.then(function(){
					$localstorage.setObject('cuser', $scope.ajaxRequest.game[0]);
					current_user = $localstorage.getObject('cuser');
					cards.unshift(current_user);
					$rootScope.cards = cards;
					$rootScope.aImages = cards[0].full.galleria; 
					if(window.cordova){
						$state.go('home.explore');  
					} else {
						$state.go('home.explore'); 		
					} 					
					
			  },
			  function(){}
			  )		 
		  }
		  catch (err) {
			console.log("Error " + err);
		  }
		};

		cuser();
		var addvisit = user.id+','+id;
		A.Query.get({action: 'addVisit', query: addvisit});		
    }

    /*Edit Profile*/
 		
  })

	.controller('menuCtrl',function($scope,$rootScope,$state,$ionicViewSwitcher, $cordovaDevice,A,$localstorage,$ionicLoading) {
		if(window.cordova){
			$ionicViewSwitcher.nextDirection("bddk");
		} else {
			$ionicViewSwitcher.nextDirection("back");
		}
		url = 'menu';
		$('.navigation-bar').hide();
		user = $localstorage.getObject('user');
		config = $localstorage.getObject('config');	 
		lang = $localstorage.getObject('lang');
		alang = $localstorage.getObject('alang');
		app = $localstorage.getObject('app');
		$('#ready').removeClass('hidden');
		$rootScope.logged = true;
		$rootScope.me = user;	
		$scope.credits = user.credits;
		if(user.premium == 1){
			$scope.premium = 'Activated';
		} else {
			$scope.premium	= 'No'
		}

		$scope.alang = [];
		angular.forEach(alang,function(entry) {						  
		  $scope.alang.push({
			id: entry,
			text: entry.text
		  });
		});	

		app = $localstorage.getObject('app');
		$scope.logo = app.logo;
		$rootScope.spotlight = [];
		//SPOTLIGHT
		var spot = function () {
			try {		  
			  $scope.ajaxRequest5 = A.Game.get({action: 'spotlight', id: user.id});
			  $scope.ajaxRequest5.$promise.then(function(){											
					spotlight = $scope.ajaxRequest5.spotlight;
					console.log(spotlight);
					
					$rootScope.spotlight = spotlight;
					
			  },
			  function(){}
			  )		 
			}
			catch (err) {
				console.log("Error " + err);
			}	
		}
		if(spotlight == ''){
			spot();
		}	else {
			$rootScope.spotlight = spotlight;	
			spot();
		}

	})  
	.controller('LoaderCtrl',function($scope,$rootScope,$state,$ionicViewSwitcher, $cordovaDevice,A,$localstorage,$ionicLoading) {

		 mobileUser = $localstorage.get('userHistory');
		 $ionicViewSwitcher.nextDirection("exit");
		if(mobileUser == null){
			oneSignalID = Math.floor((Math.random() * 9999999) + 1);
			$localstorage.set('userHistory', oneSignalID);			
		} else {
			oneSignalID = mobileUser;
		}
		console.log(oneSignalID);

		/*

		if (window.cordova) {
			document.addEventListener('deviceready', function () {
				var notificationOpenedCallback = function(jsonData) { 
				};
				window.plugins.OneSignal.init("04f22177-366a-40dc-99cf-6d1342c4e1f5",
											 {googleProjectNumber: "633977981600"},
											 notificationOpenedCallback);
				window.plugins.OneSignal.enableNotificationsWhenActive(true);
				window.plugins.OneSignal.getIds(function(ids) {
				  oneSignalID = ids.userId;
		    	  loader();			  
				});	
			}, false);
		} else {
			loader();
		} */
		$('#ready').removeClass('hidden');
		$rootScope.loader();
	})
  

  .controller('WelcomeCtrl', function($scope, $state,$ionicViewSwitcher,$http,awlert, $ionicLoading,$ionicActionSheet, $timeout,A,$cordovaOauth,$localstorage,Navigation) {
	config = $localstorage.getObject('config');

	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}

	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	console.log(alang);
	$('#ready').removeClass('hidden');	
	url = 'welcome';
	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});

	$scope.alang = [];
	angular.forEach(alang,function(entry) {				  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});	

	app = $localstorage.getObject('app');
	$scope.logo = app.logo;

	var val = 0;
	$scope.forgetBtn = false;
	$scope.recoverPass = function(){
		$scope.forgetBtn = true;
		$scope.loginBtn = true;
	}

	$scope.backLogin = function(){
		$scope.forgetBtn = false;
		$scope.loginBtn = false;
	}
	$scope.isActive = true;
	$scope.keyup = function(key){
		val = key;
		if(val > 4){
			$scope.isActive = false;
		} else {
			$scope.isActive = true;
		}
    }

	$scope.loginBtn = false;

	$scope.send = function(user) {
		if(val < 4){
			return false;
		}		
		$scope.master = angular.copy(user);
		$scope.loginBtn = true;
		var dID = oneSignalID;
		$scope.ajaxRequest = A.User.get({action : 'login',login_email: $scope.master.login_email, login_pass:$scope.master.login_pass , dID : dID });
		$scope.ajaxRequest.$promise.then(function(){						
			if($scope.ajaxRequest.error == 1){
				awlert.neutral($scope.ajaxRequest.error_m, 3000);
				$scope.loginBtn = false;
				$scope.isActive = true;		
			} else {		
				$localstorage.setObject('user', $scope.ajaxRequest.user);
				$localstorage.setObject('usPhotos', $scope.ajaxRequest.user.photos);
				usPhotos = $scope.ajaxRequest.user.photos;
				sape = $scope.ajaxRequest.user.slike;
				if(window.cordova){
					$state.go('home.explore'); 	
				} else {
					$state.go('home.explore'); 		
				} 				
				
				$localstorage.set('mobileUser',$scope.ajaxRequest.user.app_id);
			}
		},
		function(){
			awlert.neutral('Something went wrong. Please try again later',3000);
		}
	)};
		
	$scope.forget = function(user) {	
		$scope.master = angular.copy(user);
		$scope.ajaxRequest = A.Query.get({action : 'recover',query: $scope.master.login_email });
		$scope.ajaxRequest.$promise.then(function(){						
			if($scope.ajaxRequest.error == 1){
				awlert.neutral($scope.ajaxRequest.error_m, 3000);		
			} else {		
				awlert.neutral(lang[341].text);
			}
		},
		function(){
			awlert.neutral('Something went wrong. Please try again later',3000);
		}
	)};

	/*
    $scope.showLoginOptions = function() {
      var hideSheet = $ionicActionSheet.show({
		titleText: 'More options',									 
        buttons: [
          { text: alang[15].text },
          { text: alang[16].text },
          { text: alang[17].text }
        ],
        cancelText: 'cancel',
        cancel: function() {
            // add cancel code..
          },
        buttonClicked: function(index) {
			if(index == 0){
				
			}
			if(index == 1){
			}
			if(index == 2){
			}
          return true;
        }
      });
   		}	
  */
	$scope.fb = function() {
	 $cordovaOauth.facebook("1811596079069411", ["email"]).then(function(result) {
		$http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: result.access_token, fields: "id,name,email,gender", format: "json" }}).then(function(result) {
			var dID = oneSignalID;
			var query = result.data.id+','+result.data.email+','+result.data.name+','+result.data.gender+','+dID;
		$scope.ajaxRequest = A.Query.get({action : 'fbconnect',query: query });
		$scope.ajaxRequest.$promise.then(function(){							
			$localstorage.setObject('user', $scope.ajaxRequest.user);
			$localstorage.setObject('usPhotos', $scope.ajaxRequest.user.photos);
			usPhotos = $scope.ajaxRequest.user.photos;
			if(window.cordova){
				$state.go(url, val); 
			} else {
				$state.go(url, val); 		
			} 			
			 
		},
		function(){
			awlert.neutral('Something went wrong. Please try again later',3000);
		});
		
		}, function(error) {
		alert("There was a problem getting your profile.  Check the logs for details.");
			console.log(error);
		});
	 }, function(error) {
		 alert("Auth Failed..!!"+error);
	 });
	}	
	//$scope.site_name = lang[0].text;

  })
  .controller('MeetCtrl', function($scope,$rootScope,$sce,$ionicPlatform,$ionicScrollDelegate,$ionicViewSwitcher, $state,$ionicModal, $ionicLoading,A, $timeout,$localstorage,Navigation,$window,preloader) {
	//$sce.trustAsResourceUrl(url);
	var cc = 0;
	url = 'meet';
	$('#ready').removeClass('hidden');	
	$ionicViewSwitcher.nextDirection("forward");
	config = $localstorage.getObject('config');									  
	lang = $localstorage.getObject('lang');

	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.alang = [];
	user = $localstorage.getObject('user');
	prices = $localstorage.getObject('prices');
	$rootScope.logged = true;
	$rootScope.me = user;

	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}

	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});


	if(user.s_radius >= 1000){
		$scope.check = 'All the world'	
	}
	if(user.s_radius < 550 && user.s_radius >= 500 ){
		$scope.check = user.city;	
	}
	if(user.s_radius < 550 && user.s_radius >= 500 ){
		$scope.check = user.country;	
	}
	if(user.s_radius < 50 ){
		$scope.check = user.city;	
	}
	if(user.s_radius > 30 && user.s_radius < 500 || user.s_radius > 550 && user.s_radius < 1000){
		$scope.check = user.s_radius+' KM';	
	}

	$scope.photo = user.profile_photo;


	$scope.goToChat = function(){
		$ionicViewSwitcher.nextDirection('back'); // 'forward', 'back', etc.
		$state.go('home.matches');		
	}
	
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});
	
	
	var result = [];
	var loadMore = [];
	$scope.imageLocations = [];
	$scope.loading = true;
    $scope.records = [
    	{
        	"photo" : "img/placeholder-female.png"
    	},
		{
        	"photo" : "img/placeholder-male.png"
   		}, 
    	{
        	"photo" : "img/placeholder-female.png"
    	},
		{
        	"photo" : "img/placeholder-male.png"
   		}, 
    	{
        	"photo" : "img/placeholder-female.png"
    	},
		{
        	"photo" : "img/placeholder-male.png"
   		},
		{
        	"photo" : "img/placeholder-male.png"
   		}, 
    	{
        	"photo" : "img/placeholder-female.png"
    	},
		{
        	"photo" : "img/placeholder-male.png"
   		}   		
   		   		   		   		                                            
    ];
    $scope.meet = [];
	var meet = function () {
		meet_limit = 0;
		try {		  
		  $scope.ajaxRequest = A.Meet.get({action: 'meet',uid1: user.id, uid2: meet_limit, uid3 : onlineMeet});
		  $scope.ajaxRequest.$promise.then(function(){											
				result = $scope.ajaxRequest.result;
				var i = 0;
				result.forEach(function(entry) {
					i++;
					entry.show = i;		
					$scope.meet.push(entry);									  
					$scope.imageLocations.push(entry.photo);
				});	
				cc++;
				$scope.loading = false;
				preloader.preloadImages( $scope.imageLocations )
				.then(function() {
					
				},
				function() {
					// Loading failed on at least one image.
				});

		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}
	
	var loadMore = function () {
		meet_limit = meet_limit+1;
		$scope.imageLocations = [];
		try {		  
		  $scope.ajaxRequest = A.Meet.get({action: 'meet',uid1: user.id, uid2: meet_limit, uid3 : onlineMeet});
		  $scope.ajaxRequest.$promise.then(function(){											
				result = $scope.ajaxRequest.result;
				$scope.loadMores = $scope.ajaxRequest.result;
				var i = 0;
				result.forEach(function(entry) {
					i++;
					entry.show = i;					  
					$scope.meet.push(entry);
					$scope.imageLocations.push(entry.photo);
				});
				preloader.preloadImages( $scope.imageLocations )
				.then(function() {
					show = meet_limit * 9;
					var maxShow = show + 10;
					var show_search = setInterval(function(){
						show++;	
						if(show == maxShow){
							clearInterval(show_search);	
							$scope.$broadcast('scroll.infiniteScrollComplete');
						}
					},150);
				},
				function() {
					// Loading failed on at least one image.
				});				
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}

	meet();	
	
	$scope.spot_price = prices.spotlight;
	$scope.openSpot = function(){
		$scope.showSpot = true;
	}
	$scope.cancelSpot = function(){
		$scope.showSpot = false;	
	}
	$scope.addToSpotBtn = function(){
		user.credits = parseInt(user.credits);
		if(user.credits < prices.spotlight){
			$scope.openCreditsModal("'"+user.profile_photo+"'");
		} else {
			$scope.showMe = false;
			addToSpotlight();
		}
	}

	//ADMOB
	if(show_ad == max_ad && user.premium == 0){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		show_ad = 0;	
	}
	show_ad++;	

 
  $scope.loadMore = function() {
	  loadMore();
  };
 


  })  
  
  .controller('LoginCtrl', function($scope,$ionicPlatform,$http, $state,$ionicViewSwitcher,$ionicModal,A,awlert,$cordovaOauth,Navigation) {
	var app = $localstorage.getObject('app');
	var val = 0;
	$('#ready').removeClass('hidden');	

	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}

	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');

	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});

	$scope.alang = [];
	$scope.lang = [];
	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	lang.forEach(function(entry) {					  
	  $scope.lang.push({
		id: entry,
		text: entry.text
	  });
	});
  })  

  .controller('RegisterCtrl', function($scope, $state,$ionicViewSwitcher,$ionicModal,A,awlert, $ionicLoading, $timeout,$localstorage,$cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice) {
	var reg = '';								   
	var app = $localstorage.getObject('app'); 
	var w;
	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}	
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	$('#ready').removeClass('hidden');	
	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});

	$scope.alang = [];
	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});	

	app = $localstorage.getObject('app');
	$scope.logo = app.logo;

	$scope.lname = lang[26].text;
	$scope.lemail = lang[28].text;
	$scope.lpass = lang[29].text;
	$scope.nexttext = alang[26].text;
	$scope.regPhoto = '';
	alang = $localstorage.getObject('alang');
	lang = $localstorage.getObject('lang');

	var div = angular.element(document.getElementById('photo-upload'));
	w = angular.element(document.getElementById('photo-upload')).prop('offsetWidth'); 
	div.css('height',w+'px');
	window.addEventListener('native.keyboardshow', keyboardHandler);
	window.addEventListener('native.keyboardhide', keyboardHandler);
	function keyboardHandler(e){
		var div = angular.element(document.getElementById('photo-upload')); 
		w = angular.element(document.getElementById('photo-upload')).prop('offsetWidth'); 
		div.css('height',w+'px');
	}
	
	var val = 0;
	$scope.isActive = false;
	$('#regpass').keyup(function(){
		val = $('#regpass').val().length;
		if(val > 4){
			$scope.isActive = true;
		} else {
			$scope.isActive = false;
		}
    });	
	$scope.regBtn = false;
	var regPhoto = '';
	var con = false;
	$scope.next = function(user) {
		if(val < 4){
			return false;
		}
		if(con == false){
			awlert.neutral(alang[3].text,1000);
			return false;
		}		
		if(user.reg_name == ''){
			awlert.neutral(alang[4].text,1000);		
			return false;
		}
		if(user.reg_email == ''){
			awlert.neutral(alang[4].text,1000);
			return false;
		}
		if (!validateEmail(user.reg_email)) {		
			awlert.neutral(alang[5].text,1000);
			return false;		
		}
		if(user.reg_pass == ''){
			awlert.neutral(alang[4].text,1000);	
			return false;
		}
		regName = user.reg_name;
		reg = user.reg_name+'  '+user.reg_email+'  '+user.reg_pass;
		$localstorage.set('register',reg);
		$state.go('home.register3');
	};
	
	
	function validateEmail(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

		 $scope.processFiles = function(files){
	    angular.forEach(files, function(flowFile, i){
	       var fileReader = new FileReader();
	          fileReader.onload = function (event) {
	            var uri = event.target.result;
					var image = uri;
					var r = Math.floor((Math.random() * 225) + 4000);
					reg_photo = site_url+'assets/sources/uploads/'+oneSignalID+'.jpg';
					var div = angular.element(document.getElementById('photo-upload')); 
					div.css('background-image','url('+image+')');
					$('#photo-upload i').hide();
					con = true;
					$.ajax({
						url: site_url+'assets/sources/appupload.php',
						data:{
							action: 'register',
							base64: image,
							uid: oneSignalID
						},
						cache: false,
						contentType: "application/x-www-form-urlencoded",				  
						type:"post",
						success:function(){
						}
					});	                
	          };
	          fileReader.readAsDataURL(flowFile.file);
	    });
	  };

	$scope.pick = function() {
		if (window.cordova) {
		var options = {
			quality: 40,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			encodingType: Camera.EncodingType.JPEG,
			allowEdit : true,
		};
		$cordovaCamera.getPicture(options).then(function(imageData) {
			var image = "data:image/jpeg;base64," + imageData;
			reg_photo = site_url+'assets/sources/uploads/'+oneSignalID+'.jpg';
			var div = angular.element(document.getElementById('photo-upload')); 
			div.css('background-image','url('+image+')');
			con = true;
			$.ajax({
				url: site_url+'assets/sources/appupload.php',
				data:{
					action: 'register',
					base64: image,
					uid: oneSignalID
				},
				cache: false,
				contentType: "application/x-www-form-urlencoded",				  
				type:"post",
				success:function(){
				}
			});
		}, function(err) {
		  // error
		});
		} else {
			$('#uploadRegPhoto').click();
		}		
	};		
	
	$ionicViewSwitcher.nextDirection("exit");	
  })
  
  .controller('Register2Ctrl', function($scope, $state,$ionicViewSwitcher,$ionicModal,A,awlert, $ionicLoading, $timeout,$localstorage,$cordovaCamera) {  
	var looking = 2;									
	var reg = $localstorage.get('register');
	$scope.isActive = true;
	$scope.regBtn = false;
	$scope.girl = true;
	$scope.boy = false;
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');

	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});

	$scope.nexttext = alang[26].text;
	$scope.selectGirl = function(){
		if($scope.girl){
			$scope.girl = false;
			looking = looking-2;
			if(looking == 0){
				$scope.isActive = false;	
			}
			console.log(looking);
		} else {
			$scope.girl = true;	
			$scope.isActive = true;
			looking = looking+2;
			console.log(looking);
		}
	}
	
	$scope.selectBoy = function(){
		if($scope.boy){
			$scope.boy = false;
			looking = looking-1;
			console.log(looking);
			if(looking == 0){
				$scope.isActive = false;	
			}			
		} else {
			$scope.boy = true;	
			$scope.isActive = true;
			looking = looking+1;
			console.log(looking);
		}
	}	
	$scope.send = function() {
		$scope.regBtn = true;
		var register =  new Array();
		register = reg.split('  ');		
		var dID = oneSignalID;
		$scope.ajaxRequest = A.Reg.get({action : 'register',reg_name: register[0], reg_email: register[1] , reg_pass: register[2], reg_birthday: register[3], reg_gender: register[4], reg_looking: looking , reg_photo : reg_photo, dID : dID });
		$scope.ajaxRequest.$promise.then(function(){						
			if($scope.ajaxRequest.error == 1){
				awlert.error($scope.ajaxRequest.error_m, 3000);
				$scope.regBtn = false;
				$scope.isActive = true;			
			} else {		
				$localstorage.setObject('user', $scope.ajaxRequest.user);	
				$localstorage.setObject('usPhotos', $scope.ajaxRequest.user.photos);
				usPhotos = $scope.ajaxRequest.user.photos;
				sape = $scope.ajaxRequest.user.slike;
				$localstorage.set('mobileUser',$scope.ajaxRequest.user.app_id);
				$state.go('home.explore');	
			}
		},
		function(){
			awlert.error('Something went wrong. Please try again later',3000);
		}
	)};	
	$ionicViewSwitcher.nextDirection("exit");		
  })
  
  .controller('Register3Ctrl', function($scope, $state,$ionicViewSwitcher,$ionicModal,A,awlert, $ionicLoading, $timeout,$localstorage,$cordovaCamera) {
	var gender = 0;
	var reg = $localstorage.get('register');
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');

	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});

	$scope.lang31 = alang[31].text;
	$scope.nexttext = alang[26].text;
	
	$scope.isActive = false;
	$scope.regBtn = false;
	$scope.girl = false;
	$scope.boy = false;
	$scope.name = regName;	

	$scope.selectGirl = function(){
		if($scope.boy){
			$scope.boy = false;
			$scope.isActive = false;			
		}
		if($scope.girl){
			$scope.girl = false;
			$scope.isActive = false;	
		} else {
			$scope.girl = true;	
			$scope.isActive = true;
			gender = 2;
		}
	}
	
	$scope.selectBoy = function(){
		if($scope.girl){
			$scope.girl = false;
			$scope.isActive = false;	
		}		
		if($scope.boy){
			$scope.boy = false;
			$scope.isActive = false;			
		} else {
			$scope.boy = true;	
			$scope.isActive = true;
			gender = 1;
		}
	}	
	
	$scope.send = function() {
		var date = $('#birth').val();
		if(date == ''){
			awlert.neutral(alang[6].text,3000);	
			return false;
		}
		reg = reg +'  '+ date +'  '+ gender;
		$localstorage.set('register',reg);
		$state.go('home.register2');
	};
			
	$ionicViewSwitcher.nextDirection("exit");	
  })
  
  .controller('ExploreCtrl', function($scope,$rootScope,$ionicViewSwitcher,$state,$sce,$ionicPlatform,preloader,$timeout, $ionicModal,A,$localstorage,Navigation,awlert,$ionicViewSwitcher,currentUser) {
	url = 'explore';
	user = $localstorage.getObject('user');
	config = $localstorage.getObject('config');	 
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	app = $localstorage.getObject('app');
	$scope.exploreResult = true;
	$('#ready').removeClass('hidden');
	$rootScope.logged = true;
	$rootScope.me = user;
	$scope.newChat = false;

	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}	
	
	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	}  
	
	$scope.logo = app.logo;

	$scope.alang = [];
	$scope.lang = [];

	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});

	//load chat
	var chat = function () {
		try {
		  $scope.ajaxRequest2 = A.Game.get({action: 'getChat', id: user.id});
		  $scope.ajaxRequest2.$promise.then(function(){
				$scope.matches = $scope.ajaxRequest2.matches;
				$scope.unread = $scope.ajaxRequest2.unread;
				chats = $scope.matches;
				unread = $scope.unread;
				if(unread != null){
					$scope.unrread = unread.length;
					unread = unread.length;
				}
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}

	chat();

	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );	
		show_ad = 0;	
	}
	show_ad++;

	$scope.cu2 = [];

	$scope.chatUser = function(url,slide,val) {
		currentUser.selectedUser=val;
		$state.go(url, val);  
	};	
	
	var w = window.innerWidth;
	w = w/2;
	if(w > 200){
		w = 200;
	}

	$scope.w = w;

	s_age = user.sage;
	user_country = user.country;
	user_city = user.city;	
	
	$scope.superLike = 5;
	$scope.uphoto = user.profile_photo;


	$scope.goToChat = function(){
		$ionicViewSwitcher.nextDirection('back'); // 'forward', 'back', etc.
		$state.go('home.matches');		
	}

	$scope.goToSettings = function(){
		$ionicViewSwitcher.nextDirection('forward'); // 'forward', 'back', etc.
		$state.go('home.settings');		
	}	


	

	var gameAction = function (id,action) {
		try {		  
		  A.Meet.get({action: 'game_like',uid1: user.id, uid2: id, uid3: action});		 
		}
		catch (err) {
			console.log("Error " + err);
		}		
	}
	

	$scope.imageLocations = [];	
	var card = function (val) {
		console.log('loading profiles');
		console.log(user.id);
		try {		  
		  $scope.ajaxRequest = A.Game.get({action: 'game',id: user.id});
		  $scope.ajaxRequest.$promise.then(function(){										
				$scope.ajaxRequest.game.forEach(function(entry) {
					if(cards.indexOf(entry) !== -1) {
  						console.log('alredy in game');
  					} else {
  						if(entry.id != user.id){
							cards.push(entry);								  
							$scope.imageLocations.push(entry.photo);
  						}
					}
				});

				$scope.loading = false;
				console.log(cards);	

				preloader.preloadImages( $scope.imageLocations )
				.then(function() {
				
				},
				function() {
				
				});
				if(val == 1){							
					cu = cards[0].id;
					$scope.cu2 = cards[0];
					$rootScope.cards = cards;
				    $rootScope.aImages = cards[0].full.galleria; 
			    }				
		  },
		  function(){ 
		  	$scope.loading = alang[7].text;

			}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}

    $scope.cardDestroyed = function(index,act) {
		if(act == 1){
			if ($rootScope.cards[index].isFan == 1){
				$scope.itsaMatch = true;
				var w = window.innerWidth;
				w = w/3;
				$scope.width = w;
				$scope.cu3 = $rootScope.cards[index];
				$scope.myPhoto = user.profile_photo;
				angular.forEach(alang,function(entry) {						  
					$scope.alang.push({
						id: entry,
						text: entry.text
					});
				});			 
			};
		}
	  console.log('card new');
      addCards(1);
	  cu = $rootScope.cards[index].id;
	  $scope.cu2 = $rootScope.cards[index];
    };
	
   function addCards(v) {

			
			if(cards.length < 25){
				card(2);
			}
 
			$timeout(function(){
			    $scope.yesVoted = false;
			    $scope.noVoted = false;
			    cards.splice(0, 1);
	      		$rootScope.cards.splice(0, 1);							
				$rootScope.aImages = cards[0].full.galleria;			    
			    console.log('card removed');		    
			}, 120);    		
      }

	if(cards.length == 0){
		$scope.loading = true;
		card(1);
	} else {
		$scope.loading = false;	
		$rootScope.cards = cards;
		console.log(cards);
	}
	


    $scope.yesVoted = false;
    $scope.noVoted = false;
	$scope.like = function(){
		$scope.yesVoted = true;
	 	gameAction(cu,1);
	}

	$scope.nolike = function(){
	  $scope.noVoted = true;		
	  gameAction(cu,0);				
	}	

	
	$scope.slike = function(){
	  if($scope.cards.length > 0){
		  if($scope.superLike > 0){
			  awlert.neutral(alang[9].text, 3000);
			  var int = parseInt($scope.superLike);
			  $scope.superLike = int-1;	 
			  sape = sape-1;
			  gameAction(cu,3);	
			  $scope.cardDestroyed(0,1);
		  } else {
			  $scope.slikephoto = $scope.cu2.photo;
			  $scope.noSlike = true;
		  }
	  }
	}	
	
	$scope.buySlike = function(){
		user.credits = parseInt(user.credits);
		if(400 > user.credits){
			$scope.openCreditsModal();
		} else {
			$scope.noSlike = false;
			var ma = user.id + ',400,10';
			awlert.neutral(alang[9].text, 3000);	  
			gameAction(cu,3);
			$scope.cardDestroyed(0,1);			
			try {	
			  $scope.ajaxRequest = A.Query.get({action: 'slike', query: ma});
			  $scope.ajaxRequest.$promise.then(function(){		
			  $localstorage.setObject('user',$scope.ajaxRequest.user);
			  user = $localstorage.getObject('user'); 
			  $scope.superLike = user.slike;
				var int = parseInt($scope.superLike);
				$scope.superLike = int-1;
				sape = user.slike;
				sape = sape-1;				
			  },
			  function(){}
			  )		 
			}
			catch (err) {
				console.log("Error " + err);
			}
		}
	};	
	
	$scope.noBtnSlike = function(){
	  $scope.noSlike = false;			
	}	
	

	//SPOTLIGHT
	var spot = function () {
		try {		  
		  $scope.ajaxRequest5 = A.Game.get({action: 'spotlight', id: user.id});
		  $scope.ajaxRequest5.$promise.then(function(){											
				spotlight = $scope.ajaxRequest5.spotlight;
				console.log(spotlight);
				$rootScope.spotlight = [];
				$rootScope.spotlight = spotlight;
				
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}
	if(spotlight == ''){
		spot();
	}	else {
		$rootScope.spotlight = spotlight;	
		spot();
	}


  })

  .controller('profileCtrl', function($state,$rootScope,$ionicActionSheet,$ionicViewSwitcher,$scope,A, $ionicModal,$localstorage,Navigation) {
	url = 'profile-me';
	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}
	
	user = $localstorage.getObject('user');
	config = $localstorage.getObject('config');	 
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	app = $localstorage.getObject('app');
	usPhotos = $localstorage.getObject('usPhotos');
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});	

	$('#ready').removeClass('hidden');
	$rootScope.logged = true;
	$rootScope.me = user;

	$scope.alang = [];
	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});	

	app = $localstorage.getObject('app');
	$scope.logo = app.logo;

		$scope.loading = false;
		$scope.bio = user.bio;
		$scope.name = user.name;
		$scope.age = user.age;	
		$scope.credits = user.credits;
		if(user.premium == 1){
			$scope.premium = 'Activated';
		} else {
			$scope.premium	= 'No'
		}
		
		$scope.uphotos = usPhotos;
		$scope.photo1 = usPhotos[0];
		$scope.photo2 = usPhotos[1];
		$scope.photo3 = usPhotos[2];
		$scope.photo4 = usPhotos[3];
		$scope.photo5 = usPhotos[4];
		$scope.photo6 = usPhotos[5];
		$scope.ex1 = user.extended.field1;
		$scope.ex2 = user.extended.field2;
		$scope.ex3 = user.extended.field3;
		$scope.ex4 = user.extended.field4;
		$scope.ex5 = user.extended.field5;
		$scope.ex6 = user.extended.field6;
		$scope.ex7 = user.extended.field7;
		$scope.ex8 = user.extended.field8;
		$scope.ex9 = user.extended.field9;
		$scope.ex10 = user.extended.field10;		
		$scope.extended1 = {
			Single: lang[224].text,
			Taken: lang[225].text,
			Open: lang[226].text,
		};
		
		$scope.extended2 = {
			a228a:lang[228].text,
			a229a:lang[229].text,
			a230a:lang[230].text,
			a231a:lang[231].text,
		};
	
		$scope.extended3 = {
			a142cm: "4' 8' (142cm)",	
			a145cm: "4' 9' (145cm)",	
			a147cm: "4' 10' (147cm)",	
			a150cm: "4' 11' (150cm)",	
			a152cm: "5' 0' (152cm)",	
			a155cm: "5' 1' (155cm)",	
			a157cm: "5' 2' (157cm)",	
			a160cm: "5' 3' (160cm)",	
			a163cm: "5' 4' (163cm)",	
			a162cm: "5' 5' (165cm)",	
			a168cm: "5' 6' (168cm)",	
			a170cm: "5' 7' (170cm)",	
			a173cm: "5' 8' (173cm)",	
			a175cm: "5' 9' (175cm)",	
			a178cm: "5' 10' (178cm)",	
			aa180cm: "5' 11' (180cm)",	
			a183cm: "6' 0' (183cm)",	
			a185cm: "6' 1' (185cm)",	
			aa188cm: "6' 2' (188cm)",	
			a1a91cm: "6' 3' (191cm)",
			a1a93cm: "6' 4' (193cm)",
			a1a96cm: "6' 5' (196cm)",
			a1a98cm: "6' 6' (198cm)",
			a201cm: "6' 7' (201cm)",
			a203cm: "6' 8' (203cm)",
			a206cm: "6' 9'(206cm)",
			a208cm: "6' 10' (208cm)",
			a211cm: "6' 11' (211cm)",
			a213cm: "7' 0' (213cm)",
			a216cm: "7' 1' (216cm)",
			a218cm: "7' 2' (218cm)",	
		};
		
		$scope.extended4 = {

		};
		
		$scope.extended5 = {
			a237a:lang[237].text,
			a238a:lang[238].text,
			a239a:lang[239].text,
			a240a:lang[240].text,
			a241a:lang[241].text,
			a242a:lang[242].text,
			a243a:lang[243].text,
			a244a:lang[244].text,
			a245a:lang[245].text,	
		};
		
		$scope.extended6 = {
			a247a:lang[247].text,
			a248a:lang[248].text,
			a249a:lang[249].text,
			a250a:lang[250].text,
			a251a:lang[251].text,
		};
		
		$scope.extended7 = {
			a253a:lang[253].text,
			aa254a:lang[254].text,
			a255a:lang[255].text,
			a256a:lang[256].text,
			a257a:lang[257].text,
		};
		
		$scope.extended8 = {
			a259a:lang[259].text,
			a260a:lang[260].text,
			a261a:lang[261].text,
		};
		
		$scope.extended9 = {
			a259a:lang[259].text,
			a260a:lang[260].text,
			a261a:lang[261].text,
		};
		
		$scope.extended10 = {
			a264a:lang[264].text,
			a265a:lang[265].text,
			a266a:lang[266].text,
			a267a:lang[267].text,
		};


		$scope.updateExtended = function(ex) {
			if(ex == 1){
				$scope.ex1 = null;	
			}
			if(ex == 2){
				$scope.ex2 = null;	
			}
			if(ex == 3){
				$scope.ex3 = null;
			}
			if(ex == 4){
				$scope.ex4 = null;
			}
			if(ex == 5){
				$scope.ex5 = null;
			}
			if(ex == 6){
				$scope.ex6 = null;
			}
			if(ex == 7){
				$scope.ex7 = null;
			}
			if(ex == 8){
				$scope.ex8 = null;
			}
			if(ex == 9){
				$scope.ex9 = null;
			}
			if(ex == 10){
				$scope.ex10 = null;
			}
		}
		console.log(usPhotos);

		$scope.showSelectValue = function(s,ex) {
			if(ex == 1){
				$scope.ex1 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 2){
				$scope.ex2 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 3){
				$scope.ex3 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 4){
				$scope.ex4 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 5){
				$scope.ex5 = s;
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 6){
				$scope.ex6 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 7){
				$scope.ex7 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 8){
				$scope.ex8 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 9){
				$scope.ex9 = s;
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 10){
				$scope.ex10 = s;
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}			
		}
		
		if(user.gender == 1){
			$scope.gender = lang[35].text;			
		}
		if(user.gender == 2){
			$scope.gender = lang[36].text;
		}
		
		$('#userName').change(function(){
			var val = $(this).val();
			var col = 'name';
			$scope.loading = true;
			var message = user.id+','+val+','+col;
			$scope.ajaxRequest14 = A.Query.get({action: 'updateUser', query: message});
			$scope.ajaxRequest14.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest14.user);
				$scope.loading = false;				
			});				
		});
		$('#userAge').change(function(){
			var val = $(this).val();
			var col = 'age';
			$scope.loading = true;
			var message = user.id+','+val+','+col;
			$scope.ajaxRequest14 = A.Query.get({action: 'updateUser', query: message});
			$scope.ajaxRequest14.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest14.user);
				$scope.loading = false;				
			});				
		});		
		$('#userBio').change(function(){
			var val = $(this).val();
			var col = 'bio';
			var message = user.id+','+val+','+col;
			$scope.ajaxRequest14 = A.Query.get({action: 'updateUser', query: message});
			$scope.ajaxRequest14.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest14.user);
			});				
		});		
		$scope.updateUserGender = function() {
		  var hideSheet = $ionicActionSheet.show({
			buttons: [
			  { text: lang[35].text	 },					  
			  { text: lang[36].text	 }
			],
			cancelText: alang[2].text,
			cancel: function() {
			  },
			buttonClicked: function(index) {
				var gender;
				if(index == 0){
					$scope.gender = lang[35].text;		
					gender = 1;
				}
				if(index == 1){
					$scope.gender = lang[36].text;
					gender = 2;
				}
				var message = user.id+','+gender;
				$scope.ajaxRequest24 = A.Query.get({action: 'updateUserGender', query: message});
				$scope.ajaxRequest24.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest24.user);
				});				
			  return true;
			}
		  });
		}	

   $scope.showPhotoOptions = function(val,pid,blocked,profile) {
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text:  lang[289].text },
          { text:  lang[292].text },
        ],
        cancelText: 'Cancel',
        cancel: function() {
          },
        buttonClicked: function(index) {
		  if(index ==0){
			var m = user.id +','+pid;
			$scope.ajaxRequest = A.Query.get({action: 'updateUserProfilePhoto', query: m});
			$scope.ajaxRequest.$promise.then(function(){							
				$localstorage.setObject('user', $scope.ajaxRequest.user);
				$localstorage.setObject('usPhotos', $scope.ajaxRequest.user.photos);
				usPhotos = $scope.ajaxRequest.user.photos;	
			}); 
		  }
		  if(index == 1){
		  		$scope.uphotos.splice(val, 1);
				var m = user.id +','+pid;
				A.Query.get({action: 'deletePhoto', query: m});
		  }
          return true;
        }
      });
    }		

 $scope.processFiles = function(files){
    angular.forEach(files, function(flowFile, i){
       var fileReader = new FileReader();
          fileReader.onload = function (event) {
            var uri = event.target.result;
				var image = uri;
				con = true;
				$.ajax({
					url: site_url+'assets/sources/appupload.php',
					data:{
						action: 'upload',
						base64: image,
						uid: user.id
					},
					cache: false,
					contentType: "application/x-www-form-urlencoded",				  
					type:"post",
					dataType:'JSON',
					success:function(response){
						userInfo(user.id);						
					}
				});	                
          };
          fileReader.readAsDataURL(flowFile.file);
    });
  };

    $scope.uploadPhoto = function(val) {
	alang = $localstorage.getObject('alang');
	  if (window.cordova) {
	      var hideSheet = $ionicActionSheet.show({
	        buttons: [
	          { text: alang[0].text },
	          { text: alang[1].text }
	        ],
	        cancelText: alang[2].text,
	        cancel: function() {
	          },
	        buttonClicked: function(x) {
				if(x == 1){
					var options = {
						quality: 40,
						destinationType: Camera.DestinationType.DATA_URL,
						sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
						encodingType: Camera.EncodingType.JPEG,
						allowEdit : true,
					};
				}else {
					var options = {
						quality: 40,
						destinationType: Camera.DestinationType.DATA_URL,
						encodingType: Camera.EncodingType.JPEG,
						allowEdit : true,
					};
				}
				$cordovaCamera.getPicture(options).then(function(imageData) {
					var image = "data:image/jpeg;base64," + imageData;
					$.ajax({
						url: site_url+'assets/sources/appupload.php',
						data:{
							action: 'upload',
							base64: image,
							uid: user.id
						},
						cache: false,
						contentType: "application/x-www-form-urlencoded",				  
						type:"post",
						dataType:'JSON',
						success:function(response){
							$scope.uphotos = response.user.photos;
							usPhotos = response.user.photos;
							$scope.photo1 = usPhotos[0];
							$scope.photo2 = usPhotos[1];
							$scope.photo3 = usPhotos[2];
							$scope.photo4 = usPhotos[3];
							$scope.photo5 = usPhotos[4];
							$scope.photo6 = usPhotos[5];
						}
					});
				}, function(err) {
				  // error
				});			  
	          return true;
	        }
	      });
		} else {
			$('#uploadRegPhoto').click();
		}	      
    }	


	function userInfo(id){
		try {	
		  $scope.ajaxRequest = A.Device.get({action: 'userProfile', id: id});
		  $scope.ajaxRequest.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest.user);	
				$scope.uphotos = $scope.ajaxRequest.user.photos;	
				$localstorage.setObject('usPhotos',$scope.ajaxRequest.user.photos); 
		  },
		  function(){}
		  )		 
		}
		catch (err) {
		console.log("Error " + err);
		}	
	} 
	userInfo(user.id);   			
  })

  .controller('popularityCtrl', function($state,$rootScope,$ionicViewSwitcher,$scope,A, $ionicModal,$localstorage,Navigation) {
	user = $localstorage.getObject('user');
	lang = $localstorage.getObject('lang');

	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.spotlightprice = site_prices.spotlight;
	$scope.alang = [];
	$('#ready').removeClass('hidden');
	$rootScope.logged = true;
	$rootScope.me = user;


  })  	

  .controller('SettingsCtrl', function($state,$rootScope,$ionicViewSwitcher,$ionicActionSheet,$scope,A, $ionicModal,$localstorage,Navigation) {
	user = $localstorage.getObject('user');
	lang = $localstorage.getObject('lang');

	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.spotlightprice = site_prices.spotlight;
	$scope.alang = [];
	$('#ready').removeClass('hidden');
	$rootScope.logged = true;
	$rootScope.me = user;
	$scope.newChat = false;

	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}

	$scope.lang = [];
	if(user.notification.fan == 1){
		$scope.likes = true;
	} else {
		$scope.likes = false;
	}
	if(user.notification.visit == 1){
		$scope.visits = true;
	} else {
		$scope.vists = false;
	}
	if(user.notification.superlike == 1){
		$scope.superlike = true;
	} else {
		$scope.superlike = false;
	}
	if(user.notification.match_m == 1){
		$scope.matches = true;
	} else {
		$scope.matches = false;
	}
	if(user.notification.message == 1){
		$scope.messages = true;
	} else {
		$scope.messages = false;
	}								
	$scope.openPrivacy = function(){
		if (window.cordova) {
			cordova.InAppBrowser.open(site_url+'index.php?page=pp', '_blank', 'location=yes');
		} else {
			window.open(site_url+'index.php?page=pp', '_blank', 'location=yes');
		}		
	}
	$scope.openTerms = function(){
		if (window.cordova) {
			cordova.InAppBrowser.open(site_url+'index.php?page=tac', '_blank', 'location=yes');
		} else {
			window.open(site_url+'index.php?page=tac', '_blank', 'location=yes');
		};			
	}
	$scope.deleteProfile = function(){
		  var hideSheet = $ionicActionSheet.show({
			buttons: [
			  { text: lang[150].text }
			],
			cancelText: alang[2].text,
			cancel: function() {
			  },
			buttonClicked: function(index) {	
				var message = user.id;
				A.Query.get({action: 'logout', query: message});
				$localstorage.setObject('user','');
				chats = [];
				matche = [];
				mylikes = [];
				myfans = [];
				cards = [];
				visitors = [];		
				$state.go('loader');
			}
		  });

	}	
	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry.id,
		text: entry.text
	  });
	});

	$scope.city = user.city;
	$scope.country = user.country;
	$scope.s_age = user.sage;
	if(user.looking == 1){
		$scope.gender = lang[120].text;			
	}
	if(user.looking == 2){
		$scope.gender = lang[121].text;
	}
	if(user.looking == 3){
		$scope.gender = lang[122].text;			
	}		

	$scope.updateGender = function() {
	  var hideSheet = $ionicActionSheet.show({
		buttons: [
		  { text: lang[120].text },					  
		  { text: lang[121].text },
		  { text: lang[122].text }
		],
		cancelText: alang[2].text,
		cancel: function() {
		  },
		buttonClicked: function(index) {
			var gender;
			if(index == 0){
				$scope.gender = lang[120].text;		
				gender = 1;
			}
			if(index == 1){
				$scope.gender = lang[121].text;
				gender = 2;
			}
			if(index == 2){
				$scope.gender = lang[122].text;			
				gender = 3;
			}	
			var message = user.id+','+gender;
			$scope.ajaxRequest34 = A.Query.get({action: 'updateGender', query: message});
			$scope.ajaxRequest34.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest34.user);
			});				
		  return true;
		}
	  });
	}		

	if($scope.firstOpen){
		$scope.data = {};
		$scope.data.location = user.city+','+user.country;
		$scope.firstOpen = false;			
	}
	$scope.onAddressSelection = function (location) {
		$scope.data.location = location.name;
		console.log(location);
		var lat = location.geometry.location.lat();
		var lng = location.geometry.location.lng();
		var country;
		var city;

		for (var i = 0; i < location.address_components.length; i++){
		 if(location.address_components[i].types[0] == "country") {
				country = location.address_components[i].long_name;
			}
		 if(location.address_components[i].types[0] == "locality") {
				city = location.address_components[i].long_name;
			}					
		 }
		var message = user.id+','+lat+','+lng+','+city+','+country;
		$scope.ajaxRequest36 = A.Query.get({action: 'updateLocation', query: message});
		$scope.ajaxRequest36.$promise.then(function(){											
			$localstorage.setObject('user', $scope.ajaxRequest36.user);
		});				 
	};
	$scope.updateNotification = function(e,a) {
		var message = user.id+','+e+','+a;
		if(a === true){
			a = 1;
		} else {
			a = 0;
		}
		$scope.ajaxRequest = A.Query.get({action: 'updateNotification', query: message});
		$scope.ajaxRequest.$promise.then(function(){											
		});			
	};

	$scope.updateDistance = function(e) {
		var message = user.id+','+e;
		$scope.ajaxRequest3 = A.Query.get({action: 'updateSRadius', query: message});
		$scope.ajaxRequest3.$promise.then(function(){											
			$localstorage.setObject('user', $scope.ajaxRequest3.user);
		});			
	};


	$scope.updateAge = function(e) {
		var message = user.id+','+e;
		$scope.ajaxRequest31 = A.Query.get({action: 'updateAge', query: message});
		$scope.ajaxRequest31.$promise.then(function(){											
			$localstorage.setObject('user', $scope.ajaxRequest31.user);
		});			
	};	
	$scope.online = onlineMeet;
	$scope.updateOnline = function() {
		if(onlineMeet == 0){
			onlineMeet = 1;
			$scope.online = onlineMeet;
		} else {
			onlineMeet = 0;
			$scope.online = onlineMeet;
		}
	};	
	$scope.goToVisitors = function(){
		$ionicViewSwitcher.nextDirection('forward'); // 'forward', 'back', etc.
		$state.go('home.visitors');		
	}		
	
	
  })
  
  .controller('VisitorsCtrl', function($scope,$ionicViewSwitcher,$ionicPlatform,$state,Navigation,$localstorage,A,$sce,$ionicScrollDelegate,$interval,currentUser) {
	url = 'visitors';
	lang = $localstorage.getObject('lang');

	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}

	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.spotlightprice = site_prices.spotlight;
	$scope.alang = [];

	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		
		show_ad = 0;	
	}	
	show_ad++;	

	user = $localstorage.getObject('user');
	var aBasic = $localstorage.getObject('account_basic');
	var aPremium = $localstorage.getObject('account_premium');	
	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');	
	
	$scope.changePage = function(url,slide,val) {
		if($scope.canSeeVisitors){
			currentUser.selectedUser=val;
			$state.go(url, val); 
		}  
	};	
	
    $scope.show = 1;
	$scope.photo = user.profile_photo;
	var w = window.innerWidth;
	w = w/2;
	if(w > 200){
		w = 200;
	}
	$scope.w = w;
	$scope.noVisitors = false;
	if(user.premium == 0 && aBasic.visits == 0){
		$scope.canSeeVisitors = false;
	} else {
		$scope.canSeeVisitors = true;
	}
	$scope.max = 20;
	
	var visits = function () {
		try {
		  $scope.visitors = visitors;
		  $scope.ajaxRequest = A.Game.get({action: 'getVisitors', id: user.id});
		  $scope.ajaxRequest.$promise.then(function(){
				if($scope.ajaxRequest.visitors != null){				
					$scope.visitors = $scope.ajaxRequest.visitors;
					visitors = $scope.visitors;
				} else {
					$scope.noVisitors = true;	
					visitors = $scope.visitors;
				}	
				
		  },
		  function(){$scope.noVisitors = true;}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}	
	visits();
	$scope.title = alang[10].text;
  })
    
  .controller('MatchCtrl', function($scope,$ionicViewSwitcher,$ionicPlatform,$state,Navigation,$localstorage,A,$sce,$ionicScrollDelegate,$interval,currentUser) {
	user = $localstorage.getObject('user');
	lang = $localstorage.getObject('lang');

	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.firstmeprice = site_prices.first;
	$scope.cienmeprice = site_prices.discover;
	$scope.alang = [];

	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}

	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});

	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		show_ad = 0;	
	}	
	show_ad++;	


	url = 'match';
	var aBasic = $localstorage.getObject('account_basic');
	var aPremium = $localstorage.getObject('account_premium');		
	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');	
	$scope.changePage = function(url,slide,val) {
		if($scope.canSeeFans || $scope.canSeeFans == false && $scope.show != 2){
			currentUser.selectedUser=val;
			$state.go(url, val); 
		}
	};	
	$scope.show = 1;
   	$scope.onTabShow = function(val,title){
		$scope.show = val;	
		$scope.title = title;		
		if(user.premium == 0 && aBasic.fans == 0 && val == 2){
			$scope.canSeeFans = false;
		} else {
			$scope.canSeeFans = true;
		}		
	    viewScroll.scrollTop(true);
	}
	$scope.photo = user.profile_photo;
	var w = window.innerWidth;
	w = w/2;
	if(w > 200){
		w = 200;
	}
	$scope.w = w;
	$scope.noMatches = false;
	$scope.noLikes = false;
	$scope.noFans = false;
	$scope.noSuperLike= false;
	
	$scope.newlikes = 0;
	$scope.newfans = 0;	
	$scope.max = 20;
	
	var matches = function () {
		try {
		  $scope.matches = matche;
		  $scope.mylikes = mylikes;
		  $scope.myfans = myfans;
		  $scope.superlikes = superlikes;
		  
		  $scope.ajaxRequest = A.Game.get({action: 'getMatches', id: user.id});
		  $scope.ajaxRequest.$promise.then(function(){
				if($scope.ajaxRequest.matches != null){				
					$scope.matches = $scope.ajaxRequest.matches;
					matche = $scope.matches;
				} else {
					$scope.noMatches = true;	
					matche = $scope.matches;
				}
				if($scope.ajaxRequest.mylikes != null){				
					$scope.mylikes = $scope.ajaxRequest.mylikes;
					mylikes = $scope.mylikes;
				} else {
					$scope.noLikes = true;	
					mylikes = $scope.mylikes;
				}

				if($scope.ajaxRequest.superlikes != null){				
					$scope.superlikes = $scope.ajaxRequest.superlikes;
					superlikes = $scope.superlikes;
				} else {
					$scope.noSuperLike = true;	
					superlikes = $scope.superlikes;
				}				
				
				if($scope.ajaxRequest.myfans != null){				
					$scope.myfans = $scope.ajaxRequest.myfans;
					myfans = $scope.myfans;
				} else {
					$scope.noFans = true;	
					myfans = $scope.myfans;
				}							
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}	
	matches();
	$scope.title = alang[11].text;
  })
  
  
  

  .controller('MatchesCtrl', function($scope,$rootScope,$filter,$timeout,$ionicPlatform,$ionicViewSwitcher,$ionicListDelegate,$state,Navigation,$localstorage,A,$sce,$ionicScrollDelegate,$interval,currentUser) {
	$interval.cancel(chatInterval);
	user = $localstorage.getObject('user');
	url = 'messages';
	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$rootScope.me = user;
	$scope.spotlightprice = site_prices.spotlight;
	$scope.alang = [];
	$('#ready').removeClass('hidden');
	if(chats == ''){
		$scope.loader = true;
	}
	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');	
	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}

	$scope.changePage = function(url,slide,val) {
		currentUser.selectedUser=val;
		if(window.cordova){
			$state.go(url, val); 
		} else {
			$state.go(url, val); 		
		} 		 
	};	
    $scope.show = 1;
	$scope.loadM = parseInt(10);
	$scope.tab1 = 'is-active';
   	$scope.onTabShow = function(val){
		$scope.tab1 = '';   		
		$scope.tab2 = '';
		$scope.tab3 = '';			
		if(val == 1){
		 $scope.all = true;
		 $scope.unread = false;
		 $scope.online = false;		 
		 viewScroll.scrollTop(true);
		 $scope.loadM = parseInt(10);
		 $scope.tab1 = 'is-active';
		 $scope.$broadcast('scroll.infiniteScrollComplete');
		}
		if(val == 2){
		 $scope.all = false;
		 $scope.unread = true;
		 $scope.online = false;		 
		 viewScroll.scrollTop(true);
		 $scope.loadM = parseInt(10);
		 $scope.tab2 = 'is-active';
		 $scope.$broadcast('scroll.infiniteScrollComplete');
		}
		if(val == 3){
		 $scope.all = false;
		 $scope.unread = false;
		 $scope.online = true;
		 viewScroll.scrollTop(true);
		 $scope.loadM = parseInt(10);
		 $scope.tab3 = 'is-active';	
		 $scope.$broadcast('scroll.infiniteScrollComplete');	 
		}				
	}
	$scope.searching = false;
   $scope.adn = {};
	 $scope.srchchange = function () {

        $scope.matches = null;
        var filtervalue = [];
		var serachData= chats;
		$scope.searching = true;
        for (var i = 0; i <serachData.length; i++) {

            var fltvar = $filter('uppercase')($scope.adn.item);
            var jsval = $filter('uppercase')(serachData[i].name);

            if (jsval.indexOf(fltvar) >= 0) {
                filtervalue.push(serachData[i]);
            }
        }
        if($scope.adn.item.length == 0){
			$scope.ressetserach();
        }
        $scope.matches = filtervalue;

    };

    $scope.ressetserach = function () {
        $scope.adn.item = "";
        $scope.matches = chats;
    }

	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		
		show_ad = 0;	
	}	
	show_ad++;	

	$scope.unread = false;
	$scope.online = false;	
	$scope.all = true;	
	
	var chat = function () {
		try {
		  $scope.matches = chats;
		  $scope.ajaxRequest2 = A.Game.get({action: 'getChat', id: user.id});
		  $scope.ajaxRequest2.$promise.then(function(){
				$scope.matches = $scope.ajaxRequest2.matches;
				chats = $scope.matches;
				$scope.loader = false;
				$scope.contacts = 1;
				console.log(chats);
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}	
	chat();

	$scope.onItemDelete = function(item) {
		var query = user.id+','+item.id;
		A.Query.get({action: 'del_conv' ,query: query});	
		$('.item-content').css({
		  'transform'         : 'translate3d(0px,0px,0px)'
		});
	};

	$scope.loaderMore = false;
	$scope.loadMore = function(){
		$scope.loaderMore = true;
		$timeout(function(){
			$scope.loaderMore = false;
			$scope.loadM = $scope.loadM + 10;		
		}, 300);		

	}	
	$scope.shouldShowDelete = true;
	$scope.listCanSwipe = true;
		
  })

  .controller('MessagingCtrl', function($state,$scope,$rootScope,$ionicPlatform,$interval,$ionicViewSwitcher,A, $stateParams, Giphy, $ionicScrollDelegate, $timeout, $ionicActionSheet,Navigation,currentUser,$localstorage,$ionicHistory,$ionicPopup,$cordovaCamera) {	
	user = $localstorage.getObject('user');
	alang = $localstorage.getObject('alang');
	config = $localstorage.getObject('config');
	$rootScope.appGifts = $localstorage.getObject('gifts');	
	console.log($rootScope.appGifts);
	//currentUser.selectedUser = user;
	if(currentUser.selectedUser){
		chatUser = currentUser.selectedUser;
	} else{
		chatUser = user;
		currentUser.selectedUser = user;	
	}
	
	if(window.cordova){
		$ionicViewSwitcher.nextDirection("forward");
	} else {
		$ionicViewSwitcher.nextDirection("back");
	}
	
	url = 'inchat';
	if (window.cordova) {
		$scope.app = true;
	}
	var gifts = $localstorage.getObject('gifts');
	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.dailychatprice = site_prices.chat;
	$scope.alang = [];
	$scope.focusInput = false;
	$scope.wait = false;
	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		
		show_ad = 0;	
	}
	show_ad++;
	angular.forEach(alang,function(entry) {						  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	$scope.gifts = gifts;
	$scope.sendGiftShow = false;
	

	$scope.buyDailyChat = function(){
		user.credits = parseInt(user.credits);
		if(site_prices.chat > user.credits){
			$scope.openCreditsModal();
		} else {
			var ma = user.id + ','+ site_prices.chat;
			 $scope.chatLimit = false;
				try {	
				  $scope.ajaxRequest = A.Query.get({action: 'chat_limit', query: ma});
				  $scope.ajaxRequest.$promise.then(function(){		
				  $scope.ajaxRequest.user = $localstorage.setObject('user');
				  },
				  function(){}
				  )		 
				}
				catch (err) {
					console.log("Error " + err);
				}
		}
	};
	

	 $scope.processFiles = function(files){
	angular.forEach(files, function(flowFile, i){
	   var fileReader = new FileReader();
	      fileReader.onload = function (event) {
	        var uri = event.target.result;
				var image = uri;
				  $scope.nmessages.push({
					isMe: true,
					seen:1,
					type: 'image',
					body: image
				  });
				con = true;
				$.ajax({
					url: site_url+'assets/sources/appupload.php',
					data:{
						action: 'sendChat',
						base64: image,
						uid: user.id,
						rid: currentUser.selectedUser.id
					},
					cache: false,
					contentType: "application/x-www-form-urlencoded",				  
					type:"post",
					dataType:'JSON',
					success:function(){
					}
				});	                
	      };
	      fileReader.readAsDataURL(flowFile.file);
	});
	};	

	$scope.sendPhoto = function(x){
		if (window.cordova) {
		if(x == 1){
			var options = {
				quality: 40,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				encodingType: Camera.EncodingType.JPEG,
				allowEdit : false,
			};
		}else {
			var options = {
				quality: 40,
				destinationType: Camera.DestinationType.DATA_URL,
				encodingType: Camera.EncodingType.JPEG,
				allowEdit : false,
			};
		}

		$cordovaCamera.getPicture(options).then(function(imageData) {
			var image = "data:image/jpeg;base64," + imageData;
			  $scope.nmessages.push({
				isMe: true,
				seen:1,
				type: 'image',
				body: image
			  });
			$.ajax({
				url: site_url+'assets/sources/appupload.php',
				data:{
					action: 'sendChat',
					base64: image,
					uid: user.id,
					rid: currentUser.selectedUser.id
				},
				cache: false,
				contentType: "application/x-www-form-urlencoded",				  
				type:"post",
				dataType:'JSON',
				success:function(response){
					
				}
			});
		}, function(err) {
		  // error
		});	
		} else {
			$('#uploadSendPhoto').click();
		}	
	}
	$scope.sendGift = function(icon,price){
		$scope.gift_icon = icon;
		$scope.gift_price = price;
		user.credits = parseInt(user.credits);
		if(user.credits < price){
			$scope.openCreditsModal("'"+user.profile_photo+"'");
		} else {
			$scope.sendGiftShow = true;
		}
	}
	$scope.cancelGift = function(){		
		$scope.sendGiftShow = false;
	}	
	$scope.changePage = function(url,slide,val) {
		$state.go(url, val);  
	};
	$interval.cancel(chatInterval);

	/*
	$scope.goToChat = function(){
		$ionicViewSwitcher.nextDirection('back'); // 'forward', 'back', etc.
		$state.go('home.matches');		
	}
	*/
	$scope.actions = true;
	$scope.visible = function(val){
		if(val == 1){
			$scope.actions = false;	
		} else {
			$scope.isGifShown = false;
		}
	}
	var bIds = {};	
	
	$scope.showm = 15;
	
	$scope.loadMoreMen = function(more){
		var total = more + $scope.showm;
		var totalMe = $scope.totalMen - more;
		if(totalMe <= 0 ){
			totalMe = 0;	
			$scope.moreMen = false;
		}
		$scope.totalMen = totalMe;
		$scope.showm = total;
	}
	
	var w = window.innerWidth;
	w = w/2;
	if(w > 200){
		w = 200;
	}
	$scope.w = w;
	var premium = 0;
	var blocked = 0;
	$scope.maxDaily = false;
    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
	$scope.messages = [];
	$scope.nmessages = [];   
	$scope.loader = true; 
	var getChat = function (id) {
		try {	
		  $scope.ajaxRequest = A.Chat.get({action: 'userChat', uid1: user.id, uid2: id});
		  $scope.ajaxRequest.$promise.then(function(){		
		  $scope.messages=$scope.ajaxRequest.chat;
		  premium = $scope.ajaxRequest.premium;
		  blocked = $scope.ajaxRequest.blocked;
		  if(blocked == 1){
		   var confirmPopup = $ionicPopup.confirm({
			 title: alang[12].text+' '+ currentUser.selectedUser.name,
			 template: currentUser.selectedUser.name +' ' + alang[13].text
		   });
		   confirmPopup.then(function(res) {
			 if(res) {
				$ionicHistory.goBack();
			 }
		   });				  
		  }
		  if(premium == 1){
			 $scope.chatLimit = true;
		  }
			if ($scope.messages === undefined || $scope.messages.length == 0) {
			  $scope.focusInput = true;
			  $scope.loader =false;	
			  return false;
			}
		  if($scope.messages.length > 15){
			$scope.moreMen = true;
			$scope.totalMen = $scope.messages.length - 15;
		  }

		  $scope.loader = false;
		  viewScroll.scrollBottom(true);
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			
			console.log("Error " + err);
		}	
	}

	var sendMessage = function (message) {
		try {	
			if ($scope.messages === undefined || $scope.messages.length == 0 && $scope.nmessages === undefined || $scope.nmessages.length == 0) {
				 A.Query.get({action: 'today', query: user.id});
			}
		  
		  $scope.ajaxRequest2 = A.Query.get({action: 'sendMessage', query: message});
		  $scope.ajaxRequest2.$promise.then(function(){	
			
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	} 	

	
	$scope.name = currentUser.selectedUser.name;
	$scope.photo = currentUser.selectedUser.photo;
	$scope.age = currentUser.selectedUser.age;
	$scope.city = currentUser.selectedUser.city;
	$scope.id = currentUser.selectedUser.id;



	$scope.status = false;
	$scope.chatLimit = false;
	getChat(currentUser.selectedUser.id);	
	if(currentUser.selectedUser.status == 1){
		$scope.status = true;
	}	
    $scope.isNew = false;
    $scope.gifs = [];
    $scope.gifQuery = '';
    $scope.isGifShown = false;
    $scope.isGiftShown = false;
    $scope.isGifLoading = false;


    $scope.message = '';
	var sendNewChat = 0;

	var tt = true;
	var sent = false;

	function updateLastTypedTime() {
	    lastTypedTime = new Date();
	}	
	

	$scope.writing = false;


	var textarea = $('#chat-input-textarea');
	var typingDelayMillis = 800; // how long user can "think about his spelling" before we show "No one is typing -blank space." message
	updateLastTypedTime();
	function refreshTypingStatus() {
	    if (textarea.val() == '') {
			var message = user.id+','+currentUser.selectedUser.id+','+0;
			A.RT.get({action: 'typing', query: message});
			console.log('no typing');
	    } else {
	    	var t = new Date().getTime() - lastTypedTime.getTime();
	    	t = parseInt(t);
	    	if( t > typingDelayMillis){
		    	updateLastTypedTime();
		    	console.log('typing more');
		    	var message = user_info.id+','+user+','+1;
				$.get( gUrl, { action: 'typing', query: message } );
			}	    	
	    	console.log('waiting');
	    }
	}


	//setInterval(refreshTypingStatus, 1000);
	textarea.keypress(refreshTypingStatus);
	textarea.blur(refreshTypingStatus);

	var typing = 'typing'+user.id+chatUser.id;
	channel.unbind();
    channel.bind(typing, function(data) {
    	if(data.t == 1){
    		$scope.writing = true;  
    	} else {
			$scope.writing = false; 
    	}  	   
    });	
    	
	var event = 'chat'+user.id+chatUser.id;
    channel.bind(event, function(data) {
	  sendNewChat = $scope.nmessages.length + 1;
	      $scope.nmessages.push({
	        isMe: false,
			seen:1,
	        type: data.type,
	        body: data.message
	      });
	  	$scope.writing = false; 	      
		if (window.cordova) {
			$rootScope.playSound('inchat');
		} else {
			$('#chatSound')[0].play();
		}

	  viewScroll.scrollBottom(true);      
    });		

    $scope.sendText = function(m) {
      sent = true;
	  sendNewChat = $scope.nmessages.length + 1;
      $scope.nmessages.push({
        isMe: true,
		seen:0,
        type: 'text',
        body: m
      });
      var send = user.id+','+currentUser.selectedUser.id+','+user.profile_photo+','+user.first_name+','+m+',text';      
	  var message = user.id+','+currentUser.selectedUser.id+','+m+',text';
	  A.RT.get({action: 'message', query: send});	
	  viewScroll.scrollBottom(true);
	  sendMessage(message);
    }

    $scope.newGif = function(newValue) {
      if (newValue.length) {
        $scope.isGifLoading = true;
        $scope.gifs = [];

        Giphy.search(newValue)
          .then(function(gifs) {
            $scope.gifs = gifs;
            $scope.isGifLoading = false;
          })
      } else {
        _initGiphy();
      }
    }

    $scope.sendGif = function(imageUrl) {
      $scope.nmessages.push({
        isMe: true,
        type: 'image',
        body: imageUrl
      });
	  var message = user.id+','+currentUser.selectedUser.id+','+imageUrl+',image';
	  sendMessage(message);
      $scope.cmen = '';
	  $scope.isGifShown = false;
	  viewScroll.scrollBottom(true);
    }
	
    $scope.sendGiftBtn = function(imageUrl,price) {
	  var m = '<img src="'+imageUrl+'"/>';
      $scope.nmessages.push({
        isMe: true,
        type: 'text',
        body: '<img src="'+imageUrl+'"/>'
      });
	  var message = user.id+','+currentUser.selectedUser.id+','+m+',gift,'+price;
	  sendMessage(message);
      $scope.cmen = '';
	  $scope.isGiftShown = false;
	  viewScroll.scrollBottom(true);
    }

    $scope.openGiphy = function() {
	if($scope.isGifShown == true){
		$scope.isGifShown = false; 
	} else {
  		$scope.isGifShown = true; 		
	}
	$scope.isGiftShown = false;      
	$scope.actions = true;
	$scope.message = '';
    }
    $scope.openGift = function() {
	if($scope.isGiftShown == true){
		$scope.isGiftShown = false; 
	} else {
  		$scope.isGiftShown = true; 		
	}
	  $scope.isGifShown = false;      
	  $scope.actions = true;
      $scope.message = '';
    }

    $scope.openStickers = function() {
	if($rootScope.showStickers == true){
		$rootScope.showStickers = false; 
	} else {
  		$rootScope.showStickers = true; 		
	}
	  $scope.isGifShown = false;      
	  $scope.actions = true;
      $scope.message = '';
    }    	
	
    $scope.closeGift = function() {
      $scope.isGiftShown = false;
    }		
	
    $scope.closeGiphy = function() {
      $scope.isGifShown = false;
      $scope.message = '';
    }	

    var _scrollBottom = function(target) {
      target = target || '#type-area';

      viewScroll.scrollBottom(true);
      _keepKeyboardOpen(target);
      if ($scope.isNew) $scope.isNew = false;
    }

    // Warning: Demo purpose only. Stay away from DOM manipulating like this
    var _keepKeyboardOpen = function(target) {
      target = target || '#type-area';

      txtInput = angular.element(document.body.querySelector(target));
      console.log('keepKeyboardOpen ' + target);
      txtInput.one('blur', function() {
        console.log('textarea blur, focus back on it');
        txtInput[0].focus();
      });
    }


    // Show the action sheet
    $scope.showUserOptions = function() {
      var hideSheet = $ionicActionSheet.show({
		titleText: alang[14].text,									 
        buttons: [
          { text: alang[15].text },
          { text: alang[16].text },
          { text: alang[17].text +' '+currentUser.selectedUser.name }
        ],
        cancelText: alang[2].text,
        cancel: function() {
            // add cancel code..
          },
        buttonClicked: function(index) {
			if(index == 0){
				$rootScope.openProfileModal(currentUser.selectedUser.id,currentUser.selectedUser.name,currentUser.selectedUser.photo,currentUser.selectedUser.age,currentUser.selectedUser.city);
			}
			if(index == 1){
				var query = user.id+','+currentUser.selectedUser.id;
				A.Query.get({action: 'del_conv' ,query: query});
				$state.go('home.matches');
			}
			if(index == 2){

				   var confirmPopup = $ionicPopup.confirm({
					 title: alang[17].text+' '+ currentUser.selectedUser.name,
					 template: alang[18].text +' '+ currentUser.selectedUser.name +'?'
				   });
				
				   confirmPopup.then(function(res) {
					 if(res) {
						var query = user.id+','+currentUser.selectedUser.id;
						A.Query.get({action: 'block' ,query: query});
						setTimeout(function(){
							$state.go('home.matches');
						},550);
					 } else {
					   
					 }
				   });
				 };	
			
          return true;
        }
      });
    }

    // Onload
    var _initGiphy = function() {
      Giphy.trending()
        .then(function(gifs) {
          $scope.gifs = gifs;
        });
    }
    _initGiphy();
  })
  