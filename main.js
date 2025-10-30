// Notice: map/distance/route functionality postponed

const map = L.map('map').setView([32.75, -117.85], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Get data from the data.json file, then either populate the page or display an error
$.getJSON("data.json")
.done(pageLoad) // Call pageLoad() to populate the page
.fail((jqXHR,text,error) => {
  console.log("Error retrieving JSON: ",text,error);
  alert("Error loading page.");
});

let userLocation = [];

// Calls the appropriate functions to load the page based on data from $.getJSON
async function pageLoad(data) {
  try {userLocation = await getUserLocation();}
  catch (err) {alert("Notice: Please reload and enable location in order to see distances and routes.")}
  const sData = sortData(data);
  sData.forEach((obj) => {
    populateGraph(obj);
    addPin(obj);
  })
};

// Get user's location via Geolocation API, or return error
function getUserLocation() {
  return new Promise((resolve,reject) => {
    if (!navigator.geolocation) {reject("Geolocation not supported")}
    else {navigator.geolocation.getCurrentPosition(
      (position) => {resolve ([position.coords.latitude, position.coords.longitude])},
      (error) => {reject("Error getting location")})}})
};

// Sorts list by distance to user; called by pageLoad()
function sortData(data) {
// iterate arr, call calcDistance -> add distance key/value to each obj
// let arr2 = [];
// iterate arr, pop min distance to arr2; return
return data;
};

// Calculates distance by car from user's location to given long/lat; called by sortData()
function calcDistance(long,lat) {

};

const table = document.getElementById("data-table").tBodies[0]; // reference for the data table

// Populates the graph; called by pageLoad()
function populateGraph(obj) {
  const row = table.insertRow(-1);
  row.insertCell(0).innerHTML = obj.name;
  row.insertCell(1).innerHTML = obj.description;
  row.insertCell(2).innerHTML = mapButton(obj.location); // Button linked to GMaps location
  row.insertCell(3).innerHTML = routeButton(obj.location); // Button linked to route directions
};

// Creates a button linked to GMaps for given long/lat coords; called by populateGraph()
function mapButton([long,lat]) {
  return `<a href="https://www.google.com/maps?q=`+long+`,`+lat+`" class="button" target=_"blank">Map</a>`
};

// Creates a button linked to GMaps route from user location; called by populateGraph()
function routeButton([long,lat]) {
  return `<a href="https://www.google.com/maps/dir/Current+Location/`+long+`,`+lat+`" class="button" target=_"blank">Route</a>`
};

// Adds a pin to the GMap for given long/lat coords and a hover-tooltip, clicking navigates to entry in table
// Called by pageLoad()
function addPin(obj) {
  L.marker([obj.location[0],obj.location[1]])
    .addTo(map)
    .bindTooltip(`<b>${obj.name}</b>`)
    .bindPopup(`<b>${obj.name}</b><br>${obj.description}`)
    .openPopup();
};