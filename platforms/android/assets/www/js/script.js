// JavaScript Document
var pages = [];			//list of data-role pages
var links = [];			//list of data-role links
var numLinks =0;
var numPages = 0;
var currentPage = null;
//events
var pageshow = document.createEvent("Event");
pageshow.initEvent("pageshow", true, true);

var pagehide = document.createEvent("Event");
pagehide.initEvent("pagehide", true, true);

var tap = document.createEvent("Event");
tap.initEvent("tap", true, true);

window.addEventListener("DOMContentLoaded", init);

function init() {
	
	document.addEventListener("deviceready", setUpApp);
	//setUpApp();
}

function setUpApp() {
	pages = document.querySelectorAll('[data-role="page"]');
	numPages = pages.length;
	
	links = document.querySelectorAll('[data-role="link"]');
	numLinks = links.length;
	
	
	//hijack the links here
  for(var lnk=0; lnk<numLinks;lnk++ ){
	if( detectTouchSupport() ){
		links[lnk].addEventListener("touchend", handleTouchEnd); 
		links[lnk].addEventListener("tap", handleLinkClick);	//our custom event
	}else{
    	links[lnk].addEventListener("click", handleLinkClick); 
	}
  }
  
  //add our pageshow events
  document.querySelector("#cell").addEventListener("pageshow", showPageOne);
  document.querySelector("#map").addEventListener("pageshow", showPageTwo);
  document.querySelector("#past").addEventListener("pageshow", showPageThree);
  console.log("pageshow added");
  
  //add page hide events
  document.querySelector("#cell").addEventListener("pagehide", hidePageOne);
  document.querySelector("#map").addEventListener("pagehide", hidePageTwo);
  document.querySelector("#past").addEventListener("pagehide", hidePageThree);
  
  window.addEventListener('shake', shakeEventDidOccur, false);
  
  currentPage = "cell";
  
  	//check for local storage
	if(localStorage.getItem("location") == null){
		setUpLocalLocation();
	}else {
		listLocation();
	}
	
	//check for call storage
	if(localStorage.getItem("call") == null){
		setUpLocalCall();
	}else {
		listCall();
	}
}
function setUpLocalLocation() {
	if(navigator.geolocation) {
		var params = {enableHighAccuracy: true, timeout:360000, maximumAge:0};
		navigator.geolocation.getCurrentPosition(firstLocal, gpsError, params);
	}
}

function setUpLocalCall() {
	localStorage.setItem("call", "555-555-5555");
}

function firstLocal(position) {
	var setLat = position.coords.latitude;
	var setLong = position.coords.longitude;
	var setLat = position.coords.latitude;
	var setLong = position.coords.longitude;
	var latLong = setLat + "|" + setLong;
	
	localStorage.setItem("location", latLong);
}

function listLocation(){
	var myList = localStorage.getItem("location");
	var breakList= myList.split("&");
	//create the UL
	for(i=0; i<breakList.length; i++){
		var parts = breakList[i].split("|");
		document.querySelector("#storageList").innerHTML += '<li class="locItems">' + parts + '</li>';
	}
}

function listCall(){
	var myList = localStorage.getItem("call");
	var breakList= myList.split("&");
	//create the UL
	for(i=0; i<breakList.length; i++){
		var parts = breakList[i];
		document.querySelector("#callList").innerHTML += '<li class="locItems">' + parts + '</li>';
	}
}

function handleTouchEnd(ev){
	//pass the touchend event directly to a click event
	ev.preventDefault();
	var target = ev.currentTarget;	
	target.dispatchEvent( tap );
	//this will send a click event from the touched tab to 
}

function handleLinkClick(ev){
	ev.preventDefault( );
	var href = ev.currentTarget.href;
	var parts = href.split("#");
	var id = "#" + parts[1];
	
	document.querySelector("#" + currentPage).dispatchEvent(pagehide);
	document.querySelector(id).dispatchEvent(pageshow);
	
	currentPage = parts[1];
}

function showPageOne() {
	//add event listner for shake
	document.querySelector("#cell").className = "active";
	document.querySelector("#callTab").className = "activetab";
	
	window.addEventListener('shake', shakeEventDidOccur, false);
	shake.startWatch(shakeEventDidOccur);
}

function showPageTwo() {
	document.querySelector("#map").className = "active";
	document.querySelector("#mapTab").className = "activetab";
	
	selectZoom();
}

