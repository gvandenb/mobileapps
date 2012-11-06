var SERVER_PROTOCOL = "http://";
var SERVER_JSON = "stage.uberticket.com";
var selectedUserPhoneNumber = null;
var selectedUserMessage = null;
var userPref = new userPreference();
var currentPosition = null;
var currentTicketRequest = 0;
var curPlace = new currentPlace();
var curCheckin = new currentCheckIn();
var blueIcon = "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png";
var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
    	
    	
    	
    	
    	// setup pageshow events
    	$('#buyerBroadcast').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 	    	$('#myLocation0').html('I am currently checked in at ' + curPlace.name + '<br/><br/>');
 	    	
 	    	
    		$('#bcast0').click(function() {
    			currentTicketRequest = $("select#select-choice-min0").val();
    			// set current place
     	    	curCheckin.place = curPlace;
     	    	
     	    	// set user location
     	    	curCheckin.location = currentPosition;
     	    	
     	    	// set num tickets for request/checkin
     	    	curCheckin.numtickets = currentTicketRequest;
     	    	
     	    	// set current userid
     	    	curCheckin.userid = userPref.userid;
     	    	
     	    	// set type of checkin
     	    	curCheckin.type = 0;
    			
     	    	//alert(JSON.stringify(curCheckin));
 	    		//doBroadcast('buyer');
     	    	var plural = (currentTicketRequest == 1) ? " ticket" : " tickets";
 	    		doBroadcast('buyer','I am currently checked in at ' + curPlace.name + '.  I need '+ currentTicketRequest +plural +'.');
 	    		// call to server to register checkin
 	    		$.ajax({
 		 	   		type: 'POST',
 		 	   		data: encodeURIComponent('CheckIn[json]')+ '='+JSON.stringify(curCheckin),
 		 	   		url: 'http://stage.uberticket.com/user/checkinJSON',
 		 	   		dataType: 'json',
 		 	   		success: function(data){
 		 	   			console.log(data.result);
 		 	   			 $.mobile.hidePageLoadingMsg();
 		 	   			 // TODO:  show map page with updated markers for buyers and sellers
 		 	   			 $.mobile.changePage( "home.html", { transition: "slide"} );
 		 	   		},
 		 	   		error: function(){
 		 	   			console.log(data.result);
 		 	   			$.mobile.hidePageLoadingMsg();
 		 	   			//alert('There was an error adding your message');
 		 	   		}
 		 	   	});
 	    	});
 	    });
    	
    	$('#sellerBroadcast').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 	    	$('#myLocation1').html('I am currently checked in at ' + curPlace.name + '<br/><br/>');
 	    	
 	    	
    		$('#bcast1').click(function() {
    			currentTicketRequest = $("select#select-choice-min1").val();
    			console.log("Num Tickets for sale: " + currentTicketRequest);
    			// set current place
     	    	curCheckin.place = curPlace;
     	    	
     	    	// set user location
     	    	curCheckin.location = currentPosition;
     	    	
     	    	// set num tickets for request/checkin
     	    	curCheckin.numtickets = currentTicketRequest;
     	    	
     	    	// set current userid
     	    	curCheckin.userid = userPref.userid;
     	    	
     	    	// set type of checkin
     	    	curCheckin.type = 1;
     	    	
    			//alert(JSON.stringify(curCheckin));
     	    	var plural = (currentTicketRequest == 1) ? " ticket" : " tickets";
 	    		doBroadcast('seller','I am currently checked in at ' + curPlace.name + '. I have '+currentTicketRequest+plural +' for sale.');
 	    		// call to server to register checkin
 	    		console.log("call to server to register checkin");
 	    		$.ajax({
 		 	   		type: 'POST',
 		 	   		data: encodeURIComponent('CheckIn[json]')+ '='+JSON.stringify(curCheckin),
 		 	   		url: 'http://stage.uberticket.com/user/checkinJSON',
 		 	   		dataType: 'json',
 		 	   		success: function(data){
 		 	   			console.log("Successfully checked in: " + data.result);
 		 	   			 $.mobile.hidePageLoadingMsg();
 		 	   			 // TODO:  show map page with updated markers for buyers and sellers
 		 	   			 $.mobile.changePage( "home.html", { transition: "slide"} );
 		 	   		},
 		 	   		error: function(){
 		 	   			console.log("An error occured while checking in: " + data.result);
 		 	   			console.log(data.result);
 		 	   			$.mobile.hidePageLoadingMsg();
 		 	   			//alert('There was an error adding your message');
 		 	   		}
 		 	   	});
 	    	});
 	    });
 	    
    	$('#buyerMap').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 	    	setupMap('buyer_map_canvas','buyer');
 	    	setupCheckmarks('buyer');
 	    	//alert("License: " + userPref.license);
 	    });
    	
    	$('#sellerMap').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 	    	setupMap('seller_map_canvas','seller');
 	    	setupCheckmarks('seller');
 	    	//alert("License: " + userPref.license);
 	    });
 	    
 	    $('#register').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 	    	createUser();
 	    });
 	    
 	    $('#signin').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
	    	signIn();
	    });
 	    
 	    $('#license').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 	    	setupLicenseHandler();
 	    });
 	    
 	    $('#home').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 	    	if (userPref.userid == null) {
 	 	    	$('#menuSigninIcon').attr("src","images/signin_icon.png");	
 	    	}
 	    	else {
 	 	    	$('#menuSigninIcon').attr("src","images/signout_icon.png"); 	    		
 	    	}
 	    	
 	    	setupHomeMap();
 	    	$('#menuBuyerIcon').click(function(){
 	    		$.mobile.changePage( "buyer_map.html", { transition: "slide"} );
 	    	});
 	    	$('#menuSellerIcon').click(function(){
 	    		$.mobile.changePage( "seller_map.html", { transition: "slide"} );
 	    	});
 	    	
 	    	$('#menuSigninIcon').click(function(){
 	    		// TODO just nullify the userid to maintain state for license and tutorial
 	    		if (userPref.userid == null) {
 	    			$.mobile.changePage( "signin.html", { transition: "slide"} );
 	    		}
 	    		else {
 	    			
 	    			// check application preferences
 	    	    	//console.log("checking preferences...");
 	    	    	window.plugins.applicationPreferences.get('enabled_preference', function(result) {
 	    	            	//console.log("We got a setting: " + result);
 	    	            	if (result == 1) {
 	    	            		userPref = new userPreference();
 	    	            		// reset local storage
 	    	            		localStorage.setItem("userPref", JSON.stringify(userPref));
 	    	            	}
 	    	            	else {
 	    	            		userPref.userid = null;
 	    	            	}
 	    	 	    		pageRedir();
 	    		    	}, function(error) {
 	    		            console.log("Failed to retrieve a setting: " + error);
 	    		        }
 	    		    );
 	    	    		
 	    		}
 	    		
 	    	});
 	    });
 	   
 	    //alert("localstorage: " + localStorage.length);
 	    $('#tutorial7').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 	    	// setup click handler for tutorial service
 	 	    $('#tutorialComplete').click(function() {
 	 	    	$.mobile.showPageLoadingMsg();
 	 	    	// check to see if the localstorage has a userPref obj
 	 	 	   	rawData = localStorage.getItem("userPref");
 	 	 	   	// Data parsed here as it was stringified before saving
 	 	 	   	if (rawData) userPref = JSON.parse(rawData);
 	 	    	userPref.tutorial = 1;
 	 	    	localStorage.setItem("userPref", JSON.stringify(userPref));
 		 	   	
 	 	    	$.ajax({
 		 	   		type: 'POST',
 		 	   		data: encodeURIComponent('SignIn[json]')+ '='+JSON.stringify(userPref),
 		 	   		url: 'http://stage.uberticket.com/user/serviceJSON',
 		 	   		dataType: 'json',
 		 	   		success: function(data){
 		 	   			console.log(data.status_message);
 		 	   			 $.mobile.hidePageLoadingMsg();
 		 	   			 console.log("Tutorial Service updated");
 		 	   			 console.log(userPref);
 		 	   		},
 		 	   		error: function(){
 		 	   			console.log(data.status_message);
 		 	   			$.mobile.hidePageLoadingMsg();
 		 	   			//alert('There was an error adding your message');
 		 	   		}
 		 	   	});
 	 	    	$.mobile.changePage( "home.html", { transition: "slide"} );
 		 	   		
 	 	    });
	    });
 	   
 	    
 	    // check to see if the localstorage has a userPref obj
 	   rawData = localStorage.getItem("userPref");
       // Data parsed here as it was stringified before saving
       if (rawData) userPref = JSON.parse(rawData);
 	   console.log("userPref: " + userPref);
 	    // if userid is not null get updated userPref from server
 	    if (userPref != null && userPref.userid != null) {
 	    	$.ajax({
	 	   		type: 'GET',
	 	   		url: 'http://stage.uberticket.com/user/getServicesJSON/id/'+userPref.userid,
	 	   		dataType: 'json',
	 	   		success: function(data){
	 	   			console.log("retrieved: " + data.user_id);
	 	   			userPref.license = data.license;
	 	   			userPref.location = data.location;
	 	   			userPref.userid = data.user_id;
	 	   			userPref.tutorial = data.tutorial;
	 	   			userPref.push = data.push;
	 	   			//$.mobile.hidePageLoadingMsg();
	 	   			console.log("Services retrieved");
	 	   		},
	 	   		error: function(){
	 	   			//console.log(data.status_message);
	 	   			//$.mobile.hidePageLoadingMsg();
	 	   			//alert('There was an error adding your message');
	 	   		}
	 	   	});	
 	    }
 	    
 	    
 	    //alert("license: " + userPref.license);
 	    // redirect to appropriate page
 	    pageRedir();
 	    
 	    
    	// note that this is an event handler so the scope is that of the event
        // so we need to call app.report(), and not this.report()
        initPushwoosh();

        
		
		var pushNotification = window.plugins.pushNotification;
		pushNotification.setTags({deviceName:"uberTicket v1.1", deviceId:10},
										function(status) {
											console.warn('setTags success');
										},
										function(status) {
											console.warn('setTags failed');
										});

		
		var onSuccess = function(position) {
			currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			pushNotification.sendLocation({lat:position.coords.latitude, lon:position.coords.longitude},
									 function(status) {
										  console.warn('sendLocation success');
									 },
									 function(status) {
										  console.warn('sendLocation failed');
									 });

		};
		
		// onError Callback receives a PositionError object
		//
		function onError(error) {
			console.log('code: '    + error.code    + '\n' +
				  'message: ' + error.message + '\n');
		}
		
		navigator.geolocation.getCurrentPosition(onSuccess, onError);

		app.report('deviceready');
    },
    report: function(id) {
        console.log("report:" + id);
        // hide the .pending <p> and show the .complete <p>
        document.querySelector('#' + id + ' .pending').className += ' hide';
        var completeElem = document.querySelector('#' + id + ' .complete');
        completeElem.className = completeElem.className.split('hide').join('');
    }
    
    
};

