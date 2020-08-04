
module.exports=getDate;

function getDate(){

var d = new Date();
  var options = {
    day: "numeric",
    weekday: "long",
    month: "long"
  };
  var day = d.toLocaleDateString("en-US", options);
  return day;
}
