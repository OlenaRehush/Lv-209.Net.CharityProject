var map;
var markers = {};
markers.Points = [];
markers.Visibilty = [];
markers.Type = [];
var errorWindowStatus;
var selectedSpheres = [];
var markersWorkers = [];
var infoWindows = [];
var organizationsShow = true, companiesShow = true;
var socialWorkers;
var iconBase = 'http://maps.google.com/mapfiles/ms/icons/';
var icons = {
    organization: {
        name: 'Організація',
        icon: iconBase + 'pink-dot.png'
    },
    company: {
        name: 'Компанія',
        icon: iconBase + 'purple-dot.png'
    },
    socialworker: {
        name: 'Соціальний працівник',
        icon: iconBase + 'red-dot.png'
    }
};

var mapOptions;

//When map is loaded we should setup our map and get data from database
$(document).ready(function () {
    var LvivRegion = new google.maps.LatLng(49.8414237, 24.0306156);
    mapOptions = {
        zoom: 14,
        minZoom: 12,
        maxZoom: 18,
        center: LvivRegion,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        streetViewControl: false,
        noClear: true,
        zoomControl: false,
    }
    errorWindowStatus = false;
    GetOrganizations(map);
    UpdateMap();
});

//Beautiful Home Page fading in
function ShowHomePage() {
    $('.loader').hide()
    $('#homePageContent').fadeIn("slow");
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    var legend = document.getElementById('map_legend');
    for (var key in icons) {
        var type = icons[key];
        var name = type.name;
        var icon = type.icon;
        var div = document.createElement('div');
        div.innerHTML = '<img src="' + icon + '"> ' + name;
        legend.appendChild(div);
    }
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
    UpdateMap();
}

//Get checked categories of social workers
function GetSelectedSpheres(){
    selectedSpheres = [];
    $('.spheres input:checked').each(function () {
        selectedSpheres.push($(this).attr('id'));
    });
}

//SetSocialWorkers on Map if them is Checked on social workers categories in popup window
function SetSocialWorkers()
{
    $.each(socialWorkers, function (i, item) {
        if (IdChecked(item.SphereId)) {
            var marker = new google.maps.Marker({
                'position': new google.maps.LatLng(item.Latitude, item.Longitude),
                'map': map,
                'title': item.Name
            });
            marker.setIcon(icons.socialworker.icon)
            var infowindow = new google.maps.InfoWindow({
                content: "<h4>" + ((item.Name != null) ? item.Name : "") + "</h4>" +
                    "<p>" + ((item.Address != null) ? item.Address : "") + "</p>" +
                    "<p>" + ((item.Email != null) ? item.Email : "") + "</p>" +
                    "<p>" + ((item.PhoneNumber != null) ? item.PhoneNumber : "") + "</p>" + 
                    "<p>" + ((item.Description != null) ? item.Description : "") + "</p>",
                maxWidth: 200
            });
            google.maps.event.addListener(marker, 'click', function () {
                closeAllInfoWindows();
                infowindow.open(map, marker)
            });
            markersWorkers.push(marker);
            infoWindows.push(infowindow);
        }
    })
    setWorkersOnMap(map);
    UpdateMap();
}

//When we click on checkboxes with social workers dynamically change markers on the map
$('.sphere-list').click(function () {
    GetSelectedSpheres()
    setWorkersOnMap(null);
    markersWorkers = [];
    SetSocialWorkers();
})
//Getting Social Workers information from database
function GetSocialWorkers() {
    $.ajax({
        type: "GET",
        url: "/api/socialworkers/allmarkers",
        async: true,
        success: function (input) {
            socialWorkers = input
            ShowHomePage();
            UpdateMap();
        },
        error: function () {
            console.log("Не вдалося завантажити соціальних працівників");
            ErrorMessage();
        },
        dataType: "json"
    })
}
//Beautiful popup window closing or opening
$('.entypo-folder').click(function () {
    if ($('.b-popup#socialworkerspopup').is(":visible")) {
        $('.b-popup#socialworkerspopup').fadeOut("slow");
    }
    else {
        $('.b-popup#socialworkerspopup').fadeIn("slow");
    }
})
//Beautiful popup window closing 
$('#close-window-button.socialworkers').click(function () {
    $('.b-popup#socialworkerspopup').fadeOut("slow");
})
//This function check what social workers is checked in this moment
function IdChecked(id) {
    for (var i = 0; i < selectedSpheres.length; i++)
        if (id == selectedSpheres[i])
            return true;
    return false;
}
//Button clear all social workers on popup window with social workers
$('#btn-clear').click(function () {
    setWorkersOnMap(null);
    markersWorkers = [];
    $('.spheres input:checked').each(function () {
        $(this).prop('checked', false);
    });
})

//Button show all social workers on popup window with social workers
$('#btn-showall').click(function () {
    setWorkersOnMap(null);
    markersWorkers = [];
    $('.spheres input').each(function () {
        $(this).prop('checked', true);
    });
    GetSelectedSpheres()
    SetSocialWorkers();
    setWorkersOnMap(map)
})

//When we click on organizations button show or hide that one
$('.entypo-users').click(function () {
    organizationsShow = !organizationsShow;
    UpdateMap();
})

