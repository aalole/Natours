export const displayMap = locations => { 
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWFsb2xlIiwiYSI6ImNrZjVheHVvZTAzNXQycm96aG9oc2Y3bWMifQ.BQI9Y9iEny2BhqoBZnmN3w';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/aalole/ckf5c02db2h8h19r2ourc4s2p', 
scrollZoom: false
// center: [-118.113491, 34.111745], 
// zoom: 10, 
// interactive: false
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach(loc => { 
    // Create marker
    const el = document.createElement('div'); 
    el.className = 'marker'; 

    // Add the marker
    new mapboxgl.Marker({ 
        element: el, 
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    // Add the marker
    new mapboxgl.Popup({ 
        offset: 30
    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map)
    //Extend map bound to include current location
    bounds.extend(loc.coordinates);
}); 
map.fitBounds(bounds, { 
    padding: { 
        top: 200, 
        bottom: 140, 
        left: 100, 
        right: 100
    }
})
}