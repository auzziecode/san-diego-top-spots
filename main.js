const map = L.map('map').setView([32.735736, -117.161087], 12); // Initialize on center of San Diego, zoom x12
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

// Calls the appropriate functions to load the page based on data from $.getJSON
async function pageLoad(data) {
  try {
    const userLocation = await getUserLocation();
        if (userLocation) {
            data.forEach((item) => item["distance"] = calcDistance(userLocation,item.location)); // Add distance key
            data.sort((a,b) => a.distance - b.distance); // Sort by shortest distance
        }
  }
  catch (err) {alert("Notice: Please reload and enable location in order to see distances.")}
  finally {
    data.forEach((obj) => {
        populateGraph(obj);
        addPin(obj);
    })
  }
};

// Get user's location via Geolocation API, or return error
function getUserLocation() {
  return new Promise((resolve,reject) => {
    if (!navigator.geolocation) {reject("Geolocation not supported")}
    else {navigator.geolocation.getCurrentPosition(
      (position) => {resolve ([position.coords.latitude, position.coords.longitude])},
      (error) => {reject("Error getting location")})}})
};

// Calculates direct distance from user's location to given long/lat (Haversine); called by sortData()
function calcDistance([lat1,lon1],[lat2,lon2]) {
    const R = 3958.8; // Radius of the Earth in miles
    const toRad = (angle) => (angle * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R*c).toFixed(2); // Distance in miles, rounded to 2 decimals
};

const table = document.getElementById("data-table").tBodies[0]; // reference for the data table

// Populates the graph; called by pageLoad()
function populateGraph(obj) {
  const row = table.insertRow(-1);
  row.insertCell(0).innerHTML = obj.name;
  row.insertCell(1).innerHTML = obj.description;
  row.insertCell(2).innerHTML = obj.distance ? obj.distance + "mi" : "";
  row.insertCell(3).innerHTML = mapButton(obj.location); // Button linked to GMaps location
  row.insertCell(4).innerHTML = routeButton(obj.location); // Button linked to GMap route directions
};

// Creates a button linked to GMaps for given long/lat coords; called by populateGraph()
function mapButton([lat,lon]) {
  return `<a href="https://www.google.com/maps?q=`+lat+`,`+lon+`" class="button" target=_"blank">Map</a>`
};

// Creates a button linked to GMaps route from user location; called by populateGraph()
function routeButton([lat,lon]) {
  return `<a href="https://www.google.com/maps/dir/Current+Location/`+lat+`,`+lon+`" class="button" target=_"blank">Route</a>`
};

// Adds a pin to the GMap for given long/lat coords and a hover-tooltip, clicking navigates to entry in table
// Called by pageLoad()
function addPin(obj) {
  L.marker([obj.location[0],obj.location[1]])
    .addTo(map)
    .bindTooltip(`<b>${obj.name}</b>`)
    .bindPopup(`<b>${obj.name}</b><br>${obj.description}`);
};