function pageRedir() {
	if (userPref.license == 0) {
    	//alert(JSON.stringify(userPref));
    	$.mobile.changePage( "license.html", { transition: "slide"} );
    }
    else if (userPref.userid == null) {
    	$.mobile.changePage( "signin.html", { transition: "slide"} );
    }
    else if (userPref.tutorial == 0) {
    	$.mobile.changePage( "tutorial.html", { transition: "slide"} );
    }
    else {
    	console.log("changing to home.html");
    	$.mobile.changePage( "home.html", { transition: "slide"} );
    }	

}

function initPushwoosh()
{
	var pushNotification = window.plugins.pushNotification;
	pushNotification.onDeviceReady();
	//alert('attempting to register device');
	pushNotification.registerDevice({alert:true, badge:true, sound:true, pw_appid:"9D5DC-9C82D", appname:"uberTicket v1.1"},
									function(status) {
										var deviceToken = status['deviceToken'];
										console.warn('registerDevice: ' + deviceToken);
									},
									function(status) {
										console.warn('failed to register : ' + JSON.stringify(status));
										//navigator.notification.alert(JSON.stringify(['failed to register ', status]));
									});
	
	pushNotification.setApplicationIconBadgeNumber(0);
	
	document.addEventListener('push-notification', function(event) {
									var notification = event.notification;
									navigator.notification.alert(notification.aps.alert);
									console.warn('APN received: ');
                              console.log(notification.u.custom);
									pushNotification.setApplicationIconBadgeNumber(0);
							  });
}