//When we click on companies button show or hide that one
$('.entypo-box').click(function () {
    companiesShow = !companiesShow;
    UpdateMap();
})

//Get Organizations from database
function GetOrganizations(map) {
    $.ajax({
        type: "GET",
        url: "/api/organizations/allorganizations",
        async: true,
        success: function (input) {
            data = input
            $.each(data, function (i, item) {
                var marker = new google.maps.Marker({
                    'position': new google.maps.LatLng(item.Latitude, item.Longitude),
                    'map': map,
                    'title': item.Name
                });
                marker.setIcon(icons.organization.icon)
                var infowindow = new google.maps.InfoWindow({
                    content: "<h4>" + ((item.Name) != null ? item.Name : "") + "</h4>" +
                        "<p>" + ((item.WebSite != null) ? '<a href="' + item.WebSite + '" target="_blank">Веб-сайт</a>' : "") + "</p>" +
                        "<p>" + ((item.Address != null) ? item.Address : "") + "</p>" +    
                        "<p><a href='/InfoPage/" + item.Id + "'>Деталі...</a></p>",
                    maxWidth: 200
                });
                google.maps.event.addListener(marker, 'click', function () {
                    closeAllInfoWindows();
                    infowindow.open(map, marker)
                });
                markers.Points.push(marker);
                infoWindows.push(infowindow);
                markers.Type.push("organization");
                markers.Visibilty.push(true);
            })
            GetCompanies(map);
            UpdateMap();
        },
        error: function () {
            console.log("Не вдалося завантажити організації");
            ErrorMessage();
            GetCompanies(map);
            UpdateMap();
        },
        dataType: "json"
    })
}

//Get Companies from database
function GetCompanies(map) {
    var data;
    $.ajax({
        type: "GET",
        url: "/api/companies/allcompanies",
        async: true,
        success: function (input) {
            data = input
            $.each(data, function (i, item) {
                var marker = new google.maps.Marker({
                    'position': new google.maps.LatLng(item.Latitude, item.Longitude),
                    'map': map,
                    'title': item.Name
                });
                marker.setIcon(icons.company.icon)
                var infowindow = new google.maps.InfoWindow({
                    content: "<h4>" + ((item.Name) != null ? item.Name : "") + "</h4>" +
                        "<p>" + ((item.WebSite != null) ? '<a href="' + item.WebSite + '" target="_blank">Веб-сайт</a>' : "") + "</p>" +
                        "<p>" + ((item.Address != null) ? item.Address : "") + "</p>" +
                        "<p><a href='/InfoPage/" + item.Id + "'>Деталі...</a></p>",
                    maxWidth: 200
                });
                google.maps.event.addListener(marker, 'click', function () {
                    closeAllInfoWindows();
                    infowindow.open(map, marker);
                });
                markers.Points.push(marker);
                infoWindows.push(infowindow);
                markers.Type.push("company");
                markers.Visibilty.push(true);
            })
            GetSocialWorkers();
            UpdateMap();
        },
        error: function () {
            console.log("Не вдалося завантажити компанії");
            ErrorMessage();
            GetSocialWorkers();
            UpdateMap();
        },
        dataType: "json"
    })
}

//Close all opened info windows, we use it always when open another info window
function closeAllInfoWindows() {
    for (var i = 0; i < infoWindows.length; i++) {
        infoWindows[i].close();
    }
}
//Show error message if something going wrong with markers downloading
function ErrorMessage() {
    if (errorWindowStatus == false) {
        var mainDiv = document.getElementById("homePageContent")
        var div = document.createElement('div');
        div.innerHTML = '<div class="b-popup" id="error" style="width:275px;height:45px;top:0;left:0;margin:100px 25px;"><div class="b-popup-content" style="text-align:center;">При завантажені сталась помилка. Спробуйте оновити сторінку.</div></div>'
        mainDiv.appendChild(div);
        errorWindowStatus = true;
    }
}
//Show all markers on map with Visibility - true
function setMapOnAll(map) {
    for (var i = 0; i < markers.Points.length; i++) {
        if (markers.Visibilty[i] == true)
            markers.Points[i].setMap(map);
    }
}

//Show social workers on map
function setWorkersOnMap(map) {
    for (var i = 0; i < markersWorkers.length; i++) {
        markersWorkers[i].setMap(map);
    }
}

//Clear all markers on map
function clearMarkers() {
    setMapOnAll(null);
}

//When we disable company or organizations markers we use this function to change state one of the type of markers (hide)
function HideMarkers(type) {
    for (var i = 0; i < markers.Points.length; i++) {
        if (markers.Type[i] == type)
            markers.Visibilty[i] = false;
    }

}

//When we disable company or organizations markers we use this function to change state one of the type of markers (show)
function ShowMarkers(type) {
    for (var i = 0; i < markers.Points.length; i++) {
        if (markers.Type[i] == type)
            markers.Visibilty[i] = true;
    }

}

//We use this function when we want to renew markers on map.
function UpdateMap() {
    clearMarkers();
    if (companiesShow == false)
        HideMarkers('company');
    else
        ShowMarkers('company');
    if (organizationsShow == false)
        HideMarkers('organization');
    else
        ShowMarkers('organization');
    setMapOnAll(map);
}