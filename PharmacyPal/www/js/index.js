var SERVER_PROTOCOL = "http://";
var SERVER_JSON = "dev.mypharmacypal.com";
var userPref = new userPreference();
var prescriptionNum = null;
var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
    	console.log("Device Ready");
    	
    
		console.log("in redir");
		if (userPref.userid == null) {
			$.mobile.changePage( "signin.html", { transition: "fade"} );
		}
		else {
			$.mobile.changePage( "home.html", { transition: "fade"} );	
		}
		
 	    $('#scanBarcodePage').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 	    	console.log("Displaying scan page");
 	    	$('#scanBarcode').click(function(){
 	    		window.plugins.barcodeScanner.scan(
    		        function(result) {
    		            if (result.cancelled)
    		                console.log("the user cancelled the scan");
    		            else {
    		                console.log("we got a barcode: " + result.text);
    		                $.mobile.changePage( "prescription_add.html", { transition: "fade"} );
    		                prescriptionNum = result.text;

    		            }
    		        },
    		        function(error) {
    		            console.log("scanning failed: " + error);
    		        }
    		    );

 	    	});
 	    	console.log("completed scan");
	    });
 	    
 	   $('#prescriptionAdd').live('pageshow', function(event) {
 		   if (prescriptionNum != null) {
 			   $('#prescription_num').val(prescriptionNum);
 			   prescriptionNum = null;
 		   }
 	   });
 	   
 	   $('#register').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
 		   createUser();
	   });
	    
	   $('#signin').live('pageshow', function(event) {   //Workaround to show page loading on initial page load	
		   signIn();
	   });
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

function userPreference() {
	this.userid = null;
	this.license = 0;
	this.location = 0;
	this.tutorial = 0;
	this.push = 0;
	this.sms = 0;
}

function onCreateUserSuccess(data, status)
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

function onCreateUserError(data, status)
{
    // handle an error
	$.mobile.hidePageLoadingMsg();
	
	var e = JSON.parse(data.responseText);
	console.log(data);
	// reset error messages
	$('#emailError').html("");
	$('#passwordError').html("");
	$('#confirmError').html("");
	$('#firstnameError').html("");
	$('#lastnameError').html("");
	
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
	if (e.User_firstname) {
		var message = JSON.stringify(e.User_firstname);
		$('#firstnameError').html(message);
	}
	if (e.User_lastname) {
		var message = JSON.stringify(e.User_lastname);
		$('#lastnameError').html(message);
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
		url: 'http://' + SERVER_JSON + '/user/serviceJSON',
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
            url: "http://" + SERVER_JSON + "/user/create",
            cache: false,
            data: formData,
            dataType: 'json',
            success: onCreateUserSuccess,
            error: onCreateUserError
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
            url: "http://" + SERVER_JSON + "/site/login",
            cache: false,
            data: formData,
            dataType: 'json',
            success: onSigninSuccess,
            error: onSigninError
        });

        return false;
    });
	

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