function userPreference() {
	this.userid = null;
	this.license = 0;
	this.location = 0;
	this.tutorial = 0;
	this.push = 0;
	this.sms = 0;
}

function currentPlace() {
	this.name = null;
	this.location = null;
	this.id = null;
	this.icon = null;
}

function currentCheckIn() {
	this.place = null;
	this.numtickets = 0;
	this.location = null;
	this.userid = 0;
	this.type = null;
}

function doBroadcast(type,message) {
	//alert("in doBroadcast()");
	var JSONObject = {
					"request":{
      			      	"application":"9D5DC-9C82D",
      			      	"auth":"TqclNvC8LscwT1iXwO2zN+PyTTnS/Dyf5gAzEFVd5KMECtr1xgm891gVjhkDQlHnNJ4gBptcpYFd2JGyNXZW",
      			      	"notifications":[{
      	          			"send_date":"now",           
      	          			"content":message,
      	          			"ios_badges": 1,
	      	          		 "data":{                     // JSON string or JSON object, will be passed as "u" parameter in the payload
	      	                   "custom": "json data"
	      	          		 }
      			      	}],
					 	
					}
				};
	
	var JSONString = eval(JSONObject);
	//var numType = (type == 'buyer') ? 0 : 1;
	//$('#messageSuccess'+numType).html("");
	$.mobile.showPageLoadingMsg();
	$.ajax({
		type: 'POST',
		data: JSON.stringify(JSONString),
		url: 'https://cp.pushwoosh.com/json/1.3/createMessage',
		dataType: 'json',
		success: function(data){
			console.log("doBroadcast() status: "+ data.status_message);
			 $.mobile.hidePageLoadingMsg();
			 //$('#messageSuccess'+numType).html("<h3>Your request has been broadcast!</h3>  If someone has what you need you will receive an alert.  Simply respond to the alert and you'll be connected to the individual who has the tickets you want.");
			 //$.mobile.changePage( "home.html", { transition: "slide"} );
		},
		error: function(){
			console.log(data.status_message);
			$.mobile.hidePageLoadingMsg();
			//alert('There was an error adding your message');
		}
	});	
}

