// Where the places in content/travel.md's ## log are. A name the log uses → its region (a country
// or US state, spelled as on the map) and, for towns, a [lat, lon] for its dot on the map.
// Add a line here when the log gets a new town; names are matched without case or accents.
// A region name on its own ("Costa Rica", "North Carolina") needs no entry — it counts for the region, no dot.
export type Gazetteer = Record<string, { region: string; at?: [number, number]; aka?: string[] }>

export const PLACES: Gazetteer = {
  // Guatemala
  Antigua: { region: "Guatemala", at: [14.5586, -90.7295] },
  "El Paredón": { region: "Guatemala", at: [13.918, -91.075], aka: ["El Paredon"] },
  "Guatemala City": { region: "Guatemala", at: [14.6349, -90.5069] },
  "San Pedro La Laguna": { region: "Guatemala", at: [14.6936, -91.2725] },
  Pacaya: { region: "Guatemala", at: [14.381, -90.601] },

  // El Salvador
  "Santa Ana": { region: "El Salvador", at: [13.994, -89.559] },
  "La Libertad": { region: "El Salvador", at: [13.488, -89.322] },
  "El Tunco": { region: "El Salvador", at: [13.493, -89.383] },
  Juayúa: { region: "El Salvador", at: [13.843, -89.745], aka: ["Juyuca", "Juayua"] },
  Apaneca: { region: "El Salvador", at: [13.859, -89.803], aka: ["Apanece"] },
  Ataco: { region: "El Salvador", at: [13.87, -89.848], aka: ["Concepcion de Ataco"] },

  // Costa Rica
  "San José": { region: "Costa Rica", at: [9.9281, -84.0907], aka: ["San Jose"] },
  "La Fortuna": { region: "Costa Rica", at: [10.471, -84.645] },
  Turrialba: { region: "Costa Rica", at: [9.905, -83.683] },
  "North of San José": { region: "Costa Rica", aka: ["North of San Jose"] },

  // Puerto Rico
  "San Juan": { region: "Puerto Rico", at: [18.4655, -66.1057] },
  "Old San Juan": { region: "Puerto Rico", at: [18.466, -66.118] },
  Piñones: { region: "Puerto Rico", at: [18.438, -65.99], aka: ["Pinones"] },

  // Colombia
  Cartagena: { region: "Colombia", at: [10.391, -75.4794] },
  Barranquilla: { region: "Colombia", at: [10.9685, -74.7813] },
  "Santa Marta": { region: "Colombia", at: [11.2408, -74.199] },
  Palomino: { region: "Colombia", at: [11.248, -73.56] },
  Minca: { region: "Colombia", at: [11.144, -74.118] },
  Bogotá: { region: "Colombia", at: [4.711, -74.0721], aka: ["Bogota"] },
  Medellín: { region: "Colombia", at: [6.2442, -75.5812], aka: ["Medellin"] },

  // US
  "Duke University": { region: "North Carolina", at: [36.0014, -78.9382], aka: ["Duke", "Durham"] },
  "Myrtle Beach": { region: "South Carolina", at: [33.6891, -78.8867] },
  "Daytona Beach": { region: "Florida", at: [29.2108, -81.0228] },
  Middletown: { region: "New Jersey", at: [40.394, -74.117], aka: ["Middletown NJ"] },
  NYC: { region: "New York", at: [40.7128, -74.006], aka: ["New York City"] },
  Savannah: { region: "Georgia", at: [32.0809, -81.0912] },
  "Camp Washington": { region: "Maine", at: [44.2737, -69.3672] },
  Thomaston: { region: "Maine", at: [44.079, -69.1817] },
  "Cabbage Island": { region: "Maine", at: [43.853, -69.628] },
  Lincoln: { region: "New Hampshire", at: [44.0456, -71.6704] },
  Meredith: { region: "New Hampshire", at: [43.6576, -71.5003] },
  Franconia: { region: "New Hampshire", at: [44.2273, -71.7475] },
  Pawtucket: { region: "Rhode Island", at: [41.8787, -71.3826] },
  Simsbury: { region: "Connecticut", at: [41.8759, -72.8012] },
  Westminster: { region: "Vermont", at: [43.0742, -72.4559] },
  Burlington: { region: "Vermont", at: [44.4759, -73.2121] },
  Boston: { region: "Massachusetts", at: [42.3601, -71.0589] },
  Sanford: { region: "North Carolina", at: [35.4799, -79.1803] },
  Cary: { region: "North Carolina", at: [35.7915, -78.7811] },
  "Chapel Hill": { region: "North Carolina", at: [35.9132, -79.0558] },
  "Wrightsville Beach": { region: "North Carolina", at: [34.2085, -77.7964] },
  Orlando: { region: "Florida", at: [28.5383, -81.3792] },
  Clearwater: { region: "Florida", at: [27.9659, -82.8001] },
  "Neptune City": { region: "New Jersey", at: [40.2004, -74.0279] },
  "Cape May": { region: "New Jersey", at: [38.9351, -74.906] },
  Hopewell: { region: "New Jersey", at: [40.389, -74.7618] },
  "Sea Bright": { region: "New Jersey", at: [40.3615, -73.9743] },
  "Port Monmouth": { region: "New Jersey", at: [40.4304, -74.0985] },
  Keyport: { region: "New Jersey", at: [40.4335, -74.1999] },
  "Asbury Park": { region: "New Jersey", at: [40.2204, -74.0121] },
  Galloway: { region: "New Jersey", at: [39.4779, -74.4835] },
  "Las Vegas": { region: "Nevada", at: [36.1699, -115.1398] },
  "Grand Canyon": { region: "Arizona", at: [36.0544, -112.1401] },
}
