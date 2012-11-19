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
