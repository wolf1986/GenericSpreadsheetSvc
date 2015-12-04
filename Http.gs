// HTTP Stuff
function doPost(e) {
  return handleResponse(e);
}

function doGet(e) { 
  return handleResponse(e);
}

// General case response
function handleResponse(e) {
  var p = unboxArray(e.parameters);
  var result = dispatchServiceFunction(p);
  return getJsonResponse(p._req_id, result);
}

// JSONP formulation
function getJsonResponse(reqId, v) {
  var varName = 'GAS_Result_' + reqId;
  return ContentService
    .createTextOutput(varName + ' = (' + JSON.stringify(v) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Dispatch Service Functions
function dispatchServiceFunction(p) {
  // Print p to log
  for(var key in p)
    Logger.log(key + ' : ' + p[key]);  
  
  Logger.log("Method: " + p._method + "; Args: " + p._args);
  var method = p._method;  
  if(!method)
    return false;
  
  var args = JSON.parse(p._args);

  // Call function by it's name
  var f = Svc[method];
  return f.apply(f, args);
}