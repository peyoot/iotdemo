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
 


const POP_UP_CONTENT = "" +
    "<div class='marker-info'>" +
    "    <div class='marker-info-title'>" +
    "        @@NAME@@" +
    "    </div>" +
    "   <div class='marker-info-desc'> @@DESCRIPTION@@ </div>      " +
    "    <hr/>" +
    "    <div class='marker-info-element'>" + 

    "        <div class='marker-info-icon'>" +
    "            <img src='../static/images/info_status.png' height='36px' alt='Status' />" +
    "        </div>" +
    "        <div class='marker-info-value @@STATUS-CLASS@@'>" +
    "            @@STATUS@@" +
    "        </div>" +
    "         <br/> " +
    "       <span style='padding=5px'>Installed Capacity:  @@FARMCAPACITY@@  MW<br/>" +
    "       Current Power:  @@FARMCURRENT@@  MW <br/>   </span>" +

    "    </div>" +
 
    "    <div class='marker-info-button-container' style='margin-top: 5px;'>" +
    "        <button id='@@ID@@-BUTTON' class='marker-info-button' onclick=\"exploreFarm('@@ID@@')\">Explore</button>" +
    "        <div id='@@ID@@-BUTTON-LOADING' class='marker-info-button-loading' style='display: none'>" +
    "    </div>" +
    "</div>";

*/

    const POP_UP_CONTENT = "" +
    "<div class='marker-info'>" +
    "    <div class='marker-info-title'>" +
    "        @@NAME@@" +
    "    </div>" +
    "   <div class='marker-info-desc'> @@DESCRIPTION@@ </div>      " +
    "    <hr/>" +
    "    <div class='marker-info-element'>" + 

    "        <div class='marker-info-icon'>" +
    "            <img src='../static/images/info_status.png' height='36px' alt='Status' />" +
    "        <span class='marker-info-value @@STATUS-CLASS@@'>" +
    "            @@STATUS@@" +
    "        </span>" +
    "        </div>" +

    "         <br/> " +
    "       <span style='padding=5px'>Installed Capacity:  @@FARMCAPACITY@@  MW<br/>" +
    "       Current Power:  @@FARMCURRENT@@  MW <br/>   </span>" +

    "    </div>" +
 
    "    <div class='marker-info-button-container' style='margin-top: 5px;'>" +
    "        <button id='@@ID@@-BUTTON' class='marker-info-button' onclick=\"exploreFarm('@@ID@@')\">Explore</button>" +
    "        <div id='@@ID@@-BUTTON-LOADING' class='marker-info-button-loading' style='display: none'>" +
    "    </div>" +
    "</div>";

const FARM_LIST_ENTRY = "" +
    "<div onclick='showPopup(\"@@ID@@\")' class='farms-list-entry'>" +
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
var farmPopup = {};
var farmFeatureList = [];


var solarFarms = {};
var farmPopups = {};

var exploringFarm = false;

var markersZIndex = 0;


//var data = JSON.parse("{{contexts|escapejs}}");
//mapboxgl.accessToken = data.token ;

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


//execute after views.py response with a list of farm (from database)
function getSolarFarms() {
    //construct each solarfarm
    for ( let item in sitelist ) {
        solarfarms[item.id].name = item.name
        solarfarms[item.id].longitude = item.longitude
        solarfarms[item.id].latitude = item.latitude
        solarfarms[item.id].capability = 30
        solarfarms[item.id].currentpower = (Math.random()*(15-10) + 10).toFixed(2)
    
        // Add a new farm entry to the list of farms.
        let farmDivContent = FARM_LIST_ENTRY;
        farmDivContent = farmDivContent.replace(/@@ID@@/g, solarFarm["id"]);
        farmDivContent = farmDivContent.replace(/@@NAME@@/g, smartFarm["name"].toUpperCase());
        let farmDiv = document.createElement("div");
        farmDiv.innerHTML = farmDivContent;
        $("#farms-list").append(farmDiv);
    }
}

// get BJ time
function gettime() {
    return new Date(new Date().getTime()+(parseInt(new Date().getTimezoneOffset()/60) + 8)*3600*1000).getHours();
}

