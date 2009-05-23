// 
// RouteChunk.js v0.1 04/04/2009
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

RouteChunk = Class.create( 
{
	// Method: Constructor
	// Inputs: polyline - A GPolyline object that contains the route from the last waypoint to this waypoint
	// Outputs: None
	initialize: function(polyline)
	{
		// Set the route
		this.route = polyline;
		
		// Initialize the start and end waypoints of this route chunk
		this.startPoint = null;
		this.endPoint = null;
		
		// Create an array to hold the altitudes for each point in the route
		this.altitude = [];
		
		// Create a flag that indicates  if the route chunk has altitude data
		this.hasAltitudeData = false;
		
		// Get the number of vertices in the route line
		var vertexCount = polyline.getVertexCount();
		
		// Check the number of vertices
		if (vertexCount == 1)
		{
			// If there is only one vertex in the line, set both the start and end waypoints to that position
			this.startPoint = polyline.getVertex(0);
			this.endPoint = polyline.getVertex(0);
		}
		else if (vertexCount > 1)
		{
			// If there are more than one vertices in the line, set the start and end waypoints
			this.startPoint = polyline.getVertex(0);
			this.endPoint = polyline.getVertex(vertexCount-1);
		}
	},
	
	// Method: distance
	// Inputs: None
	// Outputs: The distance of the route chunk
	distance: function()
	{
		// Return the distance of this route chunk
		return this.route.getLength();
	},
	
	// Method: getStartingAltitude
	// Inputs: None
	// Outputs: The altitude of the starting point of the chunk if it exists, zero otherwise
	getStartingAltitude: function()
	{
		// Create a variable to hold the altitude
		var altitude = 0;
		
		// Check to see if the chunk has altitude data
		if (this.hasAltitudeData)
		{
			// If there is altitude data, get the altitude of the first point
			altitude = this.altitude.first();
		}
		
		// Return the altitude
		return altitude;
	},
	
	// Method: getEndingAltitude
	// Inputs: None
	// Outputs: The altitude of the ending point of the chunk if it exists, zero otherwise
	getEndingAltitude: function()
	{
		// Create a variable to hold the altitude
		var altitude = 0;
		
		// Check to see if the chunk has altitude data
		if (this.hasAltitudeData)
		{
			// If there is altitude data, get the altitude of the last point
			altitude = this.altitude.last();
		}
		
		// Return the altitude
		return altitude;
	},
	
	// Method: addAltitudeData
	// Inputs: altitude - An array of altitudes corresponding to the points of the route
	// Outputs: None
	addAltitudeData: function(altitude)
	{
		// Set the altitude data
		this.altitude = altitude;
		
		// Set the flag to indicate this chunk has altitude data
		this.hasAltitudeData = true;
	}
});