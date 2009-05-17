
// Global variable to hold the route creator object
var routeCreator = null;
			
// Method: init
// Inputs: mapElement - The DOM id of the element that will display the map
//	      distanceElement - The DOM id of the element that will display the distance
// 	      startingLocation -  A GLatLng point that indicates where the map should be initialy centered at
// Outputs: None
function init(mapElement, distanceElement, startingLocation)
{
	// Make sure that the browser is compatible with the Google Maps API
	if (GBrowserIsCompatible()) 
	{
		// Create the route creator
		routeCreator = new RouteCreator(mapElement, distanceElement, startingLocation);
		
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