// Service Methods
var Svc = {
  getTitles: function(spreadsheetUrl, spreadsheetTitle) {
    // Initialization
    var ss_app = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var sheet = ss_app.getSheetByName(spreadsheetTitle);
    
    // First row of sheet contains headers
    var table_headers_range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    var table_headers = table_headers_range.getValues()[0];
    
    return table_headers;
  },
  
  getValues: function(spreadsheetUrl, spreadsheetTitle, number, isRow, isUnique, dontIgnoreTitle) {
    // Initialization
    var ss_app = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var sheet = ss_app.getSheetByName(spreadsheetTitle);
    
    var first = 2;
    if(dontIgnoreTitle)
      first = 1;
    
    var data = [];
    if(!isRow) {
      var range = sheet.getRange(first, number, sheet.getLastRow() + 1 - first, 1).getValues();
      for(var i in range) {
        data.push(range[i][0]);
      }
    } else {
      data = sheet.getRange(number, first, 1, sheet.getLastColumn() + 1 - first).getValues()[0];
    }
   
    if(isUnique) {
      data = removeDuplicates(data, true);
    }
    
    return data;
  },
  
  getSheetJson: function(spreadsheetUrl, spreadsheetTitle) {
    // Initialization
    var ss_app = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var sheet = ss_app.getSheetByName(spreadsheetTitle);
    
    // First row of sheet contains headers
    var table_range = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    var table_headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    var table_json = [];
    
    // Iterate rows
    for(var r = 1; r < table_range.length; r++) {
      // Row vector
      var row = table_range[r];
            
      // Prepare Object
      // Iterate columns
      var row_obj = {};
      for(var c = 0; c < row.length; c++) {        
        var value = table_range[r][c];
//        if(value != '')
          row_obj[table_headers[c]] = value;
      }
      
      // Collect rows to list
      if(row_obj != null)
        table_json.push(row_obj);
    }
    
    return table_json;
  },
  
  appendSpreadSheet: function(spreadsheetUrl, spreadsheetTitle, columnValueDictionary) {
    // Log
    Logger.log("appendSpreadSheet" + "(" + JSON.stringify(arguments) + ")");

    // Initialization
    var ss_app = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var sheet = ss_app.getSheetByName(spreadsheetTitle);
    
    // First row of sheet contains headers
    var table_headers_range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    var table_headers = table_headers_range.getValues()[0];
    
    // Initialize row with default values
    var table_row_new = new Array(table_headers.length);
    var table_row_prev_range = sheet.getRange(sheet.getLastRow(), 1, 1, sheet.getLastColumn());
    var table_row_prev = table_row_prev_range.getFormulas()[0];
    
    for(var i = 0; i < table_row_new.length; i++) {
      table_row_new[i] = '';
    }

    if(columnValueDictionary instanceof Array) {
      // Use as array
      for(var i = 0; i < columnValueDictionary.length; i++) {
        table_row_new[i] = columnValueDictionary[i];
      }
    } else {
      // Use as dictionary      
      // Translate Title to New-Row
      for(var column_title in columnValueDictionary) {
        var col_index = table_headers.indexOf(column_title);
        var cur_val = columnValueDictionary[column_title];
               
        table_row_new[col_index] = cur_val;
      }
    }

    // Append the row
    sheet.appendRow(table_row_new);
    
    // Copy formatting from the headers row
    var prev_format = sheet.getRange(sheet.getLastRow()-1, 1, 1, sheet.getLastColumn()).getNumberFormats();
    sheet.getRange(sheet.getLastRow(), 1, 1, sheet.getLastColumn()).setNumberFormats(prev_format);
    
    // Copy values of requested cells
    var row = sheet.getLastRow();
    for(var col=0; col < table_row_new.length; col++)
    {
      if(table_row_new[col] == 'gs:__copy_above__') {
        Logger.log(col + ' - GS!' + table_row_new[col]);
        var range_from = sheet.getRange(row-1, col+1, 1, 1);
        var range_to = sheet.getRange(row, col+1, 1, 1);
        
        range_from.copyTo(range_to);
      }      
      
      if(table_row_new[col] == 'gs:__logged_user_email__') {
        Logger.log(col + ' - GS!' + table_row_new[col]);
        var userMail = Session.getActiveUser().getEmail();
        var range_to = sheet.getRange(row, col+1, 1, 1);
        range_to.setValue(userMail);
      }
    }
    
    return true;
  }
};