function onSuccess(data, status)
{
	console.log("Account created successfully");
	$.mobile.hidePageLoadingMsg();
	
	console.log(data);
	
	userPref.userid = data.userid;
	console.log(data.userid);
	// put in local storage
  	localStorage.setItem("userPref", JSON.stringify(userPref));
  	console.log("set local storage");
  	if (userPref.tutorial == 0) {
    	$.mobile.changePage( "tutorial.html", { transition: "slide"} );
    }
    else {
    	console.log("changing to home.html");
    	$.mobile.changePage( "home.html", { transition: "slide"} );
    }
    
}

function onError(data, status)
{
    // handle an error
	$.mobile.hidePageLoadingMsg();
	
	var e = JSON.parse(data.responseText);
	console.log(data);
	// reset error messages
	$('#emailError').html("");
	$('#passwordError').html("");
	$('#confirmError').html("");
	$('#phoneNumberError').html("");

	
	if (e.User_email) {
		var message = JSON.stringify(e.User_email);
		$('#emailError').html(message);
	}
	if (e.User_password) {
		var message = JSON.stringify(e.User_password);
		$('#passwordError').html(message);
	}
	if (e.User_confirm) {
		var message = JSON.stringify(e.User_confirm);
		$('#confirmError').html(message);
	}
	if (e.User_phone_number) {
		var message = JSON.stringify(e.User_phone_number);
		$('#phoneNumberError').html(message);
	}
	 
}        

