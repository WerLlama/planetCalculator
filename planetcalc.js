//Keplerian elements for the planets in the solar system
//a is semimajor axis in au
//e is eccentricity in rad
//i is inclination in degrees
//Ω is longitude of the ascending node in degrees (ascending node = where the orbiting body passes through the plane of the sun upwards)
//ω is longitude of perihelion in degrees (perihelion = closest to sun, generalized form is periapsis or closest apsis)
//L0 is the starting heliocentric longitude and/or mean longitude
//Tp is ime of Perihelion Passage (Tp) = 0 implies that the reference epoch is chosen to be when each planet passes through its perihelion.
const planetData = [
    { name: 'Mercury', a: 0.3871, e: 0.2056, i: 7.005, Ω: 48.3396, ω: 77.4577, L0: 252.2503, Tp: 0, color: 0x9c9c9c, disR: 3 },
    { name: 'Venus', a: 0.7233, e: 0.0068, i: 3.3947, Ω: 76.6807, ω: 131.53298, L0: 181.97973, Tp: 0, color: 0xffaa33, disR: 5 },
    { name: 'Earth', a: 1.0000, e: 0.0167, i: 0.00005, Ω: -11.2606, ω: 102.94719, L0: 100.46435, Tp: 0, color: 0x0000ff, disR: 6.5 },
    { name: 'Mars', a: 1.5237, e: 0.0934, i: 1.8497, Ω: 49.5581, ω: 336.0602, L0: 355.4533, Tp: 0, color: 0xff5733, disR: 8 },
    { name: 'Jupiter', a: 5.2029, e: 0.0483, i: 1.3047, Ω: 100.5562, ω: 14.75385, L0: 34.40438, Tp: 0, color: 0xff5733, disR: 10 },
    { name: 'Saturn', a: 9.5370, e: 0.0542, i: 2.4853, Ω: 113.715, ω: 92.43194, L0: 49.94432, Tp: 0, color: 0xff5733, disR: 11 },
    { name: 'Uranus', a: 19.1913, e: 0.0472, i: 0.7726, Ω: 74.2299, ω: 170.96424, L0: 313.23218, Tp: 0, color: 0x00bfff, disR: 13 },
    { name: 'Neptune', a: 30.0690, e: 0.0086, i: 1.7697, Ω: 131.7217, ω: 44.97135, L0: 304.88003, Tp: 0, color: 0x00ffff, disR: 15 }
    ];

      
//set up scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const animationContainer = document.getElementById('animationContainer');
renderer.setSize(600, 400); // Set renderer size based on container dimensions
animationContainer.appendChild(renderer.domElement);

// Create a sun
const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
const light = new THREE.DirectionalLight(0xffffff, 1);

//Create planets
const planetGeometries = {}; // Store geometries to avoid redundant creation

function calculatePositions() {
         
    //clear any previous animation
    clearScene();

    //(re)initialize the scene and add the sun and lighting
    renderer.setSize(600, 400); // Set renderer size based on container dimensions
    animationContainer.appendChild(renderer.domElement);
    scene.add(sun);
    light.position.set(0, 0, 0); // Sun's position
    scene.add(light);

    // Set camera position
    camera.position.set(0, 0, 40); // Move the camera up along the y-axis
    camera.lookAt(0, 0, 0); // Look at the origin (sun)

    // Get the user input date
    const dateInput = document.getElementById("dateInput").value;
    const currentDate = new Date(dateInput);

    // Calculate Julian Day (JD)
    const JD = calculateJulianDay(currentDate);
  
    // Results array to store the results for all planets
    const results = [];
        
    // Calculate L, B, and r for each planet
    planetData.forEach(planet => {
        // Orbital period (in days)
        const P = 365.25 * Math.pow(planet.a, 1.5); // Kepler's third law
                
        // Calculate mean anomaly (M) using JD in days not centuries
        const M = normalizeDegrees(planet.L0 + (360 / P) * (JD*36525 - planet.Tp));
                
        // Calculate heliocentric longitude (L)
        // remember that longitude of perihelion is essentially the "starting point" for the Mean Anomaly 
        const L = M;
       
         // Add heliocentric longitude (L) to the planet data
         planet.L = L;

        // Calculate heliocentric latitude (B)
        const f = M; // Approximating true anomaly as mean anomaly for simplicity
        const B = Math.atan((Math.tan(planet.i * Math.PI / 180) * Math.sin(planet.ω + f)) * Math.cos(planet.Ω * Math.PI / 180) + (Math.tan(planet.i * Math.PI / 180) * Math.cos(planet.ω + f)) * Math.sin(planet.Ω * Math.PI / 180));
        
        // Calculate distance from the Sun (r)
        //const r = planet.a * (1 - planet.e**2) / (1 + planet.e * Math.cos(f-planet.ω));
        //const r = planet.a * (1 + planet.e * Math.sin(degreesToRadians(L-angleRelativeTo270(planet.ω))))
        const r = planet.a * (1+ planet.e * calculateAngle(planet.ω,L))
        planet.r = r;
        
        // Add results to the results array
        results.push({ name: planet.name, L: L, B: B, r: r });

        //create planet animations
        const planetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const planetMaterial = new THREE.MeshBasicMaterial({ color: planet.color });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);

        // Calculate the position of the planet based on its heliocentric longitude
        const distanceFromSun = planet.disR * 2; // Adjust scale for visualization
        const position = calculatePositionFromLongitude(planet.L, distanceFromSun);
        planetMesh.position.copy(position);
        scene.add(planetMesh);

        
        
    });
       
    // Display the results
    displayResults(results, currentDate, JD*36525);
    
}