// Callback executed when the list of farms is requested.
function getSolarFarmsCallback(response) {
    // First, check if there was any error in the request.
    if (response["error_msg"] != null) {
        // Show toast with error.
        toastr.error(response["error_msg"]);
        $("#info-title").text(response["error_title"]);
        $("#info-message").html(response["error_msg"] + response["error_guide"]);

        return;
    }
    if (response["error"] != null) {
        // Show toast with error.
        toastr.error(response["error"]);
        $("#info-message").html(response["error"]);

        return;
    }

    // Get the farms from the JSON response.
    let readFarms = response["farms"];

    // Check if the list of farms contains any farm.
    if (readFarms == null || readFarms.length == 0)
        return;



    // Create the farm online marker icon.
    let farmOnlineMarkerIcon = {
        url: "static/images/map_marker.png",
  
    };

    // Create the farm offline marker icon.
    let farmOfflineMarkerIcon = {
        url: "static/images/map_marker_off.png",

    };


    
    // Process farms.
    for (let solarFarm of readFarms) {
        // Add the farm to the dictionary.
        solarFarms[solarFarm["id"]] = solarFarm;

        // Get farm location.
        let farmLocation = [Number(solarFarm.longitude),Number(solarFarm.latitude)];
        let farmCapacity = solarFarm.capacity;
        let farmStatus = "In Operation"
        let farmCurrent = (Math.random()*(2*farmCapacity/3-farmCapacity/2) + farmCapacity/2).toFixed(2);
        timenow = gettime();
        if(timenow >= 18 && timenow <=23 || timenow >=0 && timenow <=6) {
            farmCurrent = 0;
            farmStatus = "Closed"
        }


        // now create marker and popup

        let farmPopupHTML = POP_UP_CONTENT;
        farmPopupHTML = farmPopupHTML.replace(/@@NAME@@/g, solarFarm.name);
        farmPopupHTML = farmPopupHTML.replace(/@@DESCRIPTION@@/g, solarFarm.description);
        farmPopupHTML = farmPopupHTML.replace(/@@FARMCAPACITY@@/g, farmCapacity);
        farmPopupHTML = farmPopupHTML.replace(/@@FARMCURRENT@@/g, farmCurrent);
        farmPopupHTML = farmPopupHTML.replace(/@@STATUS@@/g, farmStatus);

        farmPopup = {
            farmLocation: farmLocation,
            farmCapacity: farmCapacity,
            farmCurrent: farmCurrent,
            farmTitle: solarFarm.name,
            farmDescription: solarFarm.description,
            farmPopupHTML: farmPopupHTML

        }

        farmPopups[solarFarm["id"]] = farmPopup;

        // Create a marker for the farm.
        // original to get farmPopup and farmMarker which used in showPopup(solarFarmID)
        // but actually we'll add marker just here, and show popup just fly to 

        // Add a new farm entry to the list of farms.
        let farmDivContent = FARM_LIST_ENTRY;
        farmDivContent = farmDivContent.replace(/@@ID@@/g, solarFarm["id"]);
        farmDivContent = farmDivContent.replace(/@@NAME@@/g, solarFarm["name"].toUpperCase());
        let farmDiv = document.createElement("div");
        farmDiv.innerHTML = farmDivContent;
        $("#farms-list").append(farmDiv);

        showMarker(solarFarm["id"]);

    }

}

function showMarker(solarFarmID) {
    let Popup = farmPopups[solarFarmID];
    /*let marker = farmMarkers[solarFarmID];*/
    if (Popup == null )
        return;

    const markerLoc = Popup.farmLocation;

    
   
    // Create a DOM element for each marker.
    const el = document.createElement('div');
    el.id = 'marker';

    const mapbox_popup = new mapboxgl.Popup({ offset: 25 }).setHTML(Popup.farmPopupHTML);

    new mapboxgl.Marker(el)
    .setLngLat(markerLoc)
    .setPopup(mapbox_popup)
    .addTo(map);

}

function showPopup(solarFarmID) {
    let Popup = farmPopups[solarFarmID];
    /*let marker = farmMarkers[solarFarmID];*/
    if (Popup == null )
        return;

    const markerLoc = Popup.farmLocation;

    map.flyTo({ center: markerLoc });
    mapbox_popup = new mapboxgl.Popup({ offset: 25 }).setHTML(Popup.farmPopupHTML);
    const popups = document.getElementsByClassName("mapboxgl-popup");
    if (popups.length) {
        popups[0].remove();
    }

    mapbox_popup.setLngLat(markerLoc).addTo(map);
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