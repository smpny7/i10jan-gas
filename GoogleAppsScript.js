// ====================================================================
//   SpreadSheetsSQL
// ====================================================================
//   Project ID: MAoZrMsylZMiNUMljU4QtRHEMpGMKinCk
//   GitHub: https://github.com/roana0229/spreadsheets-sql
//   URL: https://qiita.com/roana0229/items/fea931fcabc57f193620
// --------------------------------------------------------------------

var spreadsheets_id = "1asUcWTOVDmcWUpRxHulSfHlbgN4PnYz-GII1rr-nXVE";
var spreadsheets_sheet_member = "member";
var spreadsheets_sheet_data = "data";


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
//   getMember:
//       @arg      member_key(string)
//       @return   nickname(string), in_room(boolean)
// --------------------------------------------------------------------
//   getAllMembers:
//       @return   nickname(string), in_room(boolean)
// --------------------------------------------------------------------
//   getCanLeave:
//       @arg      member_key(string)
//       @return   can_leave(boolean)
// --------------------------------------------------------------------

function doGet(e) {
  switch (htmlspecialchars(e.parameter.func)) {

    case "getMember":
      var data = getMember(e);
      break;

    case "getAllMembers":
      var data = getAllMembers();
      break;

    case "getCanLeave":
      var data = getCanLeave(e);
      break;
    default:
      var data = { success: false };
      break;
  }

  return ContentService.createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function getMember(e) {
  return SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_member).select(['member_key', 'nickname', 'active', 'in_room']).filter('active = 1 AND member_key = ' + htmlspecialchars(e.parameter.member_key)).result();
}

function getAllMembers() {
  return SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_member).select(['nickname', 'active', 'in_room']).filter('active = 1').result();
}

function getCanLeave(e) {
  var data = SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_data).select(['member_key', 'in_time', 'out_time']).filter('member_key = ' + htmlspecialchars(e.parameter.member_key)).result();
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
//   POST Request
// ====================================================================
//   insertNewData:
//       @arg      member_key(string), body_temperature(string),
//                 physical_condition(string), stifling(string),
//                 fatigue(string), remarks(string),
//       @return   success(boolean)
// --------------------------------------------------------------------
//   setOutTime:
//       @arg      member_key(string)
//       @return   success(boolean)
// --------------------------------------------------------------------

function doPost(e) {
  switch (htmlspecialchars(e.parameter.func)) {

    case "insertNewData":
      var data = insertNewData(e);
      break;

    case "setOutTime":
      var data = setOutTime(e);
      break;

    default:
      var data = { success: false };
      break;
  }

  return ContentService.createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function insertNewData(e) {
  SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_data).insertRows([
    { id: '=ROW()-1', member_key: htmlspecialchars(e.parameter.member_key), body_temperature: htmlspecialchars(e.parameter.body_temperature), physical_condition: htmlspecialchars(e.parameter.physical_condition), stifling: htmlspecialchars(e.parameter.stifling), fatigue: htmlspecialchars(e.parameter.fatigue), remarks: htmlspecialchars(e.parameter.remarks), in_time: new Date() }
  ]);

  setInRoom(htmlspecialchars(e.parameter.member_key));

  return { success: true };
}

function setOutTime(e) {
  var data = SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_data).select(['id', 'member_key', 'in_time', 'out_time']).filter('member_key = ' + htmlspecialchars(e.parameter.member_key)).result();
  if (!data[0])
    return { success: false };

  var id, in_time, out_time;
  data.map(function (row) {
    id = row.id;
    in_time = row.in_time;
    out_time = row.out_time;
  });

  if (out_time || in_time.getDate() != new Date().getDate())
    return { success: false };

  SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_data).updateRows({
    out_time: new Date()
  }, 'id = ' + id);

  setOutRoom(htmlspecialchars(e.parameter.member_key));

  return { success: true };
}


// ====================================================================
//   Others
// ====================================================================
//   setInRoom:
//       @arg      member_key(string)
// --------------------------------------------------------------------
//   setOutRoom:
//       @arg      member_key(string)
// --------------------------------------------------------------------

function setInRoom(member_key) {
  SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_member).updateRows({
    in_room: 1
  }, 'member_key = ' + member_key);
}

function setOutRoom(member_key) {
  SpreadSheetsSQL.open(spreadsheets_id, spreadsheets_sheet_member).updateRows({
    in_room: 0
  }, 'member_key = ' + member_key);
}