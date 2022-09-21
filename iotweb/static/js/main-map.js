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

const POPUP_CONTENT = "" +
    "<div class='marker-info'>" +
    "    <div class='marker-info-title'>" +
    "        @@NAME@@" +
    "    </div>" +
    "    <hr/>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <img src='../static/images/info_status.png' height='36px' alt='Status' />" +
    "        </div>" +
    "        <div class='marker-info-value @@STATUS-CLASS@@'>" +
    "            @@STATUS@@" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <img src='../static/images/info_location.png' height='36px' alt='Location' />" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            @@LOCATION@@" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-button-container' style='margin-top: 5px;'>" +
    "        <button id='@@ID@@-BUTTON' class='marker-info-button' onclick=\"exploreFarm('@@ID@@')\">Explore</button>" +
    "        <div id='@@ID@@-BUTTON-LOADING' class='marker-info-button-loading' style='display: none'>" +
    "    </div>" +
    "</div>";
const FARM_LIST_ENTRY = "" +
    "<div onclick='showInfoWindow(\"@@ID@@\")' class='farms-list-entry'>" +
    "    <div class='d-flex w-100 justify-content-start align-items-center'>" +
    "        <span class='digi-menu-icon fas fa-seedling fa-fw fa-lg mr-3'></span>" +
    "        <span>@@NAME@@</span>" +
    "    </div>" +
    "</div>";
const CLASS_MARKER_ON = "map-marker";
const CLASS_MARKER_OFF = "map-marker-off";
const CLASS_STATUS_ON = "marker-info-value-status-on";
const CLASS_STATUS_OFF = "marker-info-value-status-off";

var map;

var farmMarkers = {};
var farmWindows = {};

var smartFarms = {};

var exploringFarm = false;

var markersZIndex = 0;

//farmWindows[solarFarm["main_controller"]] = popWindow;

//create demo solar farm geojson 
const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
        type: 'Point',
        coordinates: [109.43, 36.00]
        },
        properties: {
        title: '<h5>Northwest Solar Farm</h5>',
        description: '<hr><div class=\"marker-info-title\"><img src="../static/images/info_status.png" height="36px" alt="Status"><span> In Operation <span> <br> <span>Installed Capacity: 100MW <br> Current Power:  11 MWh </span> </div> <div class="marker-info-button-container" style="margin-top: 5px;">        <button id="00000000-00000000-0004F3FF-FF340DC0-BUTTON" class="marker-info-button" onclick="#">Manage</button>        <div id="00000000-00000000-0004F3FF-FF340DC0-BUTTON-LOADING" class="marker-info-button-loading" style="display: none">    </div></div>',
            'message': 'Please log in to access your solar assets! Make sure you have the appropriate permissions',
        'iconSize': [80,80]
        }
      }
    ]
};


// Initialize and add the map.
function initMap() {
    // The location of Zhongwei.
    let zhongwei = [105.36, 37.10];

    // The map, centered at Uluru.
    map_configuration = {
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: zhongwei,
        zoom: 4    
    }
    map = new mapboxgl.Map(map_configuration);

 
}



function showpopup() {
    for (const feature of geojson.features) {
        // Create a DOM element for each marker.
        const el = document.createElement('div');
        const width = feature.properties.iconSize[0];
        const height = feature.properties.iconSize[1];
        el.className = 'marker';
        el.style.backgroundImage = `url(https://www.eccee.com/wp-content/uploads/2022/06/2022081615230995.jpg)`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        //el.style.backgroundSize = '100%';

        el.addEventListener('click', () => {
            window.alert(feature.properties.message);
        });
        new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML(
            `${feature.properties.title}<p>${feature.properties.description}</p>`
            )
        )
        .addTo(map);
    }


}


// Generates and returns the content of the information window for the farm with the given ID.
/*
function getFarmInfoWindowContent(farmID) {
    let mainController = smartFarms[farmID]["main_controller"];
    let name = smartFarms[farmID]["name"].toUpperCase();
    let location = smartFarms[farmID]["location"];
    let online = smartFarms[farmID]["online"];

    // Clone the content template.
    let content = INFO_WINDOW_CONTENT;
    // Update the IDs of the information window.
    content = content.replace(/@@ID@@/g, mainController)
    // Set the information window title.
    content = content.replace("@@NAME@@", name);
    // Configure the status.
    if (online) {
        content = content.replace("@@STATUS-CLASS@@", CLASS_STATUS_ON);
        content = content.replace("@@STATUS@@", "Online");
    } else {
        content = content.replace("@@STATUS-CLASS@@", CLASS_STATUS_OFF);
        content = content.replace("@@STATUS@@", "Offline");
    }
    // Configure the location.
    content = content.replace("@@LOCATION@@", location[0] + "<br>" + location[1]);

    return content;
}

// Shows the info window of the farm with the given ID.

// Opens the dashboard of the farm with the given ID.
function exploreFarm(farmID) {
    // Disable the farm button.
    disableFarmButton(farmID, true);

    // Load the dashboard of the farm.
    let farmName = smartFarms[farmID]["name"];
    window.open("../dashboard/?controller_id=" + farmID + "&farm_name=" + farmName, "_self");
}

// Disables the button of the farm with the given ID.
function disableFarmButton(farmID, loading) {
    let farmButtonElement = $("#" + farmID + "-BUTTON");
    let farmButtonLoadingElement = $("#" + farmID + "-BUTTON-LOADING");
    if (farmButtonElement == null || farmButtonElement.length == 0 ||
        farmButtonLoadingElement == null || farmButtonLoadingElement.length == 0)
        return;

    // Disable the button.
    farmButtonElement.attr("disabled", true);

    // Update the button content.
    if (loading)
        farmButtonElement.html("<i class='fas fa-circle-notch fa-spin'></i> Loading");

    // Show the loading panel.
    farmButtonLoadingElement.show();
}
*/