// ====================================================================
//   SpreadSheetsSQL
// ====================================================================
//   Project ID: MAoZrMsylZMiNUMljU4QtRHEMpGMKinCk
//   GitHub: https://github.com/roana0229/spreadsheets-sql
//   URL: https://qiita.com/roana0229/items/fea931fcabc57f193620
// --------------------------------------------------------------------

var spreadsheets_id = "1asUcWTOVDmcWUpRxHulSfHlbgN4PnYz-GII1rr-nXVE";
var spreadsheets_sheet_users = "users";
var spreadsheets_sheet_logs = "logs";

// ====================================================================
//   Htmlspecialchars for Javascript
// ====================================================================
//   URL: https://www.petitmonte.com/javascript/htmlspecialchars.html
// --------------------------------------------------------------------

function htmlspecialchars(str) {
  return (str + '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ====================================================================
//   GET Request
// ====================================================================
//   getUser:
//       @arg      user_key(string)
//       @return   nickname(string), in_room(boolean)
// --------------------------------------------------------------------
//   getAllUsers:
//       @return   nickname(string), in_room(boolean)
// --------------------------------------------------------------------
//   getCanLeave:
//       @arg      user_key(string)
//       @return   can_leave(boolean)
// --------------------------------------------------------------------

function doGet(e) {
  switch (e.parameter.func) {

    case "getUser":
      var data = getUser(e);
      break;

    case "getAllUsers":
      var data = getAllUsers();
      break;

    case "getCanLeave":
      var data = getCanLeave(e);
      break;
    default:
      var data = "";
      break;
  }
  // var data = getData('members');
  return ContentService.createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}


// function getData(sheetName) {
//   var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
//   var rows = sheet.getDataRange().getValues();
//   var keys = rows.splice(0, 1)[0];
//   return rows.map(function(row) {
//     var obj = {};
//     row.map(function(item, index) {
//       obj[String(keys[index])] = String(item);
//     });
//     return obj;
//   });
// }

function getUser(e) {
  return SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_users).select(['user_key', 'nickname', 'active', 'in_room']).filter('active = 1 AND user_key = ' + htmlspecialchars(e.parameter.user_key)).result();
}

function getAllUsers() {
  return SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_users).select(['nickname', 'active', 'in_room']).filter('active = 1').result();
}

function getCanLeave(e) {
  var data = SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_logs).select(['user_key', 'in_time', 'out_time']).filter('user_key = ' + htmlspecialchars(e.parameter.user_key)).result();
  if (!data[0])
    return false;

  var in_time, out_time;
  data.map(function (row) {
    in_time = row.in_time;
    out_time = row.out_time;
  });

  return !out_time && in_time.getDate() == new Date().getDate();
}


// ====================================================================
//   findRow()
// ====================================================================
//   https://tonari-it.com/gas-spreadsheet-find/
// --------------------------------------------------------------------

function findRow(sheet, val, col) {

  var dat = sheet.getDataRange().getValues();
  for (var i = dat.length; i > 0; i--) {
    if (dat[i][col - 1] === val) {
      return i + 1;
    }
  }
  return 0;
}