function calculateJulianDay(date) {
   // Get the date input element
    const dateInput = document.getElementById("dateInput");

    // If the date input field is empty, use the current date and time
    if (!dateInput.value) {
        date = new Date(); // Current date and time
    }
                
    // Calculate Julian Day (JD) for a given date
    // Get the date components
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    // Calculate the Julian Day for the date component
    let JD = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
        Math.floor(275 * month / 9) + day + 1721013.5;

    // Calculate the fraction of the day
    const fractionOfDay = (hours / 24) + (minutes / (24 * 60)) + (seconds / (24 * 60 * 60));

    // Add the fraction of the day to the Julian Day
    JD += fractionOfDay;

    // Adjust JD relative to J2000 and converted to centuries
    JD -= 2451545.0;
    JD /= 36525;

    return JD;
}

function displayResults(results, currentDate, JD) {
    
    // Format the date string to include time
    const formattedDate = currentDate.toLocaleString();
    const JDtotal = JD+2451545.0

    // Display the results in the output div
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = `
        <h3>Planet positions on ${formattedDate}</h3>
        <p>The equivalent Julian day is ${JDtotal.toFixed(2)}, which is ${JD.toFixed(2)} relative to the J2000 Epoch</p>
        <table>
            <tr>
                <th>Planet</th>
                <th>Heliocentric Longitude (L)</th>
                <th>Heliocentric Latitude (B)</th>
                <th>Distance (r)</th>
            </tr>
            ${results.map(result => `
                <tr>
                    <td>${result.name}</td>
                    <td>${result.L.toFixed(2)} degrees</td>
                    <td>${result.B.toFixed(2)} degrees</td>
                    <td>${result.r.toFixed(2)} au</td>
                </tr>
            `).join('')}
        </table>
    `;
}

function calculateAngle(omega, current) {

    if(omega>=270) {
        let omegaRel = omega - 270;
        current-=omegaRel
    } else {
        let omegaRel = Math.abs(omega-270);
        current+=omegaRel;
    }


    return Math.sin(degreesToRadians(current))

}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function normalizeDegrees(degrees) {
    // Calculate the remainder when dividing by 360
    let normalized = degrees % 360;

    // If the result is negative, add 360 to make it positive
    if (normalized < 0) {
        normalized += 360;
    }

    return normalized;
}

// Function to calculate position from heliocentric longitude
function calculatePositionFromLongitude(longitude, distance) {
    
    const angle = THREE.Math.degToRad(longitude);
    const x = distance * Math.cos(angle);
    const y = distance * Math.sin(angle);
    return new THREE.Vector3(x, y, 0);
}

function createPlanetLabel(planet) {
    const label = new THREE.TextSprite({
        textSize: 0.5,
        texture: {
            text: planet.name,
            fontFamily: 'Arial, sans-serif',
        }
    });

    // Position label relative to the planet's position
    const planetPosition = calculatePositionFromLongitude(planet.L, planet.disR * 2); // Assuming the same scale as the planets
    label.position.copy(planetPosition);
    label.position.y += 0.5; // Offset label slightly above the planet

    return label;
}

// Render loop
function animate() {
    
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function clearScene() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
}

calculatePositions();
animate();