function onSigninSuccess(data, status)
{
	$.mobile.hidePageLoadingMsg();
	console.log(data.userid);
	userPref.userid = data.userid;
	$.mobile.showPageLoadingMsg();
	$.ajax({
		type: 'POST',
		data: encodeURIComponent('SignIn[json]')+ '='+JSON.stringify(userPref),
		url: 'http://stage.uberticket.com/user/serviceJSON',
		dataType: 'json',
		success: function(data){
			console.log(data.status_message);
			 $.mobile.hidePageLoadingMsg();
			 console.log("Services updated");
		},
		error: function(){
			console.log(data.status_message);
			$.mobile.hidePageLoadingMsg();
			//alert('There was an error adding your message');
		}
	});	
	
	// update local storage
	 rawData = localStorage.getItem("userPref");
     // Data parsed here as it was stringified before saving
     tempUserPref = JSON.parse(rawData);
     tempUserPref.userid = data.userid;
     userPref = tempUserPref;
     localStorage.setItem("userPref", JSON.stringify(userPref));
     //console.log("userPref.tutorial: " + userPref.tutorial);
	if (userPref.tutorial == 0) {
		$.mobile.changePage( "tutorial.html", { transition: "slide"} );
	}
	else {
		$.mobile.changePage( "home.html", { transition: "slide"} );		
	}
    
}

function onSigninError(data, status)
{
    // handle an error
	$.mobile.hidePageLoadingMsg();
	
	var e = $.parseJSON(data.responseText);
	
	// reset error messages
	$('#usernameError').html("");
	$('#passwordError').html("");
	
	if (e.LoginForm_username) {
		var message = JSON.stringify(e.LoginForm_username);
		$('#usernameError').html(message);
	}
	if (e.LoginForm_password) {
		var message = JSON.stringify(e.LoginForm_password);
		$('#passwordError').html(message);
	}

	 
}

function createUser() {
	$("#registerSubmit").click(function(){
        var formData = $("#createUser").serialize();

        $.mobile.showPageLoadingMsg();
        $.ajax({
            type: "POST",
            url: "http://stage.uberticket.com/user/create",
            cache: false,
            data: formData,
            dataType: 'json',
            success: onSuccess,
            error: onError
        });

        return false;
    });
	

}

function signIn() {
	$("#signinSubmit").click(function(){
        var formData = $("#signIn").serialize();

        $.mobile.showPageLoadingMsg();
        $.ajax({
            type: "POST",
            url: "http://stage.uberticket.com/site/login",
            cache: false,
            data: formData,
            dataType: 'json',
            success: onSigninSuccess,
            error: onSigninError
        });

        return false;
    });
	

}

function setupLicenseHandler() {
	$("#licenseDecline").click(function(){
		console.log("attempting to close application");
		userPref.license = 0;
		$.mobile.changePage( "signin.html", { transition: "slide"} );
	});
	$("#licenseAccept").click(function(){
		
		rawData = localStorage.getItem("userPref");
		// Data parsed here as it was stringified before saving
		if (rawData) userPref = JSON.parse(rawData);
		userPref.license = 1;
		localStorage.setItem("userPref", JSON.stringify(userPref));
		$.mobile.changePage( "signin.html", { transition: "slide"} );
	});
}

