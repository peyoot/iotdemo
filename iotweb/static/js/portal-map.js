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


const POP_UP_CONTENT = "" +
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
var farmPopups = {};

var solarFarms = {};

var exploringFarm = false;

var markersZIndex = 0;

var data = JSON.parse("{{contexts|escapejs}}");
mapboxgl.accessToken = data.token ;

// Initialize and add the map.
function initMap() {
    // The location of westchina
    let zhongwei = [105.36, 37.10];

    // The map, centered at westchina
    map_configuration = {
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: zhongwei,
        zoom: 4    
    }
    map = new mapboxgl.Map(map_configuration);
}

//execute after views.py response with a list of farm (from database)
function getSolarFarms() {
    //construct each solarfarm
    for item in sitelist
        solarfarms[item.id].name = item.name
        solarfarms[item.id].longitude = item.longitude
        solarfarms[item.id].latitude = item.latitude
        solarfarms[item.id].capability = 30
        solarfarms[item.id].currentpower = (Math.random()*(15-10) + 10).toFixed(2)
      
    endfor


    // Add a new farm entry to the list of farms.
    let farmDivContent = FARM_LIST_ENTRY;
    farmDivContent = farmDivContent.replace(/@@ID@@/g, smartFarm["main_controller"]);
    farmDivContent = farmDivContent.replace(/@@NAME@@/g, smartFarm["name"].toUpperCase());
    let farmDiv = document.createElement("div");
    farmDiv.innerHTML = farmDivContent;
    $("#farms-list").append(farmDiv);

}
// Callback executed when the list of farms is requested.
function getSmartFarmsCallback(response) {
    // First, check if there was any error in the request.
    if (response["error_msg"] != null) {
        // Show toast with error.
        toastr.error(response["error_msg"]);
        $("#info-title").text(response["error_title"]);
        $("#info-message").html(response["error_msg"] + response["error_guide"]);

        // Hide the loading panel of the map.
        hidePopup($(".map-loading-wrapper"), $(".popup-loading"));

        // Show help dialog.
        showPopup($(".map-loading-wrapper"), $(".popup-info"));
        return;
    }
    if (response["error"] != null) {
        // Show toast with error.
        toastr.error(response["error"]);
        $("#info-message").html(response["error"]);

        // Hide the loading panel of the map.
        hidePopup($(".map-loading-wrapper"), $(".popup-loading"));

        // Show help dialog.
        showPopup($(".map-loading-wrapper"), $(".popup-info"));
        return;
    }

    // Get the farms from the JSON response.
    let readFarms = response["farms"];

    // Check if the list of farms contains any farm.
    if (readFarms == null || readFarms.length == 0)
        return;

    // Create empty LatLngBounds object.
    let bounds = new google.maps.LatLngBounds();

    // Create the farm online marker icon.
    let farmOnlineMarkerIcon = {
        url: "static/images/map_marker.png",
        size: new google.maps.Size(52, 66),
        scaledSize: new google.maps.Size(52, 66),
        origin: new google.maps.Point(0, 0),
    };

    // Create the farm offline marker icon.
    let farmOfflineMarkerIcon = {
        url: "static/images/map_marker_off.png",
        size: new google.maps.Size(52, 66),
        scaledSize: new google.maps.Size(52, 66),
        origin: new google.maps.Point(0, 0),
    };

    // Process farms.
    for (let smartFarm of readFarms) {
        // Add the farm to the dictionary.
        smartFarms[smartFarm["main_controller"]] = smartFarm;

        // Get farm location.
        let farmLocation = {
                            lat: smartFarm["location"][0],
                            lng: smartFarm["location"][1]
                        };
        // Create a marker for the farm.
        let markerIcon = farmOnlineMarkerIcon;
        let markerClass = CLASS_MARKER_ON;
        if (smartFarm["online"] == false) {
            markerIcon = farmOfflineMarkerIcon;
            markerClass = CLASS_MARKER_OFF
        }
        let marker = new MarkerWithLabel({
            position     : farmLocation,
            map          : map,
            icon         : markerIcon,
            draggable    : false,
            labelContent : smartFarm["name"].toUpperCase(),
            labelClass   : markerClass,
            labelAnchor  : new google.maps.Point(0, -5),
        });

        markersZIndex++;

        // Extend the bounds to include the marker's position.
        bounds.extend(marker.position);

        // Create an info window.
        let infoWindowContent = getFarmInfoWindowContent(smartFarm["main_controller"]);
        let infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        infoWindow.setZIndex(markersZIndex);

        // Add the info window to the windows dictionary.
        farmWindows[smartFarm["main_controller"]] = infoWindow;

        // Add the marker to the markers dictionary.
        farmMarkers[smartFarm["main_controller"]] = marker;

        // Add a click listener to toggle the info window.
        marker.addListener("click", () => {
            marker.setZIndex(markersZIndex);
            farmWindows[smartFarm["main_controller"]].setZIndex(markersZIndex);
            markersZIndex++;
            toggleInfoWindow(smartFarm["main_controller"]);
        });

        // Add a new farm entry to the list of farms.
        let farmDivContent = FARM_LIST_ENTRY;
        farmDivContent = farmDivContent.replace(/@@ID@@/g, smartFarm["main_controller"]);
        farmDivContent = farmDivContent.replace(/@@NAME@@/g, smartFarm["name"].toUpperCase());
        let farmDiv = document.createElement("div");
        farmDiv.innerHTML = farmDivContent;
        $("#farms-list").append(farmDiv);
    }

    // Fit the map to the newly inclusive bounds.
    map.fitBounds(bounds);
    map.panToBounds(bounds);

    // Restore the zoom level after the map is done scaling.
    var listener = map.addListener("idle", () => {
        map.setZoom(5);
        google.maps.event.removeListener(listener);
    });

    // Hide the loading panel of the map.
    hidePopup($(".map-loading-wrapper"), $(".popup-loading"));
}

// Generates and returns the content of the information window for the farm with the given ID.
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

// Shows or hides the info window corresponding to the farm with the given ID.
function toggleInfoWindow(farmID) {
   let infoWindow = farmWindows[farmID];
   if (infoWindow != null) {
       let infoWindowMap = infoWindow.getMap();
       if (infoWindowMap !== null && typeof infoWindowMap !== "undefined") {
           infoWindow.close();
       } else if (farmMarkers[farmID] != null) {
           infoWindow.setContent(getFarmInfoWindowContent(farmID));
           infoWindow.open(map, farmMarkers[farmID]);
       }
   }
}

//        popup_info = { 
//    type: 'Feature', 
//    geometry: { type:'Point',coordinates:[ result[n]['longitude'],result[n]['latitude']],},
//    properties: { title:  result[n]['name'],description:"des1",'iconsize':[80,80] }
//}

// Shows the info window of the farm with the given ID.
function showPopup(farmID) {
    let Popup = farmPopups[farmID];
    let marker = farmMarkers[farmID];
    if (Popup == null || farmMarkers[farmID] == null)
        return;

    // Pan to the marker location.
    let markerLoc = {
        center: [farmMarker[farmID].longitude, farmMarker[farmID].latitude],
        zoom: 7,
        pitch: 45 
        }
    
    map.flyTo(markerLoc);

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