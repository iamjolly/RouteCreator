
// Global variable to hold the route creator object
var routeCreator = null;

// Method: externalLinks
// Inputs: None.
// Outputs: None
function externalLinks() 
{
	// Check to see if the function getElementsByTagName exists
	if (!document.getElementsByTagName) 
	{
		return;
	}
	
	// Get a list of anchor tags
	var anchors = document.getElementsByTagName("a");
 
	// Loop through the list of anchor tags
	for (var i=0; i<anchors.length; i++) 
	{
		// Get a reference to the anchor tag
		var anchor = anchors[i];
		
		// Check if the href attribute exists and if the rel attribute is set to external
		if (anchor.getAttribute("href") && anchor.getAttribute("rel") == "external")
		{
			// Set the target of the anchor to open a new page
			anchor.target = "_blank";
		}
	}
}

// Method: addLoadEvent
// Inputs: func - The function to add to the list of functions to run upon the document loading
// Outputs: None
function addLoadEvent(func) 
{
	// Get the old onload function (if any)
	var oldonload = window.onload;
	
	// Check the type of the window.onload variable
	if (typeof window.onload != 'function') 
	{
		// If it is not a function, set it to the function we want to add to the list
		window.onload = func;
	} 
	else 
	{
		// If it is a function, set it to a new function
		window.onload = function() 
		{
			// if the old onload variable is set
			if (oldonload) 
			{
				// Call it
				oldonload();
			}
			
			// Call the new function
			func();
		}
	}
}

// Add the external links function to the list of functions to call on the document
addLoadEvent(externalLinks);

			
// Method: init
// Inputs: location - The starting location of the map
// Outputs: None
function init(location)
{
	// The settings to use for the RotueCreator object
	var mapElement = "mapCanvas";
	var distanceElement = "routeDistance";
	var startingLocation = location;
	var elevationPage = "http://route.rainydaycommunications.net/getAltitude.php";
	
	

	// Make sure that the browser is compatible with the Google Maps API
	if (GBrowserIsCompatible()) 
	{
		// Create the route creator
		routeCreator = new RouteCreator(mapElement, distanceElement, startingLocation, elevationPage);
		
		// Enable following roads
		routeCreator.enableFollowingRoads();
		
		// Disable the metric system
		routeCreator.disableMetricSystem();
	}
	else
	{
		// If the browser is not compatible, disable an error message
		$("mapElement").innerHTML = "Google Maps is not supported by your browser";
	}
	
	// Enable the follow roads checkbox
	$('followRoadsCheckbox').checked = true;
	
	// Disable the metric system checkbox
	$('metricSystemCheckbox').checked = false;
	
	// Set the address search box element text
	$('addressSearchBox').value = "Search for an address...";
	
	// Set the target of the form used for submitting the data to the php generation page
	$('submitRouteForm').target = "_blank";
	
	// Enter a default ride name in the route name textbox
	$('routeNameTextBox').value = getDateAsString() + " Ride";
}

// Method: getStartingLocation
// Inputs: None
// Outputs: None
function getStartingLocation()
{
	// Create a flag that indicates if there is a starting location or not
	var startingLocation = false;
	
	// Create variables to hold the latitude and longitude
	var latitude = "37.421972";
	var longitude = "-122.084143";
	
	// Get the starting location cookie
	var startingCoordinates = getCookie("startingLocation");

	// Check to see if the starting location cookie exists
	if (startingCoordinates != "")
	{
		// If the starting location cookie exists, split it into individual coordinates
		var tempArray = startingCoordinates.split(",",2);
		
		// Check to make sure the coordinates exist
		if ( (tempArray.length == 2) && (tempArray[0] != "") && (tempArray[1] != "") )
		{
			// If everything seems fine, get the latitude and longitude
			latitude = tempArray[0];
			longitude = tempArray[1];
			startingLocation = true;
		}
		else
		{
			// If there was a problem with the coordinates in the cookie, clear out the value so that the user will be prompted for a starting location
			startingLocation = false;
		}
	}
	
	// Check to see if we need to ask the user for a starting location
	if (!startingLocation)
	{
		// If the starting location cookie doesn't exist or is empty
		// Prompt the user for a starting address
		var address = prompt("Please enter a starting location:");
		
		// Check to see if the user entered an address
		if (address == null)
		{
			// If the user didn't enter anything, call the init function with the default coordinates
			init(new GLatLng(latitude, longitude));
		}
		else
		{
			// If the user did enter an address, create a geocoder and lookup the coordinates
			var locationSearch = new GClientGeocoder();
			locationSearch.getLocations( address, startingLocationSearchResults );
		}
	}
	
	// Check to see if we have a starting location
	if (startingLocation)
	{
		//  If the start location does exist, call the init function
		init(new GLatLng(latitude, longitude));
	}
	
}