function setupMap(id,type) {
	 
	var onSuccess = function(position) {
		currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		//alert('new position');
	};

	var onError = function(error) {
		console.log('code: '    + error.code    + '\n' +
			  'message: ' + error.message + '\n');
	};
	
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
	//$('#map_canvas').gmap('option', 'zoom', 18);
	/*
	{"markers":[
	            { "latitude":0.0, "longitude":0.0 }
	    ]}
	    $('#map_canvas').gmap().bind('init', function(evt, map) { 
	            $.getJSON( 'URL_TO_JSON', function(data) { 
	                    $.each( data.markers, function(i, m) {
	                            $('#map_canvas').gmap('addMarker', { 'position': new google.maps.LatLng(m.latitude, m.longitude), 'bounds':true } );
	                    });
	            });                                                                                                                                                                                                                       
	    });
	    */
   	
   	//$('#map_canvas').gmap('displayStreetView', 'panel', { 'position': google.maps.LatLng(42.345573,-71.098326), 'pov': {'heading': 34, 'pitch': 10, 'zoom': 1 } });
	var poundRef = "#"+id;
   	
   	$(poundRef).gmap('placesSearch', { 'location': currentPosition, 'radius': '500', 'zoom': 18 }, function(results, status) {
		//alert('status: ' + status);
		if ( status === 'OK' ) {
			$.each( results, function(i, m) {
				setPlaces(m,'#'+type+'Place' + (i+1));
				var icon = new google.maps.MarkerImage(m.icon, null, null, null, new google.maps.Size(16, 16));
                $(poundRef).gmap('addMarker', { 
                	'position': m.geometry.location, 
                	'bounds':true,
                	'icon': icon
                }).click(function() {
                	showPopup(m);
                	//$('#map_canvas').gmap('openInfoWindow', {'content': m.name}, this);
                });
			});
		}
	
	});
   	
   	$(poundRef).gmap('addMarker', {
		'position': currentPosition, 
		'draggable':false,
        'title': 'You are here',
        'animation': google.maps.Animation.DROP,
        'icon': blueIcon,
		'bounds': true
	});
   	
	
}

var panorama = {
	p: null,
	marker: null,
	infowindow: null,
	map: null,
	 
	unset: function(){
		if (this.p){
			this.p.unbind("position");
			this.p.setVisible(false);
		}
		this.p = null;
		this.marker = null;
	},
	setMap: function(map){
		this.map = map;
	},
	setMarker: function(marker){
		this.marker = marker;
	},
	setInfowindow: function(infowindow){
		this.infowindow = infowindow;
	},
	open: function(){
		this.infowindow.open(this.map, this.marker);
	},
	run: function(id){
		if (!this.marker) return;
		this.p = new google.maps.StreetViewPanorama(document.getElementById(id), {
			navigationControl: true,
			navigationControlOptions: {style: google.maps.NavigationControlStyle.ANDROID},
			enableCloseButton: false,
			addressControl: false,
			linksControl: false
		});
	this.p.bindTo("position", this.marker);
	this.p.setVisible(true);
	}
};

