// mapboxgl.accessToken = 'pk.eyJ1IjoiYmFkZWp1d29uIiwiYSI6ImNsN3d5eXlkajBodDUzdnViYTlncXpvMWwifQ.4OVdhIpqJlopkgNkl45Arg';

// const map = new mapboxgl.Map({
// container: 'map',
// style: 'mapbox://styles/badejuwon/cl7xynqe4000014o5n7c5q3pn',
// center: [8, 10],
// zoom: 10, 
// interactive: false})


const mapBox=document.getElementById('map')
const loc= JSON.parse(mapBox.dataset.loc)
mapboxgl.accessToken = 'pk.eyJ1IjoiYmFkZWp1d29uIiwiYSI6ImNsN3d5eXlkajBodDUzdnViYTlncXpvMWwifQ.4OVdhIpqJlopkgNkl45Arg';
const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/badejuwon/cl7xx9lwh003a15qofe584udp',
        center: loc.coordinates,
        zoom: 14, 
        scrollZooom: false,
        interactive: false
    });
//Create Marker
const el = document.createElement('div');
el.className = 'marker';


//Add Marker
new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
}).setLngLat(loc.coordinates)
  .addTo(map)

  new mapboxgl.Popup({
    offset: 50
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Address ${loc.address}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);