function showPageThree() {
	document.querySelector("#past").className = "active";
	document.querySelector("#pastTab").className = "activetab";
}

function hidePageOne() {
	//remove event listener for shake
	document.querySelector("#cell").className = "";
	document.querySelector("#callTab").className = "";
	
	window.removeEventListener('shake', shakeEventDidOccur, false);
	shake.stopWatch();
}

function hidePageTwo() {
	document.querySelector("#map").className = "";
	document.querySelector("#mapTab").className = "";
}

function hidePageThree() {
	document.querySelector("#past").className = "";
	document.querySelector("#pastTab").className = "";
}

//click events on zoom buttons
function selectZoom() {
	document.querySelector("#zoom14").addEventListener("click", zoom14);
	document.querySelector("#zoom15").addEventListener("click", zoom15);
	document.querySelector("#zoom16").addEventListener("click", zoom16);
}

//handle gps
function zoom14(position) {
	navigator.geolocation.getCurrentPosition(selZoom14, gpsError);
}

function zoom15(position) {
	navigator.geolocation.getCurrentPosition(selZoom15, gpsError);	
}

function zoom16(positon) {
	navigator.geolocation.getCurrentPosition(selZoom16, gpsError);
}

//send gps data here, work with google maps based on zoom
function selZoom14(position) {
	var latitude =  position.coords.latitude;
	var longitude = position.coords.longitude;
	var altitude = position.coords.altitude;
	var accuracy = position.coords.accuracy;
	var myLatLng = new google.maps.LatLng(latitude,longitude);
	
	var mapOptions ={
          center:new google.maps.LatLng(latitude,longitude),
          zoom:14,
		  zoomControl: false,
		  scrollwheel: false,
		  draggable: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
	var map =new google.maps.Map(document.getElementById("googleMap"), mapOptions);
	
	var marker = new google.maps.Marker({
      position: myLatLng,
	  icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      map: map,
	  title: 'You are Here!'
  });
 	
	//set random marker
	google.maps.event.addListener(map, 'bounds_changed', function() {
         var bounds =  map.getBounds();
         var neLat = bounds.getNorthEast().lat();
		 var neLng = bounds.getNorthEast().lng();
         var swLat = bounds.getSouthWest().lat();
		 var swLng = bounds.getSouthWest().lng();
		 
		 var eastWestRange = Math.abs(Math.abs(neLng) - Math.abs(swLng));
		 var northSouthRange = Math.abs(Math.abs(neLat) - Math.abs(swLat));
		 
		 var randomLat = (Math.random() * northSouthRange ) ;
		 randomLat += Math.min(neLat, swLat);
		 var randomLng = (Math.random() * eastWestRange ) ;
	 	 randomLng += Math.min(neLng, swLng);
		 
		 document.getElementById("storageList").innerHTML += ('<li class="locItems">' + randomLat + "," + randomLng + '</li>');
		 
		 var marker = new google.maps.Marker({
      	 	position: new google.maps.LatLng(randomLat,randomLng),
			icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      	 	map: map,
	  	 	title: 'Go Here!'
  		 });
		 setLocalStorage(randomLat, randomLng);
	});
}

function selZoom15(position) {
	var latitude =  position.coords.latitude;
	var longitude = position.coords.longitude;
	var altitude = position.coords.altitude;
	var accuracy = position.coords.accuracy;
	var myLatLng = new google.maps.LatLng(latitude,longitude);
	
	var mapOptions ={
          center:new google.maps.LatLng(latitude,longitude),
          zoom:15,
		  zoomControl: false,
		  scrollwheel: false,
		  draggable: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
	var map =new google.maps.Map(document.getElementById("googleMap"), mapOptions);
	
	var marker = new google.maps.Marker({
      position: myLatLng,
	  icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      map: map,
      title: 'You are Here!'
  });
  
  //set random marker
	google.maps.event.addListener(map, 'bounds_changed', function() {
         var bounds =  map.getBounds();
         var neLat = bounds.getNorthEast().lat();
		 var neLng = bounds.getNorthEast().lng();
         var swLat = bounds.getSouthWest().lat();
		 var swLng = bounds.getSouthWest().lng();
		 
		 var eastWestRange = Math.abs(Math.abs(neLng) - Math.abs(swLng));
		 var northSouthRange = Math.abs(Math.abs(neLat) - Math.abs(swLat));
		 
		 var randomLat = (Math.random() * northSouthRange ) ;
		 randomLat += Math.min(neLat, swLat);
		 var randomLng = (Math.random() * eastWestRange ) ;
	 	 randomLng += Math.min(neLng, swLng);
		 
		 document.getElementById("storageList").innerHTML += ('<li class="locItems">' + randomLat + "," + randomLng + '</li>');
		 
		 var marker = new google.maps.Marker({
      	 	position: new google.maps.LatLng(randomLat,randomLng),
			icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      	 	map: map,
	  	 	title: 'Go Here!'
  		 });
		 setLocalStorage(randomLat, randomLng);
	});
}

function selZoom16(position) {
	var latitude =  position.coords.latitude;
	var longitude = position.coords.longitude;
	var altitude = position.coords.altitude;
	var accuracy = position.coords.accuracy;
	var myLatLng = new google.maps.LatLng(latitude,longitude);

	var mapOptions ={
          center:new google.maps.LatLng(latitude,longitude),
          zoom:16,
		  zoomControl: false,
		  scrollwheel: false,
		  draggable: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
	var map =new google.maps.Map(document.getElementById("googleMap"), mapOptions);
	
	var marker = new google.maps.Marker({
      position: myLatLng,
	  icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      map: map,
      title: 'You are Here!'
   });
  
  //set random marker
	google.maps.event.addListener(map, 'bounds_changed', function() {
         var bounds =  map.getBounds();
         var neLat = bounds.getNorthEast().lat();
		 var neLng = bounds.getNorthEast().lng();
         var swLat = bounds.getSouthWest().lat();
		 var swLng = bounds.getSouthWest().lng();
		 
		 var eastWestRange = Math.abs(Math.abs(neLng) - Math.abs(swLng));
		 var northSouthRange = Math.abs(Math.abs(neLat) - Math.abs(swLat));
		 
		 var randomLat = (Math.random() * northSouthRange ) ;
		 randomLat += Math.min(neLat, swLat);
		 var randomLng = (Math.random() * eastWestRange ) ;
	 	 randomLng += Math.min(neLng, swLng);
		 
		 document.getElementById("storageList").innerHTML += ('<li class="locItems">' + randomLat + "," + randomLng + '</li>');
		 
		 var marker = new google.maps.Marker({
      	 	position: new google.maps.LatLng(randomLat,randomLng),
			icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      	 	map: map,
	  	 	title: 'Go Here!'
  		 });
		 
		 setLocalStorage(randomLat, randomLng);
	});
}

function setLocalStorage(passLat, passLng) {
	var latitude = passLat
	var longitude = passLng
	
	var oldValue = localStorage.getItem("location");
	oldValue = oldValue + "&" + latitude + "|" + longitude;
	localStorage.setItem("location", oldValue);
}

function gpsError(ev) {
	alert(ev.message)
}

//function to call when shake occurs
function shakeEventDidOccur () {
	//alert("yay");
	var options = new ContactFindOptions( );
	options.filter = "";  //leaving this empty will find return all contacts
	options.multiple = true;  //return multiple results	
	var filter = ["phoneNumbers"];    //an array of fields to compare against the options.filter 
	navigator.contacts.find(filter, successFunc, errFunc, options);
}

function successFunc(matches) {
	//alert(matches.length);
	var phonenumbers = new Array();
	
	for( var i=0; i<matches.length; i++){
		//alert( matches[i].phoneNumbers[0].value );
		if(matches[i].phoneNumbers) {
			phonenumbers[i] = matches[i].phoneNumbers[0].value;
		}
	}	
	//alert(phonenumbers);
	
	var randomNumber = Math.floor((Math.random()*phonenumbers.length)+0); 
	//alert(randomNumber);
	var randomPhone = phonenumbers[randomNumber];
	//alert(randomPhone);
	
	//This calls people!
	document.location.href = 'tel:+' + randomPhone + '';
	
	document.getElementById("callList").innerHTML += ('<li class="locItems">' + randomPhone + '</li>');
	
	setLocalCall(randomPhone);
}

function setLocalCall(passNumber) {
	var phoneNumber = passNumber;
	
	var oldValue = localStorage.getItem("call");
	oldValue = oldValue + "&" + phoneNumber;
	localStorage.setItem("call", oldValue);
}

function errFunc () {
	alert("Error reading contacts!");
}

function detectTouchSupport( ){
  msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
  touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
  return touchSupport;
}
