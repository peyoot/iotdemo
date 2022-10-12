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

const INFO_WINDOW_CONTENT = "" +
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
const INFO_WINDOW_CONTENT_CONTROLLER = "" +
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
const ID_CONTROLLERS = "controllers";
const ID_STATIONS = "stations";
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

var stations = [];
var irrigationControllers = [];

var loadingStationsStatus = false;

var stationMarkers = {};
var stationWindows = {};
var controllerMarker = null;
var controllerWindow = null;
var stationTemperatures = {};
var stationMoistures = {};
var stationBatteries = {};
var stationValves = {};
var controllerWind = null;
var controllerRain = null;
var controllerRadiation = null;

var tankValve;
var waterLevel;

var stationMarker;
var stationIrrigatingMarker;
var stationOfflineMarker;
var controllerMarker;

var currentWeatherIcon;
var currentWeatherStatus;
var avgTemp = 23.0;  // Define initial value for the temperature so if no stations are registered the weather forecast can be displayed.


var bounds;

// Initialize and add the map.
function initMap() {


    //farLocation = [ solar_farm.longitude,solar_farm.latitude ];

    // The map, centered at Uluru.
    map_configuration = {
        container: 'devices-map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [110,36],
        zoom: 15  
    }
    map = new mapboxgl.Map(map_configuration);

   
    // Create empty LatLngBounds object.
    //bounds = new google.maps.LatLngBounds();
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
    loadingStationsStatus = true;
    updateLoadingStatus();

    $.post(
        "../ajax/get_farm_status",
        JSON.stringify({
            "controller_id": getControllerID(),
            "first": first
        }),
        function(data) {
            if (!isDashboardShowing())
                return;
            processFarmStatusResponse(data, first);
        }
    );
}


// Gets the status of the farm.
function getFarmStatusCallback(response) {

    let readstatus = response["gateways"];
    
    var test = {};
    processFarmStatusResponse(response);
   
}

// Processes the response of the farm status request.
function processFarmStatusResponse(response) {
    if (first) {
        $(".weather-button").click(function() {
            updateCurrentWeather();
        });
        drawDevices(response);
        updateWeatherWidget();
    }
    //updateStationsStatus(response);
    
    // Repeat the task every 30 seconds.
    setTimeout(function() {
        getFarmStatus(false);
    }, REFRESH_INTERVAL);
}

// Draws the markers for the stations and main controller.
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