// Method: getStartingLocation
// Inputs: results - The GeoCoder search results
// Outputs: None
function startingLocationSearchResults(results)
{
	// Create variables to hold the latitude and longitude
	var latitude = "37.421972";
	var longitude = "-122.084143";
	
	// Check the status of the location search
	if (results.Status.code == G_GEO_SUCCESS)
	{
		// If the search was successful, get the location
		var locationCoords = results.Placemark[0].Point.coordinates;
		
		// Get the coordinates
		latitude = locationCoords[1];
		longitude = locationCoords[0];
		
		// Save the coordinates as a cookie
		setCookie("startingLocation", latitude+","+longitude, 30);
	}
	else
	{
		// If the search failed, log the error
		GLog.write("Find location failed.  Location: " + results.name + " Code: " + results.Status.code);
	}
	
	// Call the init function with the coordinates
	init( new GLatLng(latitude, longitude) );
}
	
// Method: clickAddressSearchBox
// Inputs: None
// Outputs: None	
function clickAddressSearchBox()
{
	// Get a reference to the address search box element
	var box = $('addressSearchBox');

	// Check to see if the default text is in the box
	if (box.value == "Search for an address...")
	{
		// If it is, clear the value
		box.value = "";
	}
}

// Method: keyPressAddressSearchBox
// Inputs: event - The key press event
// Outputs: None	
function keyPressAddressSearchBox(event)
{
	// Create a variable to hold the key code
	var keynum = 0;
	
	// Check what browser capability we have
	if(window.event) // IE
	{
		// The IE method
		keynum = event.keyCode;
	}
	else if(event.which) // Netscape/Firefox/Opera
	{
		// The firefox/opera method
		keynum = event.which;
	}
	
	// Check to see if the enter key was pressed
	if (keynum == 13)
	{
		// If the enter key was pressed, call the same function 
		// that gets called when the search button gets clicked
		clickAddressSearchButton();
	}
}

// Method: clickAddressSearchButton
// Inputs: None
// Outputs: None
function clickAddressSearchButton()
{	
	// Get a reference to the address search box element
	var box = $('addressSearchBox');
	
	// check to make sure the box is not empty
	if (box.value != "")
	{
		// Search for the specified location
		routeCreator.searchForLocation(box.value);
	}
}

// Method: clickLoopRouteButton
// Inputs: None
// Outputs: None
function clickLoopRouteButton()
{
	// Get the route from the end of the route to the start of the route
	routeCreator.returnToStart();
}


function clickOutAndBackButton()
{
	alert("Out and Back!");
	routeCreator.returnAlongPath();
}

function clickEndRouteButton()
{
	alert("Clicked End Route Button");
}
	
// Method: clickUndoRouteButton
// Inputs: None
// Outputs: None	
function clickUndoRouteButton()
{
	// Remove the last added route chunk from the route
	routeCreator.removeLastRouteChunk();
}

// Method: clickClearRouteButton
// Inputs: None
// Outputs: None	
function clickClearRouteButton()
{
	// Ask the user if they want to clear all route data
	var okToClear = confirm("Do you wish to clear all route data?");
	
	// Check to see if they said it is ok
	if (okToClear)
	{
		// If it is, remove all route data from the route creator
		routeCreator.removeAllRouteChunks();
	}
}

