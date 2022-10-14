/*
 * Copyright 2020, Digi International Inc.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

const DEVICE_POPUP_CONTENT = "" +
    "<div class='marker-info'>" +
    "    <div class='marker-info-title'>" +
    "        <span id='@@ID@@-TITLE'>@@TITLE@@</span>" +
    "    </div>" +
    "    <hr/>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-thermometer-half fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='@@ID@@-TEMPERATURE'>@@TEMPERATURE@@</span> ºC" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-tint fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='@@ID@@-MOISTURE'>@@MOISTURE@@</span> %" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-battery-half fa-2x fa-rotate-270'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='@@ID@@-BATTERY'>@@BATTERY@@</span> %" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-title' style='margin-top: 10px'>" +
    "    Valve status" +
    "    </div>" +
    "    <div class='marker-info-button-container'>" +
    "        <button id='@@ID@@-BUTTON' class='marker-info-button @@BUTTON-OFF-CLASS@@' onclick=\"toggleValve('@@ID@@')\" data-toggle='tooltip' data-placement='bottom' title='Force open/closing'>@@BUTTON-VALUE@@</button>" +
    "        <div id='@@ID@@-BUTTON-LOADING' class='marker-info-button-loading'>" +
    "    </div>" +
    "</div>";
const DEVICE_POPUP_CONTENT_GATEWAY = "" +
    "<div class='marker-info'>" +
    "    <div class='marker-info-title'>" +
    "        <span>CONTROLLER</span>" +
    "    </div>" +
    "    <hr/>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-wind fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='infow-wind'>@@WIND@@</span> km/h" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-cloud-rain fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='infow-rain'>@@RAIN@@</span> L/m²" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-sun fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='infow-radiation'>@@RADIATION@@</span> W/m²" +
    "        </div>" +
    "    </div>" +
    "</div>";
const CLASS_STATUS_LOADING = "marker-info-value-status-loading";
const CLASS_BUTTON_STATUS_OFF = "marker-info-button-off";

const ID_WIND = "wind";
const ID_RADIATION = "radiation";
const ID_RAIN = "rain";
const ID_LEVEL = "level";
const ID_VALVE = "valve";
const ID_TEMPERATURE = "temperature";
const ID_BATTERY = "battery";
const ID_MOISTURE = "moisture";

const ID_STATUS = "status";
const ID_GATEWAYS = "gateways";
const ID_NODES = "nodes";
const ID_WEATHER = "weather";
const ID_TANK = "tank";

const REFRESH_INTERVAL = 30000;

const SUN_GREEN = "<i class='selected-icon-widget fas fa-sun'></i>";
const CLOUD_GREEN = "<i class='selected-icon-widget fas fa-cloud'></i>";
const RAIN_GREEN = "<i class='selected-icon-widget fas fa-cloud-rain'></i>";

const SUN_GRAY = "<i class='icon-widget fas fa-sun'></i>";
const CLOUD_GRAY = "<i class='icon-widget fas fa-cloud'></i>";
const RAIN_GRAY = "<i class='icon-widget fas fa-cloud-rain'></i>";

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WEATHER_ICONS = [SUN_GRAY, CLOUD_GRAY, RAIN_GRAY];

var map;

var testpopup;
var nodes = [];
var irrigationControllers = [];
var sourceFeatures = [];
var solarDevices = [];
var farmLoc = [];

var loadingnodesStatus = false;

var deviceFeatures = {};
var deviceFeature = {};
var deviceLoc = [];
var nodeMarkers = {};
var nodePopups = {};
var gatewayMarker = null;
var gatewayPopup = null;
var nodeTemperatures = {};
var nodeMoistures = {};
var nodeBatteries = {};
var nodeValves = {};
var controllerWind = null;
var controllerRain = null;
var controllerRadiation = null;

var tankValve;
var waterLevel;

var nodeMarker;
var nodeIrrigatingMarker;
var nodeOfflineMarker;
var gatewayMarker;

var currentWeatherIcon;
var currentWeatherStatus;
var avgTemp = 23.0;  // Define initial value for the temperature so if no nodes are registered the weather forecast can be displayed.


var bounds;

// Initialize and add the map.
function initMap() {

    testpopup = DEVICE_POPUP_CONTENT_GATEWAY;
    
    
    node_infor = {};

 
    // The map, centered at Uluru.
    map_configuration = {
        container: 'devices-map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [115,37],
        zoom: 15  
    }
    map = new mapboxgl.Map(map_configuration);

    
    
    
    var scale = new mapboxgl.ScaleControl({
                maxWidth: 100,
                unit: 'metric'
            });
    map.addControl(scale, "bottom-left");
    

}


// Returns whether the dashboard page is showing or not.
function isDashboardShowing() {
    return window.location.pathname.indexOf("dashboard") > -1;
}

//get solar farm status

function getFarmStatus(first=true) {
    if (!isDashboardShowing())
        return;

    // Update colors of the values being refreshed.

    //updateLoadingStatus();
    
    //test = first;
    //test = "1";

    //$.post(
    //    "../ajax/get_farm_status",
    //    JSON.stringify({
    //        "farm_id": test,
    //        "first": first
    //    }),
    //    function(data) {
    //        if (!isDashboardShowing())
    //            return;
    //        processFarmStatusResponse(data, first);
    //    }
    //);
}


// Gets the status of the farm.
function getFarmStatusCallback(response) {

     // Get the devices from the JSON response.
    let readDevices = response["devices"];
    let farmLoc = response["farm_location"];
    map.flyTo({center:farmLoc});
     // Check if the list of farms contains any farm.
     if (readDevices == null || readDevices.length == 0)
         return;
 
 
    for (let device of readDevices) {
        // Add the farm to the dictionary.
        console.log(device);

        solarDevices[device["id"]] = device;
        //calculate device location based on row col
        device_lon=farmLoc[0]+0.001*device["col"];
        device_lat=farmLoc[1]+0.001*device["row"];
        deviceLoc = [device_lon,device_lat];
        
        deviceFeature = {
            'type': 'Feature', 
            'properties': {
                'description': DEVICE_POPUP_CONTENT
                },
            'geometry': {
                'type': 'Point',
                'coordinates': deviceLoc
                }
            };
        sourceFeatures.push(deviceFeature);
    }

    //map.flyto({ center: farmLoc });
    let testarray = 
        [
            {
            'type': 'Feature',
            'properties': {
            'title': '01',
            'description':
            '<strong>tracker01</strong><p>device 01</p>'
            },
            'geometry': {
            'type': 'Point',
            'coordinates': [109.002, 37.002]
            }
            }
        ]
    map.on('load', () => {
        
        map.loadImage('static/images/block.png', (error, image) => {
          if (error) throw error;
          map.addImage('block-icon', image, { 'sdf': true });
          map.addSource('places', {
          'type': 'geojson',
          'data': {
          'type': 'FeatureCollection',
          'features': sourceFeatures
          /*
          [
            {
            'type': 'Feature',
            'properties': {
            'title': '01',
            'description':
            '<strong>tracker01</strong><p>device 01</p>'
            },
            'geometry': {
            'type': 'Point',
            'coordinates': [110.001, 37]
            }
            },
            {
            'type': 'Feature',
            'properties': {
            'title': 02,
            'description':
            '<strong>Tracker 02</strong><p>02</p>'
            },
            'geometry': {
            'type': 'Point',
            'coordinates': [110.002, 37]
            }
            }
            ]       */
            
            }
            });      // addsource end
          // Add a layer showing the places. #4264fb is blue
        
          map.addLayer({
          'id': 'places',
          'type': 'symbol',
          'source': 'places',
          'layout': {
            'icon-image': 'block-icon',
            'icon-size': 0.5
          },
          'paint': {
            'icon-color': [
              'match', // Use the 'match' expression: https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
              ['get', 'title'], // Use the result 'STORE_TYPE' property
              '01',
              '#FF8C00',
              'Pharmacy',
              '#FF8C00',
              '#1ee533' // any other store type
            ]
          }
          });

    
        });
        // Create a popup, but don't add it to the map yet.
        const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
        });
        map.on('mouseenter', 'places', (e) => {
         // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
       
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(description).addTo(map);
        });
        
        map.on('mouseleave', 'places', () => {
        map.getCanvas().style.cursor = '';
        // popup.remove();
        });
    });
}

// Processes the response of the farm status request.
function processFarmStatusResponse(response) {
    if (first) {
        $(".weather-button").click(function() {
            updateCurrentWeather();
        });
        drawDevices(response);
        //updateWeatherWidget();
    }
    //updatenodesStatus(response);
    
    // Repeat the task every 30 seconds.
    setTimeout(function() {
        getFarmStatus(false);
    }, REFRESH_INTERVAL);
}

// Draws the markers for the nodes and main controller.
function drawDevices(response) {
    // First, check if there was any error in the request.
    if (response["error_msg"] != null || response["error"] != null) {
        // Show toast with error.
        if (response["error_msg"] != null) {
            toastr.error(response["error_msg"]);
            $("#info-title").text(response["error_title"]);
            $("#info-message").html(response["error_msg"] + response["error_guide"]);
        } else {
            toastr.error(response["error"]);
            $("#info-message").html(response["error"]);
        }

        return;
    }
}
