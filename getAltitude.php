<?php
	// Decode the POSTed coordinates from JSON into a php associative array
    $coordinates = json_decode(stripslashes($_POST['coordinates']), true);
	
	// Because the json_decode function seems to parse some of the internal arrays as strings
    // we need to parse them again
	$coordinates = json_decode($coordinates, true);
	
	// Get the number of elements in the coordinate array
	$numberOfPoints = count($coordinates);
	
	// Initialize cURL
	$curlHandle=curl_init();
	
	// Set the cURL options
	curl_setopt($curlHandle, CURLOPT_RETURNTRANSFER, true);

	// Create the array used to hold the altitude data
	$altitudeArray = array();
	
	// Create the regex pattern
	$regexPattern = "/<double>(.+)<\/double>/s";

	// Loop through each coordinate in the array
	for ($i = 0; $i < $numberOfPoints; $i++) 
	{
		// Get the latitude and longitude of the coordinate 
		$latitude = $coordinates[$i]["latitude"];
		$longitude = $coordinates[$i]["longitude"];
		
		// Create the HTTP GET string to get the altitude of the coordinates
		$urlString  = "http://gisdata.usgs.gov/xmlwebservices2/elevation_service.asmx/getElevation?X_Value=";
		$urlString .= $longitude . "&Y_Value=" . $latitude;
		$urlString .= "&Elevation_Units=METERS&Source_Layer=-1&Elevation_Only=true";
		
		// Set the URL string
		curl_setopt($curlHandle, CURLOPT_URL, $urlString);
		
		// Execute the request
		$altitudeString = curl_exec($curlHandle);
		
		// Initialize the altitude to zero
		$altitude = 0;
		
		// Extract the altitude data
		if (preg_match_all($regexPattern, $altitudeString, $results, PREG_PATTERN_ORDER))
		{
			// Get the altitude if there was a match and round it to the nearest tenth of a meter (about 4 inches)
			$altitude = round($results[1][0], 1);
		}
		
		// Add the altitude to the array
		$altitudeArray[] = $altitude;
	}
	
	// Close the cURL object
	curl_close($curlHandle);

	// Return the altitude array
	echo(json_encode($altitudeArray));
?>