function setupHomeMap() {
	var sellerMarker = "seller_marker.png";
	var buyerMarker = "buyer_marker.png";

	// update current position
	var onSuccess = function(position) {
		currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		console.log('new updated position');
	};

	var onError = function(error) {
		console.log('code: '    + error.code    + '\n' +
			  'message: ' + error.message + '\n');
	};
	
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
	
	//var o = { 'center': currentPosition, 'zoom': 20, 'streetViewControl': true, 'zoomControl': true, 'panControl': false, 'mapTypeControl': false, 'mapTypeId': 'terrain' };
    $('#map_canvas1').gmap({ 
	    	'center': currentPosition,
	    	'zoom': 12, 
	    	'streetViewControl': true, 
	    	'zoomControl': true,
	    	'zoomControlOptions': {
	    		'position': google.maps.ControlPosition.LEFT_TOP,
	    		'style': google.maps.ZoomControlStyle.SMALL
	    	},
	    	'disableDefaultUI':true,
	    	'mapTypeId': 'terrain'
    	}).bind('init', function(event, map) {
		//alert('in map init');
    	$('#map_canvas1').gmap('addControl', 'radios', google.maps.ControlPosition.TOP_RIGHT);
    	var tags = ['0','1'];
    	$.each(tags, function(i, tag) {
    		//alert(tag);
    		var icon = 'seller';
    		if (tag == "0") icon = 'buyer';
			$('#radios').append(('<label style="margin-right:5px;display:block;"><input type="checkbox" style="margin-right:3px" value="'+tag+'" checked/><img style="margin-top:2px;" src="images/'+icon+'_marker.png" height="20" width="20"/></label>'));
    	});
    	$.ajax({
 	   		type: 'GET',
 	   		url: 'http://stage.uberticket.com/user/getCheckins',
 	   		dataType: 'json',
 	   		success: function(data){
 	   			console.log("success");
 	   			$.each( data, function(i, m) {
 	   				var attributes = m.jsonDataSource.attributes;
 	   				var user = m.jsonDataSource.relations.user;
 	   				var userType = m.jsonDataSource.relations.userType[0];
 	   				var userAttribute = m.jsonDataSource.relations.userAttributes[0];
 	   				var location = new google.maps.LatLng(attributes.latitude,attributes.longitude);
 	   				var icon = null;
 	   				console.log('userType: ' + userType.type);
 	   				if (userType.type == 0) {
 	   					icon = buyerMarker;
 	   					tag = tags[0];
 	   				}
 	   				else {
 	   					icon = sellerMarker;
 	   					tag = tags[1];
 	   				}
	 	   			$('#map_canvas1').gmap('addMarker', {
	 	   				'userType':userType.type,
						'position': location, 
						'draggable':false,
				        'title': 'You are here',
				        'animation': google.maps.Animation.DROP,
				        'icon': 'images/'+icon,
						'bounds': false
					}).click(function() {
	                	showPopup(user,userType,userAttribute);
	                });
		 	   		/*$('#map_canvas1').gmap('addMarker', {
			 	   		'userType':'2',
		 	   			'position': currentPosition, 
			 	   		'draggable':false,
			 	        'title': 'You are here',
			 	        'animation': google.maps.Animation.DROP,
			 	        'icon': blueIcon,
			 	   		'bounds': false
			 	   	});*/
		 	   		
	 	   			$('input:checkbox').click(function() {
						$('#map_canvas1').gmap('closeInfoWindow');
						$('#map_canvas1').gmap('set', 'bounds', null);
						var filters = [];
						$('input:checkbox:checked').each(function(i, checkbox) {
							console.log($(checkbox).val());
							filters.push($(checkbox).val());
						});
						filters.push('2');
						if ( filters.length > 0 ) {
							console.log('getting markers for: ' + filters);
							$('#map_canvas1').gmap('find', 'markers', { 'property': 'userType', 'value': filters, 'operator': 'OR'}, function(marker, found) {
								marker.setVisible(found); 
							});
						} else {
							/*$.each($('#map_canvas1').gmap('get', 'markers'), function(i, marker) {
								console.log("marker.userType: " + marker.userType);
								if ()
								marker.setVisible(false); 
							});*/
							$('#map_canvas1').gmap('find', 'markers', { 'property': 'userType', 'value': filters, 'operator': 'OR'}, function(marker, found) {
								if (marker.userType == '2') {
									marker.setVisible(true);
								}
								else {
									marker.setVisible(false); 	
								}
								
							});
						}
					});
 	   			});
 	   			
 	   			
 	   		},
 	   		error: function(){
 	   			console.log("failure");
 	   			// TODO: goto index.html when error occurs
 	   		}
 	   	});
    	
	   	
    });
	
}