function changeMilestoneMarkerSelectBox()
{
	alert("Changed Milestone Marker Select Box");
}

// Method: clickFollowRoadsCheckBox
// Inputs: None
// Outputs: None	
function clickFollowRoadsCheckBox()
{
	// Enable or disable following roads based on the state of the checkbox
	routeCreator.enableFollowingRoads($('followRoadsCheckbox').checked);
}

// Method: clickMetricSystemCheckBox
// Inputs: None
// Outputs: None	
function clickMetricSystemCheckBox()
{
	// Enable or disable the metric system based on the state of the checkbox
	routeCreator.enableMetricSystem($('metricSystemCheckbox').checked);
}

function clickAutoEndCheckBox()
{
	alert("Clicked Auto End Check Box");
}

// Method: clickSaveRouteButton
// Inputs: None
// Outputs: None
function clickSaveRouteButton()
{
	// Get the ride name
	var rideName = $('routeNameTextBox').value;
	
	// Check to see if the ride name is empty
	if (rideName.length == 0)
	{	
		// Get the default name
		var defaultName = getDateAsString() + " Ride";
		
		// Get a name for the ride
		rideName = prompt("Please enter a name for the ride:", defaultName);
	}
	
	// Get a reference to the save route tpye select box
	var selectBox = $('saveRouteSelectBox');
	
	// Get the file type
	var fileType = selectBox.options[selectBox.selectedIndex].value;
	
	// Check to see if the file type is a TCX
	if (fileType == "tcx")
	{
		// Create a variable to hold the rate unit
		var units = "mph";

		// Check to see if we are using the metric system
		if ($('saveRouteSelectBox').checked)
		{
			// If we are, set the rate units to be metric
			units = "kph";
		}
		
		// Prompt the user for the pace
		var pace = prompt("Please enter your desired pace ("+units+"):",10);
		
		// Check to see if the user cancelled the transaction
		if (pace == null)
		{
			// If the user pressed the cancel button,  do not save the file
			return;
		}
		
		// Convert the pace into meters per second based on whether we are using metric units or not
		if ($('saveRouteSelectBox').checked)
		{
			// Convert from kilometers per hour to meters per second
			pace = pace * 1000 / 3600;
		}
		else
		{
			// Convert from miles per hour to meters per second
			pace = pace * 1609.344 / 3600;
		}
		
		// Create a variable to hold the total time of the route in seconds
		var timeOfRoute = 0;
		
		// check to make sure the pace is a positve number
		if (pace > 0)
		{
			// Now calculate the total time it will take to travel the route
			timeOfRoute = routeCreator.distanceInMeters / pace;
		}
		
		// Set the route time
		routeCreator.setRouteTime(timeOfRoute);
	}

	// Save the route and get the route data string
	var routeData = routeCreator.saveRoute(rideName, $('routeDescriptionTextBox').value, fileType);
	
	// Check to see if the route data string is not empty
	if (routeData.length > 0)
	{
		// Save the route data to the data field
	    $('routeData').value = routeData;
	            
		// Submit the form
	    $('submitRouteForm').submit();  
	}
	else
	{
		// If the string is empty, alert the user there is no map data
		alert("Error: No route created.");
	}
}

// Method: getDateAsString
// Inputs: None
// Outputs: A string containing the date in mm-dd-yyyy format	
function getDateAsString()
{
	// GCreate a date object
	var d = new Date();
	
	// Get the month number and add one so that is 1-12 instead of 0-11, and convert it to a string
	var month = (d.getMonth()+1)+"";
	
	//  Check to see if the month is a single digit
	if (month.length == 1)
	{
		// If it is a signle digit, append a zero to the front
		month = "0" + month;
	}
	
	// Get the day of the month
	var day = d.getDate();
	
	// Get the full year
	var year = d.getFullYear();
	
	// Create the date string
	var dateString = month + "-" + day + "-" + year;
	
	// Return the date string
	return dateString;
}

