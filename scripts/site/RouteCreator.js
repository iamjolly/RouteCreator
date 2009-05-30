// 
// RouteCreator.js v0.1 04/05/2009
//
// Copyright (c)  2009 Ian Ferguson (http://if.rainydaycommunications.net)
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

RouteCreator = Class.create(
{
    // Method: Constructor
    // Inputs: mapElement - The DOM id of the element that will display the map
    //        distanceElement - The DOM id of the element that will display the distance
    //        startingLocation -  A GLatLng point that indicates where the map should be initialy centered at
    // Outputs: None
    initialize: function(mapElement, distanceElement, startingLocation)
    {
        // Make sure that the browser is compatible with the Google Maps API
        if (GBrowserIsCompatible()) 
        {
            // The overall map object
            this.map = null;
    
            // The route directions object
            this.routeDirections = null;
            
            // The location search object
            this.locationSearch = null;
            
            // A flag that indicates if the route should follow roads
            this.followRoads = true;
            
            // A flag that indicates if the route should use metric units
            this.useMetricSystem = false;
    
            // The distance of the route
            this.distanceInMeters = 0;
			
			// The total time of the route
			this.timeInSeconds = 0;
            
            // A reference to the distance element
            this.distanceDisplay = $(distanceElement);
			
			// A count of outstanding elevation data sets
			this.elevationCount = 0;
    
            // A list of route chunks that have been mapped
            this.routeChunkList = [];

            // Create variables to hold the icons
            this.iconStart = null;
            this.iconEnd = null;
            this.iconMilestone = null;
            this.iconLocation = null;   
            
			// Create variables to hold the markers
            this.markerStart = null;
            this.markerEnd = null;
            this.markerLocation = null;
			
			// Create the icons for use with custom markers
            this.initCustomIcons();
            
            // Create the google map control object
            this.buildMapControl(mapElement, startingLocation);
    
            // Initialize the event handlers
            this.initEventHandlers();
            
            // Update the distance display
            this.updateDistanceDisplay();
        }
    },
    
    // Method: buildMapControl
    // Inputs: mapElement - The DOM id of the element that will display the map
    //        startingLocation -  A GLatLng point that indicates where the map should be initialy centered at
    // Outputs: None
    buildMapControl: function(mapElement, startingLocation)
    {
        // Make sure that the browser is compatible with the Google Maps API
        if (GBrowserIsCompatible()) 
        {
            // Create a variable to hold the default zoom level
            var defaultZoomLevel = 15;
            
            // Create the map object
            this.map = new GMap2( $(mapElement) );
            
            // Set up the available make types
            this.map.addMapType(G_NORMAL_MAP);
            this.map.addMapType(G_SATELLITE_MAP);
            this.map.addMapType(G_HYBRID_MAP);
            this.map.addMapType(G_PHYSICAL_MAP);

            // Enable map dragging
            this.map.enableDragging();
            
            // Enable zoom in/out via double clicking
            this.map.enableDoubleClickZoom();
            
            // Disable continuous zoom
            this.map.disableContinuousZoom();
            
            // Disable the google bar
            this.map.disableGoogleBar();
            
            // Enable scroll wheel zoom in/out
            this.map.enableScrollWheelZoom();
            
            // Enable the info window
            this.map.enableInfoWindow();
            
            // Add the map type control
            this.map.addControl(new GMapTypeControl());
            
            // Add the map location/zoom control
            this.map.addControl(new GLargeMapControl());

            // Add the map scale control
            this.map.addControl(new GScaleControl());
            
            // Add the overview map control
            this.map.addControl(new GOverviewMapControl());
            
            // Set the initial location, zoom level, and type of the map
            this.map.setCenter(startingLocation, defaultZoomLevel, G_NORMAL_MAP);
            
            // Create the route directions object
            this.routeDirections = new GDirections();
            
            // Create the location search object
            this.locationSearch = new GClientGeocoder();
            
            // The location search indicator marker
            this.markerLocation = new GMarker( startingLocation, {icon:this.iconLocation, title:startingLocation.toUrlValue(6), clickable:false, zIndexProcess:this.markerZOrder.bind(this)} );
            
            // Display the new location marker
            this.map.addOverlay( this.markerLocation );
        }
    },

    // Method: initEventHandlers
    // Inputs: None
    // Outputs: None
    initEventHandlers: function()
    {
        // Register the map single click event
        GEvent.addListener(this.map, "click", this.eventMapClick.bind(this));
        
        // Register the route directions loaded event
        GEvent.addListener(this.routeDirections, "load", this.eventRouteDirectionsLoaded.bind(this));
        
        // Register the route directions error event
        GEvent.addListener(this.routeDirections, "error", this.eventRouteDirectionsError.bind(this));
    },

    // Method: initCustomIcons
    // Inputs: None
    // Outputs: None
    initCustomIcons: function()
    {
        // The route start icon
        this.iconStart = new GIcon();
        this.iconStart.image                = "images/start.png";
        this.iconStart.shadow               = "images/start_shadow.png";
        this.iconStart.iconSize             = new GSize(20,34);
        this.iconStart.shadowSize           = new GSize(38,34);
        this.iconStart.iconAnchor           = new GPoint(10,33);
        this.iconStart.infoWindowAnchor     = new GPoint(10,1); 
        this.iconStart.printImage           = "images/start_print_ie.gif";
        this.iconStart.mozPrintImage        = "images/start_print_ff.gif";
        this.iconStart.printShadow          = "images/start_print_shadow.gif";
        this.iconStart.transparent          = "images/start_transparent.png";
        this.iconStart.imageMap             = [6,1, 1,6, 1,13, 8,23, 9,30, 10,30, 11,23, 18,13, 18,6, 13,1];
        this.iconStart.maxHeight            = 5;
        this.iconStart.dragCrossImage       = "";
        this.iconStart.dragCrossSize        = new GSize(0,0);
        this.iconStart.dragCrossAnchor      = new GPoint(0,0); 

        // The route end icon
        this.iconEnd = new GIcon();
        this.iconEnd.image                  = "images/end.png";       
        this.iconEnd.shadow                 = "images/end_shadow.png";
        this.iconEnd.iconSize               = new GSize(20,34);                     
        this.iconEnd.shadowSize             = new GSize(38,34);                     
        this.iconEnd.iconAnchor             = new GPoint(10,33);
        this.iconEnd.infoWindowAnchor       = new GPoint(10,1); 
        this.iconEnd.printImage             = "images/end_print_ie.gif";
        this.iconEnd.mozPrintImage          = "images/end_print_ff.gif";
        this.iconEnd.printShadow            = "images/end_print_shadow.gif";
        this.iconEnd.transparent            = "images/end_transparent.png";
        this.iconEnd.imageMap               = [6,1, 1,6, 1,13, 8,23, 9,30, 10,30, 11,23, 18,13, 18,6, 13,1];
        this.iconEnd.maxHeight              = 5;          
        this.iconEnd.dragCrossImage         = "";  
        this.iconEnd.dragCrossSize          = new GSize(0,0); 
        this.iconEnd.dragCrossAnchor        = new GPoint(0,0); 

        // The route milestone icon
        this.iconMilestone = new GIcon();
        this.iconMilestone.image            = "images/milestone.png";       
        this.iconMilestone.shadow           = "images/milestone_shadow.png";
        this.iconMilestone.iconSize         = new GSize(32,33);                        
        this.iconMilestone.shadowSize       = new GSize(49,32);                        
        this.iconMilestone.iconAnchor       = new GPoint(11,32);
        this.iconMilestone.infoWindowAnchor = new GPoint(7,2); 
        this.iconMilestone.printImage       = "images/milestone_print_ie.gif";
        this.iconMilestone.mozPrintImage    = "images/milestone_print_ff.gif";
        this.iconMilestone.printShadow      = "images/milestone_print_shadow.gif";
        this.iconMilestone.transparent      = "images/milestone_transparent.png";
        this.iconMilestone.imageMap         = [6,2, 5,3, 5,6, 6,12, 7,18, 8,24, 9,29, 10,30, 12,30, 13,29, 13,26, 12,20, 11,19, 11,14, 12,13, 15,14, 20,14, 21,13, 25,12, 26,11, 26,4, 25,3, 20,3, 19,4, 11,4, 9,2];
        this.iconMilestone.maxHeight        = 5;                    
        this.iconMilestone.dragCrossImage   = "";                   
        this.iconMilestone.dragCrossSize    = new GSize(0,0);       
        this.iconMilestone.dragCrossAnchor  = new GPoint(0,0);      

        // The location indicator icon
        this.iconLocation = new GIcon();
        this.iconLocation.image             = "images/arrow.png";       
        this.iconLocation.shadow            = "images/arrow_shadow.png";
        this.iconLocation.iconSize          = new GSize(39,34);                        
        this.iconLocation.shadowSize        = new GSize(57,34);                        
        this.iconLocation.iconAnchor        = new GPoint(10,33);                     
        this.iconLocation.infoWindowAnchor  = new GPoint(10,0);
        this.iconLocation.printImage        = "images/arrow_print_ie.gif";
        this.iconLocation.mozPrintImage     = "images/arrow_print_ff.gif";
        this.iconLocation.printShadow       = "images/arrow_print_shadow.gif";
        this.iconLocation.transparent       = "images/arrow_transparent.png";
        this.iconLocation.imageMap          = [7,0, 7,8, 0,8, 8,21, 10,31, 12,21, 20,8, 13,8, 13,0];
        this.iconLocation.maxHeight         = 5;               
        this.iconLocation.dragCrossImage    = "";              
        this.iconLocation.dragCrossSize     = new GSize(0,0);  
        this.iconLocation.dragCrossAnchor   = new GPoint(0,0); 
    },
    
    // Method: eventMapClick
    // Inputs: overlay - An overall object that was clicked on, otherwise null
    //        position - A GLatLgn object that contains the position that was clicked on
    //        overlayPosition - A GLatLgn object that contains the position of the overlay that was clicked on
    // Outputs: None
    eventMapClick: function(overlay, position, overlayPosition)
    {
        // Check to see if we clicked on an overlay
        if (!overlay)
        {
            // If we did not click on an overlay
            // Check to see if this is the first waypoint we are putting down
            if (this.routeChunkList.size() == 0) 
            {
                // If it is, get directions to itself
                this.routeDirections.loadFromWaypoints( [position.toUrlValue(6),position.toUrlValue(6)], {getPolyline:true} );
            } 
            else 
            {
                // if it isn't the first waypoint, check to see if we are following roads or not
                if (this.followRoads)
                {
                    // If we are following roads, get directions from the last waypoint
                    this.routeDirections.loadFromWaypoints( [this.routeChunkList.last().endPoint.toUrlValue(6),position.toUrlValue(6)], {getPolyline:true} );
                }
                else
                {
                    // If we are not following roads, then we need to do manually create the polyline that represents the route chunk
                    var routePolyline = new GPolyline( [this.routeChunkList.last().endPoint, position] );
                                        
                    // Create a new route chunk
                    var route = new RouteChunk(routePolyline);
                    
                    // Increase the distance of the route
                    this.distanceInMeters += route.distance();
                    
                    // draw the route chunk
                    this.map.addOverlay( route.route );
                    
                    // Update the distance display
                    this.updateDistanceDisplay();
                    
                    // Add the route chunk to the  list
                    this.routeChunkList.push(route);
					
					// Get the elevation data for the new route chunk
					this.getElevationData(this.routeChunkList.length-1);
                }
            }
        }
    },

    // Method: eventRouteDirectionsLoaded
    // Inputs: None
    // Outputs: None
    eventRouteDirectionsLoaded: function()
    {
        // Create the new route chunk and initialize it to the direction line
        var route = new RouteChunk(this.routeDirections.getPolyline());
        
        // Increase the distance of the route
        this.distanceInMeters += route.distance();
        
        // Check to see if this is the first route chunk
        if (this.routeChunkList.size() == 0) 
        {
            // If the new route chunk is the first route chunk, create a start marker and draw it on the map at the starting position of the route chunk
            this.markerStart = new GMarker(route.startPoint, {icon:this.iconStart, title:"Start of Route", clickable:false, zIndexProcess:this.markerZOrder.bind(this)} );
            this.map.addOverlay(this.markerStart);
        } 
        else 
        {
            // If the new route chunk is not the first route chunk, draw the route chunk
            this.map.addOverlay( route.route );
        }
        
        // Update the distance display
        this.updateDistanceDisplay();

        // Add the route chunk to the  list
        this.routeChunkList.push(route);
		
		// Get the elevation data for the new route chunk
		this.getElevationData(this.routeChunkList.length-1);
    },

    // Method: eventRouteDirectionsError
    // Inputs: None
    // Outputs: None
    eventRouteDirectionsError: function()
    {
        GLog.write("Get Route Failed.  Code: " + this.routeDirections.getStatus().code);
    },
    
    // Method: eventLocationSearchResults
    // Inputs: results - the result object from the geocoder
    // Outputs: None
    eventLocationSearchResults: function(results)
    {
        // Check the status of the location search
        if (results.Status.code == G_GEO_SUCCESS)
        {
            // If the search was successful, get the location
            var locationCoords = results.Placemark[0].Point.coordinates;
            
            var locationPoint = new GLatLng(locationCoords[1],locationCoords[0]);
            
            // Remove the previous location marker
            this.map.removeOverlay( this.markerLocation );
        
            // Add the new location marker
            this.markerLocation = new GMarker( locationPoint, {icon:this.iconLocation, title:results.Placemark[0].address, clickable:false, zIndexProcess:this.markerZOrder.bind(this)} );
            
            // Display the new location marker
            this.map.addOverlay( this.markerLocation );
            
            // Go to the location that was found
            this.map.panTo( locationPoint );
        }
        else
        {
            GLog.write("Find location failed.  Location: " + results.name + " Code: " + results.Status.code);
        }
    },
    
    // Method: removeLastRouteChunk
    // Inputs: None
    // Outputs: None
    removeLastRouteChunk: function()
    {
        // Get the last route chunk from the list and remove it from the list
        var route = this.routeChunkList.pop();
        
        // Decrease the total distance of the route by the last route chunk distance
        this.distanceInMeters -= route.distance();
        
        // Check to see if there are any more route chunks in the list besides the start marker
        if (this.routeChunkList.size() <= 1)
        {
            // If there are no other chunks in the list besides the start marker
            // set the distance to zero
            this.distanceInMeters = 0;
        }
        
        // Remove the last route chunk overlay from the map
        this.map.removeOverlay(route.route);
        
        // Check to see if there are no more route chunks in the list
        if (this.routeChunkList.size() == 0)
        {
            // If this route chunk is the last, remove the start marker
            this.map.removeOverlay(this.markerStart);
        }
        
        // Update the distance display
        this.updateDistanceDisplay();
    },
    
    // Method: removeAllRouteChunks
    // Inputs: None
    // Outputs: None
    removeAllRouteChunks: function()
    {
        // Set the distance to zero
        this.distanceInMeters = 0;
    
        // Remove all overlays from the map
        this.map.clearOverlays();
        
        // Remove all route chunks from the list
        this.routeChunkList.clear();
		
		// Clear out the number of outstanding elevation requests
		this.elevationCount = 0;
		
		// Update the elevation display
		this.eventFinishedGettingElevationData();
        
        // Update the distance display
        this.updateDistanceDisplay();
        
        // Re-add the location marker
        this.map.addOverlay(this.markerLocation);
    },
    
    // Method: updateDistanceDisplay
    // Inputs: None
    // Outputs: None
    updateDistanceDisplay: function()
    {
        // Create a variable to hold the distance
        var distance = 0;
        
        // Create a variable to hold the units of the distance
        var units = "";
        
        // Check to see if we should use the metric system
        if (this.useMetricSystem)
        {
            // If we should use the metric system, get the distance in meters
            distance = this.distanceInMeters;
            
            // Set the units to meters
            units = "m";
            
            // Check to see if the distance should be converted into kilometers
            if (distance >= 1000)
            {
                // If the distance is greater than a thousand meters, convert it to kilometers
                distance = distance / 1000;
                
                // Set the units to kilometers
                units = "km";
            }
        }
        else
        {
            // If we should use the customary system, get the distance in feet
            distance = this.distanceInMeters * 3.280839895;
            
            // Set the units to feet
            units = "ft";
            
            // Check to see if the distance should be converted into miles
            if (distance >= 5280)
            {
                // If the distance is greater than five thousand, two hundred and eighty feet, convert it to miles
                distance = distance / 5280;
                
                // Set the units to miles
                units = "mi";
            }
        }
        
        // Round the distance to the nearest tenth's place
        distance = distance.toFixed(1);
        
        // Update the distance display
        this.distanceDisplay.innerHTML = "Distance: " + distance + " " + units;
        
    },
    
    // Method: enableFollowingRoads
    // Inputs: enabled - A flag indicating whether following roads should be enabled
    // Outputs: None
    enableFollowingRoads: function(enabled)
    {
        // Check to see if enabled is true or if the variable is undefined
        if ( (enabled == true) || (typeof(enabled) == 'undefined') )
        {
            // If it is, enable following roads
            this.followRoads = true;
        }
        else
        {
            // If it isn't, disable following roads
            this.followRoads = false;
        }
    },
    
    // Method: disableFollowingRoads
    // Inputs: None
    // Outputs: None
    disableFollowingRoads: function()
    {
        // Disable following roads
        this.enableFollowingRoads(false);
    },
    
    // Method: enableMetricSystem
    // Inputs: enabled - A flag indicating whether the metric system should be enabled
    // Outputs: None
    enableMetricSystem: function(enabled)
    {
        // Check to see if enabled is true or if the variable is undefined
        if ( (enabled == true) || (typeof(enabled) == 'undefined') )
        {
            // If it is, enable the use of the metric system
            this.useMetricSystem  = true;
        }
        else
        {
            // If it isn't, disable the use of the metric system
            this.useMetricSystem  = false;
        }
        
        // Update the distance display
        this.updateDistanceDisplay();
    },
    
    // Method: disableMetricSystem
    // Inputs: None.
    // Outputs: None
    disableMetricSystem: function()
    {
        // Disable the use of the metric system
        this.enableMetricSystem(false);
    },
    
    // Method: returnToStart
    // Inputs: None.
    // Outputs: None
    returnToStart: function()
    {
        // Check to see if we have at least the start point and one route chunk away from it in the list
        if (this.routeChunkList.size() >= 2)
        {
            // If we do have a non trivial route, get the start point of the route and the end point of the last route chunk
            var startPoint = this.routeChunkList.first().startPoint;
            var endPoint = this.routeChunkList.last().endPoint;
            
            // Check to make sure the two points aren't already equal
            if ( !startPoint.equals(endPoint) )
            {
                // Get directions from the end of the current route to the start of the route
                this.routeDirections.loadFromWaypoints( [endPoint.toUrlValue(6),startPoint.toUrlValue(6)], {getPolyline:true} );
            }
        }
    },
    
    // Method: searchForLocation
    // Inputs: location - A string representing the location to search for
    // Outputs: None
    searchForLocation: function(location)
    {
        // Use the location search object to search for this location
        this.locationSearch.getLocations( location, this.eventLocationSearchResults.bind(this) );
    },
	
	// Method: setRouteTime
    // Inputs: seconds - The time of the route in seconds
    // Outputs: None
	setRouteTime: function(seconds)
	{
		// Set the time of the route in seconds
		this.timeInSeconds = seconds;
	},
    
    returnAlongRoute: function()
    {
    },
	
	buildReturnPath: function()
	{
	},
	
	eventReturnPathLoaded: function()
	{
	},
	
	eventReturnPathError: function()
	{
	},
    
    // Method: markerZOrder
    // Inputs: marker - A reference to the marker to retrieve the z order for
    // Outputs: markerZOrder - The Z index to use for the marker
    markerZOrder: function(marker)
    {
        // Create a variable to hold the z index
        var index;
        
        // Get the icon used by the marker
        var markerIcon = marker.getIcon();
        
        // check the marker incon image
        if (markerIcon.image == this.iconStart.image)
        {
            // If it's the start icon, set it to the highest z index
            index = 4;
        }
        else if (markerIcon.image == this.iconEnd.image)
        {
            // If it's the end icon, set it to the second highest z index
            index = 3;
        }
        else if (markerIcon.image == this.iconMilestone.image)
        {
            // If it's the milestone icon, set it to the middle z index
            index = 2;
        }
        else if (markerIcon.image == this.iconLocation.image)
        {
            // If it's the location icon, set it to the lowest z index
            index = 0;
        }
        else
        {
            // If it's anything else, set it to the second lowest index
            index = 1;
        }
        
        // Return the z index
        return index;
    },
	
	getElevationData: function(routeChunkIndex)
	{	
		this.eventGettingElevationData();
		
		var coordinatesJSON = [];
		
		
		var chunk = this.routeChunkList[routeChunkIndex];
		
		
		for (var i = 0; i < chunk.route.getVertexCount(); i++)
		{
			
			var p = chunk.route.getVertex(i);
			
			coordinatesJSON[i] = {};
			coordinatesJSON[i].latitude = p.lat();
			coordinatesJSON[i].longitude = p.lng();
		}
		
		var coordinatesString = JSON.stringify(coordinatesJSON);
		
		GDownloadUrl("http://route.rainydaycommunications.net/getAltitude.php", 
					 function(data, status)
					 {
						if (status == G_GEO_SUCCESS)
						{
							var altitudeArray = JSON.parse(data); 
							chunk.addAltitudeData(altitudeArray);
						}
						else if (status == -1)
						{
							GLog.write("Error: Elevation data request timed out");
						}
						else
						{
							GLog.write("Error: Elevation data request status code " + status);
						}
						
						this.eventFinishedGettingElevationData();
					 }.bind(this), 
					 "coordinates="+coordinatesString); 
	},
	
	eventGettingElevationData: function()
	{
		this.elevationCount += 1;
		
		$("elevationStatus").innerHTML = "Outstanding Elevation Datasets: " + this.elevationCount;
	},
	
	eventFinishedGettingElevationData: function()
	{
		this.elevationCount -= 1;
		
		if (this.elevationCount > 0)
		{
			$("elevationStatus").innerHTML = "Outstanding elevation datasets: " + this.elevationCount;
		}
		else
		{
			$("elevationStatus").innerHTML = "Finished acquiring elevation data.";
		}
	},
    
	// Method: saveRoute
	// Inputs: routeName - The name of the route
	//	        routeDescription - The description of the route
	//	        fileType - The type of file to save the route as
	// Outputs: saveRoute - A JSON string of the route data
    saveRoute: function(routeName, routeDescription, fileType)
    {
		// Create a variable to hold the route data as a JSON string
		var routeString = "";
		
        // Check to make sure there is a route
        if (this.routeChunkList.length > 0)
        {   
            // Create the object to hold the JSON version of the route data
            var routeJSON = {};
            
            // Add the route name
            routeJSON.routeName = routeName;
            
            // Add the route description
            routeJSON.routeDescription = routeDescription;
            
            // Add the file type to generate
            routeJSON.fileType = fileType;
            
            // Create the array to hold the custom icon information
            routeJSON.icons = [];
            
            // Add the start icon
            routeJSON.icons[0] = {};
            routeJSON.icons[0].name = "iconStart";
            routeJSON.icons[0].file = this.iconStart.image;
            routeJSON.icons[0].anchor = {};
            routeJSON.icons[0].anchor.x = this.iconStart.iconAnchor.x;
            routeJSON.icons[0].anchor.y = this.iconStart.iconAnchor.y;
            
            // Add the end icon
            routeJSON.icons[1] = {};
            routeJSON.icons[1].name = "iconEnd";
            routeJSON.icons[1].file = this.iconEnd.image;
            routeJSON.icons[1].anchor = {};
            routeJSON.icons[1].anchor.x = this.iconEnd.iconAnchor.x;
            routeJSON.icons[1].anchor.y = this.iconEnd.iconAnchor.y;
            
            // Add the milestone icon
            routeJSON.icons[2] = {};
            routeJSON.icons[2].name = "iconMilestone";
            routeJSON.icons[2].file = this.iconMilestone.image;
            routeJSON.icons[2].anchor = {};
            routeJSON.icons[2].anchor.x = this.iconMilestone.iconAnchor.x;
            routeJSON.icons[2].anchor.y = this.iconMilestone.iconAnchor.y;
                
            // Create the array to hold the marker information
            routeJSON.markers = [];
            
            // Add the start marker
            routeJSON.markers[0] = {};
            routeJSON.markers[0].name = "Start Marker";
            routeJSON.markers[0].description = "Start of Route";
            routeJSON.markers[0].icon = "iconStart";
            routeJSON.markers[0].coordinate = {};
            routeJSON.markers[0].coordinate.latitude = this.markerStart.getLatLng().lat();
            routeJSON.markers[0].coordinate.longitude = this.markerStart.getLatLng().lng();
            routeJSON.markers[0].coordinate.altitude = this.routeChunkList.first().getStartingAltitude();
            
            // Create the route object
            routeJSON.route = {};
            
            // Add the route name
            routeJSON.route.name = routeName;
            
            // Add the route description
            routeJSON.route.description = routeDescription;

            // Add the total distance of the route
            routeJSON.route.distanceInMeters = this.distanceInMeters;

            // Add the total time of the route
            routeJSON.route.timeInSeconds = this.timeInSeconds;
            
            // Create the array inside the route object to hold the coordinates
            routeJSON.route.coordinates = [];
            
            // Create an index to use to enter coordinates
            var index = 0;
            
            // Create the first coordinate from the start point of the route
            routeJSON.route.coordinates[0] = {};
            routeJSON.route.coordinates[0].latitude = this.routeChunkList.first().startPoint.lat();
            routeJSON.route.coordinates[0].longitude = this.routeChunkList.first().startPoint.lng();
            routeJSON.route.coordinates[0].altitude = this.routeChunkList.first().getStartingAltitude();
			routeJSON.route.coordinates[0].distanceFromLast = 0;
			
			// Create a variable to hold the last GLatLng point
			var lastPoint = this.routeChunkList.first().startPoint;
            
            // Loop through all of the route chunks
            for (var i = 1; i < this.routeChunkList.length; i++)
            {
                // Get the current route chunk
                var chunk = this.routeChunkList[i];
                
                // Loop through all of the vertices starting from the second vertex
                for (var j = 1; j < chunk.route.getVertexCount(); j++)
                {
                    // Get the vertex
                    var p = chunk.route.getVertex(j);
                    
                    // Increment the coordinate index
                    index++;
					
					var altitude = 0;
								
					if (chunk.hasAltitudeData)
					{
						// If the chunk has altitude data, get the altitude of the current vertex
						altitude = chunk.altitude[j];
					}
                    
                    // Add the vertex to the list of coordinates
                    routeJSON.route.coordinates[index] = {};
                    routeJSON.route.coordinates[index].latitude = p.lat();
                    routeJSON.route.coordinates[index].longitude = p.lng();
					
					
					routeJSON.route.coordinates[index].altitude = altitude;
					routeJSON.route.coordinates[index].distanceFromLast = p.distanceFrom(lastPoint);
					
					// Update the last point
					lastPoint = p;
                }
            }
            
            // stringify the JSON object
            routeString = JSON.stringify(routeJSON);
        }
		
		// Return the route string
		return routeString;
    }
});