function showPopup(m,ut,attr) {
	console.log(m);
	console.log(ut);
	var e = m.email;
	var nickname = e.substring(0,e.indexOf('@'));
	$('#popupMapTitle').html(nickname);
	
	icon = (ut.type == 0) ? 'buyer_marker.png' : 'seller_marker.png';
	//alert(icon);
	$('#popupMapIcon').html('<img src="images/'+icon+'" height="32" width="32"/>');
	if (attr != null) {
		var message = null;
		var plural = (attr.value == 1) ? " ticket" : " tickets";
		if (ut.type == 0) {
			message = "I am looking for " + attr.value + plural;
		}
		else {
			message = "I am selling " + attr.value + plural;		
		}
		selectedUserMessage = message;
		$('#popupMapMessage').html(message);
	}
	selectedUserPhoneNumber = m.phone_number;

	$('#popupMap').popup('open');
}

function setPlaces(place,id) {
	var content = '<div style="width:16px;float:left;margin-top:6px;"><img src="'+place.icon+'" height="16" width="16"/></div>'+
			'<div style="float:left;margin-top:5px;padding-left:10px;font-size:14px;">'+place.name+'</div>'+
			'<div style="float:right;height:18px;width:18px;padding-top:5px;"><img src="images/arrow_rt.png"/></div>';
	localStorage.setItem(id, JSON.stringify(place));
	$(id).html(content);
}

function setupCheckmarks(type) {
	$('#'+type+'Place1').click(function() {
		rawData = localStorage.getItem("#"+type+"Place1");
	    // Data parsed here as it was stringified before saving
	    t = JSON.parse(rawData);
	    curPlace.id = t.id;
	    curPlace.name = t.name;
	    curPlace.location = t.geometry.location;
	    curPlace.icon = t.icon;
	    console.log(curPlace);
	    if (type == 'buyer') {
	    	$.mobile.changePage( "ticket-request.html", { transition: "slide"} );	
	    }
	    else {
	    	$.mobile.changePage( "ticket-seller.html", { transition: "slide"} );
	    }
		
  	});
	$('#'+type+'Place2').click(function() {
		rawData = localStorage.getItem("#"+type+"Place2");
	    // Data parsed here as it was stringified before saving
	    t = JSON.parse(rawData);
	    curPlace.id = t.id;
	    curPlace.name = t.name;
	    curPlace.location = t.geometry.location;
	    curPlace.icon = t.icon;
	    console.log(curPlace);
	    if (type == 'buyer') {
	    	$.mobile.changePage( "ticket-request.html", { transition: "slide"} );	
	    }
	    else {
	    	$.mobile.changePage( "ticket-seller.html", { transition: "slide"} );
	    }
  	});
	$('#'+type+'Place3').click(function() {
		rawData = localStorage.getItem("#"+type+"Place3");
	    // Data parsed here as it was stringified before saving
	    t = JSON.parse(rawData);
	    curPlace.id = t.id;
	    curPlace.name = t.name;
	    curPlace.location = t.geometry.location;
	    curPlace.icon = t.icon;
	    console.log(curPlace);
	    if (type == 'buyer') {
	    	$.mobile.changePage( "ticket-request.html", { transition: "slide"} );	
	    }
	    else {
	    	$.mobile.changePage( "ticket-seller.html", { transition: "slide"} );
	    }
  	});
	
}

var ComposeSMSWithCallback = function(phone_number, message){
	console.log('in ComposeSMSWithCallback' + phone_number);
	window.plugins.smsComposer.showSMSComposerWithCB(myCallback,phone_number, message);
	//alert('past showComposer call');
};

var myCallback = function(result){
	//alert('in myCallback');
	$('#popupMap').popup('close');
	if(result == 0)
		console.log("Cancelled");
	else if(result == 1)
		console.log("Sent");
	else if(result == 2)
		console.log("Failed.");
	else if(result == 3)
		console.log("Not Sent.");		
};
