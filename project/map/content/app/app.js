
// Public variable accessing html elements
let element = {
    searchInput: document.getElementById("search-input"),
    searchElement: document.getElementById("search"),
    searchResult: document.getElementById("search-result")
};

// The input element to focus
element.searchInput.focus();

// To hide the result element in the initial
element.searchResult.style.display = "none";

// Map screen load section
let map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
    })
});

// A method for obtaining data in a synchronized manner
let GetData = (url, type) => {
    let promise = new Promise((resolve, reject) => {
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = () => {
            resolve(JSON.parse(xhttp.responseText));
        };

        xhttp.open(type, url, true);
        xhttp.send();
    });

    return promise;
};

// Data input detection method
let SearchKeyup = () => {
    if (element.searchInput.value.length > 0) {
        element.searchElement.style.top = "25%";

        GetData("./config.json", "GET").then((data) => {
            if (data) {
                let url = data.SearchMapOptions.url;
                url = url.replace("{searchText}", element.searchInput.value);

                GetData(url, "GET").then((data) => {
                    console.clear();

                    if (data && data.length > 0 && element.searchInput.value.length > 0) {
                        element.searchResult.innerHTML = "";

                        data.forEach(item => {
                            let div = document.createElement("div");
                            div.innerText = item.display_name;
                            div.classList.add("search-result-item");

                            div.onclick = () => {
                                element.searchResult.innerHTML = "";
                                element.searchResult.style.display = "none";

                                element.searchInput.value = item.display_name;

                                let bbox = item.boundingbox;
                                let order = [parseFloat(bbox[2]), parseFloat(bbox[0]), parseFloat(bbox[3]), parseFloat(bbox[1])];
                                let extent = new ol.extent.applyTransform(order, new ol.proj.getTransform('EPSG:4326', 'EPSG:3857'));

                                map.getView().fit(extent, map.getSize());
                            };

                            element.searchResult.appendChild(div);
                        });

                        let closeDiv = document.createElement("div");
                        closeDiv.innerText = "X";
                        closeDiv.classList.add("search-result-close");

                        closeDiv.onclick = () => {
                            element.searchResult.style.display = "none";
                        };

                        element.searchResult.appendChild(closeDiv);

                        element.searchResult.style.display = "";
                    }
                    else {
                        element.searchResult.style.display = "none";
                    }
                });
            }
        });
    }
    else {
        element.searchElement.style.top = "50%";
        element.searchResult.style.display = "none";
    }
};