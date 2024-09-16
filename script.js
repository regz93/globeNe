// Configuration initiale de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('globe-container').appendChild(renderer.domElement);

// Déclaration de la variable globe et de la carte Leaflet
let globe;
let map;
let parisMarker, destinationMarker, routeLine;

// Point de départ (Paris)
const startLat = 48.8696;
const startLng = 2.3484;

// Fonction pour vérifier si les coordonnées sont en Île-de-France
function isInIleDeFrance(lat, lng) {
    // Approximation pour l'Île-de-France
    const isIDF = lat >= 47.0 && lat <= 50.0 && lng >= 1.0 && lng <= 4.5;
    return isIDF;
}

// Fonction pour afficher une carte de l'Île-de-France avec Leaflet
function showMap(lat, lng, data) {
    const globeContainer = document.getElementById('globe-container');
    const mapContainer = document.getElementById('map-container');

    // Masquer le globe et afficher la carte
    globeContainer.style.display = 'none';
    mapContainer.style.display = 'block';

    // Initialiser la carte Leaflet
    if (!map) {
        map = L.map('map-container').setView([lat, lng], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
        }).addTo(map);

        // Ajouter le marqueur de Paris
        parisMarker = L.marker([startLat, startLng]).addTo(map).bindPopup('Siège').openPopup();
    }

    // Supprimer la ligne précédente si elle existe
    if (routeLine) {
        map.removeLayer(routeLine);
    }

    // Ajouter un marqueur pour la destination
    if (destinationMarker) {
        map.removeLayer(destinationMarker);
    }

    // Formater la phrase avec les données du JSON (utilisation de template literals)
    const popupText = `Hey ! Je suis un client du shop ${data[33][1]}  ! J'ai commandé pour ${data[32][1]} euros depuis ${data[35][1]}.`;

    // Ajouter un marqueur pour la destination avec le popup personnalisé et autoPan activé
    destinationMarker = L.marker([lat, lng]).addTo(map).bindPopup(popupText, { autoPan: true }).openPopup();

    // Tracer une ligne droite entre Paris et la destination
    routeLine = L.polyline([[startLat, startLng], [lat, lng]], { color: 'green' }).addTo(map);

    // Zoomer automatiquement pour inclure Paris et la destination avec des bordures ajustées
    const bounds = L.latLngBounds([[startLat, startLng], [lat, lng]]);
    map.fitBounds(bounds, { padding: [50, 50] }); // Ajoute un padding pour éviter que le popup soit coupé

}

// Variable pour suivre si les lumières ont déjà été ajoutées
let lightsAdded = false;

// Fonction pour afficher le globe avec Three.js
function showGlobe(lat, lng) {
    const globeContainer = document.getElementById('globe-container');
    const mapContainer = document.getElementById('map-container');

    // Masquer la carte et afficher le globe
    mapContainer.style.display = 'none';
    globeContainer.style.display = 'block';

    // Initialiser le globe s'il n'existe pas déjà
    if (!globe) {
        globe = new ThreeGlobe()
            .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg') // Texture de la Terre
            .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png'); // Topologie de la Terre

        scene.add(globe);
    }

    // Vérifier si les lumières ont déjà été ajoutées pour éviter leur accumulation
    if (!lightsAdded) {
        // Ajout de la lumière ambiante
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        // Ajout de la lumière directionnelle pour améliorer l'éclairage
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5); // Positionner la lumière
        scene.add(directionalLight);

        // Marquer que les lumières ont été ajoutées
        lightsAdded = true;
    }

    // Ajout des arcs au globe
    const arcsData = [
        { startLat, startLng, endLat: lat, endLng: lng, color: 'green' }, // Paris -> Destination
    ];

    globe.arcsData(arcsData)
        .arcColor('color')
        .arcAltitude(0.2)
        .arcStroke(0.5)
        .arcDashLength(0.3)
        .arcDashGap(2)
        .arcDashInitialGap(0.3)
        .arcDashAnimateTime(2000);

    // Ajustement de la caméra pour capturer les deux points
    adjustCamera(startLat, startLng, lat, lng);
}

// Fonction pour ajuster la caméra pour inclure Paris et la destination
function adjustCamera(startLat, startLng, endLat, endLng) {
    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;

    // Calcul de la distance entre les deux points pour ajuster le zoom
    const distance = calculateDistance(startLat, startLng, endLat, endLng);

    // Ajuster la position de la caméra en fonction de la distance
    const zoomFactor = Math.max(distance / 1000 + 1.5, 2); // Ajuste le zoom pour éviter d'être trop près

    // Conversion des coordonnées géographiques en coordonnées 3D pour la caméra
    const centerCoords = globe.getCoords(midLat, midLng);

    // Positionner la caméra avec un zoom plus adapté
    camera.position.set(centerCoords.x * zoomFactor, centerCoords.y * zoomFactor, centerCoords.z * zoomFactor);

    // Faire en sorte que la caméra regarde le centre
    camera.lookAt(centerCoords.x, centerCoords.y, centerCoords.z);
}



// Fonction pour calculer la distance entre deux points géographiques (Haversine)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = THREE.MathUtils.degToRad(lat2 - lat1);
    const dLng = THREE.MathUtils.degToRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(THREE.MathUtils.degToRad(lat1)) * Math.cos(THREE.MathUtils.degToRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance en kilomètres
    return distance;
}

// Fonction pour récupérer les données
async function fetchData() {
    const response = await fetch('https://script.google.com/macros/s/AKfycbwOltLszBi2RPoNgBmEouIRY7U3S5VIx_C6zrow1M_ck00_FnW8AJm9FNGL8K7VBmRW/exec');
    const data = await response.json();


    // Appeler la fonction pour afficher les données dans le conteneur
    populateDataContainer(data);

    return data;
}

// Fonction pour insérer les données dans le container #data-container
function populateDataContainer(data) {
    const container = document.getElementById('data-container');

    // Efface les anciennes données avant d'insérer les nouvelles
    container.innerHTML = '<h2 class="data-title">Order infos</h2>';

    const price = document.createElement('p');
    price.textContent = `Amount: ${data[32][1]} €`;
    container.appendChild(price);

    const products = document.createElement('p');
    products.textContent = `Eshop: ${data[33][1]}`;
    container.appendChild(products);

    const brand = document.createElement('p');
    brand.textContent = `Customer type: ${data[34][1]}`;
    container.appendChild(brand);

    const city = document.createElement('p');
    city.textContent = `Location: ${data[35][1]}`;
    container.appendChild(city);

    const customerType = document.createElement('p');
    customerType.textContent = `Channel: ${data[36][1]}`;
    container.appendChild(customerType);
}

// Fonction pour démarrer l'application et mettre à jour les données régulièrement
async function initializeGlobe() {
    const updateData = async () => {
        const data = await fetchData();

        const lap = parseFloat(data[31][1].split(",")[0]);
        const lng = parseFloat(data[31][1].split(",")[1]);

        if (isInIleDeFrance(lap, lng)) {
            showMap(lap, lng, data);
        } else {
            showGlobe(lap, lng);
        }
    };

    // Appel initial
    await updateData();

    // Mettre à jour les données toutes les 5 secondes (5000 ms)
    setInterval(updateData, 5000); // Ajuste le délai si nécessaire
}

// Fonction d'animation du globe
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Démarrage de l'application
initializeGlobe();
animate();

// Réajustement de la taille du rendu en cas de redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
