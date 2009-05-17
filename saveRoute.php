<?php
    // Decode the POSTed route data from JSON into a php associative array
    $routeData = json_decode(stripslashes($_POST['routeData']), true);

    // Because the json_decode function seems to parse some of the internal arrays as strings
    // we need to parse them again
    $routeData["icons"] = json_decode($routeData["icons"], true);
    $routeData["markers"] = json_decode($routeData["markers"], true);
    $routeData["route"]["coordinates"] = json_decode($routeData["route"]["coordinates"], true);
    
    // Get the route name to use as the suggested file name
    $routeFileName = $routeData["routeName"];
    
    // Get the type of file to generate
    $fileType = $routeData["fileType"];

    // Generate the file data
    $fileData = generateFileData($fileType, $routeData);

    // Get the MIME type to use with this file type
    $mimeType = getMimeType($fileType);

    // Generate the HTTP headers that will cause the generated data to be downloaded as a file
    header("Content-type: " . $mimeType);
    header("Content-Disposition: attachment; filename=\"" . $routeFileName . "." . $fileType . "\"");

    // Send the file data
    echo($fileData);



    //
    // Method: generateFileData
    //
    // Description: This method converts the route data into the specified file type data 
    //
    // Inputs:
    //      $fileType - The type of file that will be generated
    //      $routeData - The route data to use in creating the file data
    //
    // Outputs:
    //      generateFileData - A string containing the file data
    //
    function generateFileData($fileType, $routeData)
    {
        // Create a variable to hold the file data
        $fileData = "";

        // Check the type of file we are generating
        if ("kml" == $fileType) 
        {
            // If it is a kml file, generate KML data
            $fileData = generateKmlData($routeData);
        }
        elseif ("gpx" == $fileType) 
        {
            // If it is a gpx file, generate GPX data
            $fileData = generateGpxData($routeData);
        }
        elseif ("tcx" == $fileType) 
        {
            // If it is a tcx file, generate TCX data
            $fileData = generateTcxData($routeData);
        }
        else
        {
            // For any other type, return a blank string
            $fileData = "";
        }

        // Return the file data
        return $fileData;
    }


    //
    // Method: generateKmlData
    //
    // Description: This method converts the route data into KML data 
    //
    // Inputs:
    //      $routeData - The route data to use in creating the file data
    //
    // Outputs:
    //      generateFileData - A string containing the KML data
    //
    function generateKmlData($routeData)
    {
        // Create a variable to hold the KML data
        $kmlData = "KML Data";

        // Return the KML data
        return $kmlData;
    }


    //
    // Method: generateTcxData
    //
    // Description: This method converts the route data into TCX data 
    //
    // Inputs:
    //      $routeData - The route data to use in creating the file data
    //
    // Outputs:
    //      generateTcxData - A string containing the TCX data
    //
    function generateTcxData($routeData)
    {
		// Save the total route time 
		$totalRouteTime = $routeData["route"]["timeInSeconds"];
		
		// Save the total route distance 
		$totalRouteDistance = $routeData["route"]["distanceInMeters"];
		
		// Validate total route distance
		if ($totalRouteDistance == 0)
		{
			// Setthe total route distance to 1
			$totalRouteDistance = 1;
		}
	
        // Create a variable to hold the TCX data
        $tcxData = "";

        // Add the xml header
        $tcxData .= "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?>\r\n";

        // Add the garmin tcx namespace declaration
        $tcxData .= "<TrainingCenterDatabase xmlns=\"http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd\">\r\n";

        // Add the courses object
        $tcxData .= "\t<Courses>\r\n";

        // Add the course
        $tcxData .= "\t\t<Course>\r\n";

        // Add the name of the route
        $tcxData .= "\t\t\t<Name>" . $routeData["routeName"] . "</Name>\r\n";

        // Add the lap information
        $tcxData .= "\t\t\t<Lap>\r\n";

        // Add in the total time for the route
        $tcxData .= "\t\t\t\t<TotalTimeSeconds>" . $totalRouteTime . "</TotalTimeSeconds>\r\n";

        // Add in the total distance for the route
        $tcxData .= "\t\t\t\t<DistanceMeters>" . $totalRouteDistance . "</DistanceMeters>\r\n";

        // Add the beginning of the route
        $tcxData .= "\t\t\t\t<BeginPosition>\r\n";

        // Add the latitude of the beginning of the route
        $tcxData .= "\t\t\t\t\t<LatitudeDegrees>" . $routeData["route"]["coordinates"][0]["latitude"] . "</LatitudeDegrees>\r\n";

        // Add the longitude of the beginning of the route
        $tcxData .= "\t\t\t\t\t<LongitudeDegrees>" . $routeData["route"]["coordinates"][0]["longitude"] . "</LongitudeDegrees>\r\n";

        // Close the beginning of the route
        $tcxData .= "\t\t\t\t</BeginPosition>\r\n";

        // Add the end of the route
        $tcxData .= "\t\t\t\t<EndPosition>\r\n";

        // Get the last index of the array
        $index = count($routeData["route"]["coordinates"])-1;

        // Add the latitude of the end of the route
        $tcxData .= "\t\t\t\t\t<LatitudeDegrees>" . $routeData["route"]["coordinates"][$index]["latitude"] . "</LatitudeDegrees>\r\n";

        // Add the longitude of the end of the route
        $tcxData .= "\t\t\t\t\t<LongitudeDegrees>" . $routeData["route"]["coordinates"][$index]["longitude"] . "</LongitudeDegrees>\r\n";

        // Close the end of the route
        $tcxData .= "\t\t\t\t</EndPosition>\r\n";

        // Add the intensity
        $tcxData .= "\t\t\t\t<Intensity>Active</Intensity>\r\n";

        // Add the cadence
        $tcxData .= "\t\t\t\t<Cadence>0</Cadence>\r\n";

        // Close the lab information
        $tcxData .= "\t\t\t</Lap>\r\n";

        // Add the track of the route
        $tcxData .= "\t\t\t<Track>\r\n";
		
		// Create a variable to accumulate the time between coordinate points
		$cummulativeTime = 0;
		
		// Get the current UTC time
		$utcTime = time();

        // Get the number of elements in the coordinate array
        $numberOfPoints = count($routeData["route"]["coordinates"]);

        // Loop through each coordinate in the array
        for ($i = 0; $i < $numberOfPoints; $i++) 
        {
            // Add a new track point
            $tcxData .= "\t\t\t\t<Trackpoint>\r\n";

			// Get the distance from the last point
			$lastPointDistance = $routeData["route"]["coordinates"][$i]["distanceFromLast"];
			
			// Compute the time from the last point based on the pacing information and add it to the cummulative time
			$cummulativeTime += ($totalRouteTime * $lastPointDistance / $totalRouteDistance);
			
			// Add in the time the point should be achieved based on the pacing information
			$tcxData .= "\t\t\t\t\t<Time>" .gmstrftime("%Y-%m-%dT%H:%M:%SZ", $utcTime + $cummulativeTime) . "</Time>\r\n";

            // Add the position of the point
            $tcxData .= "\t\t\t\t\t<Position>\r\n";

            // Add the latitude of the end of the route
            $tcxData .= "\t\t\t\t\t\t<LatitudeDegrees>" . $routeData["route"]["coordinates"][$i]["latitude"] . "</LatitudeDegrees>\r\n";
    
            // Add the longitude of the end of the route
            $tcxData .= "\t\t\t\t\t\t<LongitudeDegrees>" . $routeData["route"]["coordinates"][$i]["longitude"] . "</LongitudeDegrees>\r\n";

            // Close the position
            $tcxData .= "\t\t\t\t\t</Position>\r\n";

            // Add the altitude
            $tcxData .= "\t\t\t\t\t<AltitudeMeters>" . $routeData["route"]["coordinates"][$i]["altitude"] . "</AltitudeMeters>\r\n";

            // Close the track point
            $tcxData .= "\t\t\t\t</Trackpoint>\r\n";
        }

        // Close the track
        $tcxData .= "\t\t\t</Track>\r\n";

        // Close the course
        $tcxData .= "\t\t</Course>\r\n";

        // Close the courses object
        $tcxData .= "\t</Courses>\r\n";

        // Close the garmin tcx namespace declaration
        $tcxData .= "</TrainingCenterDatabase>\r\n";

        // Return the TCX data
        return $tcxData;
    }


    //
    // Method: generateGpxData
    //
    // Description: This method converts the route data into GPX data
    //
    // Inputs:
    //      $routeData - The route data to use in creating the file data
    //
    // Outputs:
    //      generateGpxData - A string containing the GPX data
    //
    function generateGpxData($routeData)
    {
        // Create a variable to hold the GPX data
        $gpxData = "GPX Data";

        // Return the GPX data
        return $gpxData;
    }
   

    //
    // Method: getMimeType
    //
    // Description: This method returns the MIME type to use with the given file type.
    //
    // Inputs:
    //      $fileType - The type of file that will be generated
    //
    // Outputs:
    //      getMimeType - The MIME type of the generated file
    //
    function getMimeType($fileType)
    {
        // Create a variable to hold the MIME type
        $mimeType = "";

        // Check the type of file we are generating
        if ("kml" == $fileType) 
        {
            // If it is a kml file, use the Google KML MIME type
            $mimeType = "application/vnd.google-earth.kml+xml";
        }
        elseif ("gpx" == $fileType) 
        {
            // If it is a gpx file, use the application/gpx+xml type
            $mimeType = "application/gpx+xml";
        }
        elseif ("tcx" == $fileType) 
        {
            // If it is a tcx file, use the application/tcx+xml type
            $mimeType = "application/tcx+xml";
        }
        else
        {
            // For any other type, use the generic application/text type
            $mimeType = "application/text";
        }

        // Return the MIME type
        return $mimeType;
    }


?>