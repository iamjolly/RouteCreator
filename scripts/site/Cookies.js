
// Method: setCookie
// Inputs: cookieName - The name of the cookie to save
//	        cookieValue - The value of the cookie 
//	        daysToExpire - The number of days the cookie will last
// Outputs: None
function setCookie(cookieName, cookieValue, daysToExpire)
{
	// Create a variable to hold the expiration date of the cookie
	var expirationDate = new Date();
	
	// Set the expiration date
	expirationDate.setDate(expirationDate.getDate() + daysToExpire);
	
	// Create the cookie
	document.cookie = cookieName + "=" + escape(cookieValue) + ( (daysToExpire==null) ? "" : ";expires=" + expirationDate.toGMTString() );
}

// Method: getCookie
// Inputs: cookieName - The name of the cookie to get
// Outputs: getCookie - The value of the specified cookie
function getCookie(cookieName)
{
	// Create a variable to hold the cookie value
	var cookieValue = "";
	
	// Check to see if there are any cookies for this page
	if (document.cookie.length > 0)
	{
		// If there are, get the starting index of the cookie we are interested in
		var cookieStart = document.cookie.indexOf(cookieName + "=");
		
		// Check to see if the cookie we are interested in exists
		if (cookieStart != -1)
		{
			// If the cookie exists, move the starting index to the  start of the cookie value
			cookieStart = cookieStart + cookieName.length + 1;
			
			// Search for the end of the cookie value
			var cookieEnd = document.cookie.indexOf(";", cookieStart);
			
			// If we did not find the start of a new cookie than this is the last cookie in the list
			if (cookieEnd == -1)
			{
				// Set the end of the cookie value to the end of the entire cookie string
				cookieEnd = document.cookie.length;
			}
			
			// Get the cookie value
			cookieValue = unescape(document.cookie.substring(cookieStart, cookieEnd));
		}
	}
	
	// Return the cookie value
	return cookieValue;
}