// Where the places in content/travel.md's ## log are. A name the log uses → its region (a country
// or US state, spelled as on the map) and, for towns, a [lat, lon] for its dot on the map.
// Add a line here when the log gets a new town; names are matched without case or accents.
// A region name on its own ("Costa Rica", "North Carolina") needs no entry — it counts for the region, no dot.
export type Gazetteer = Record<string, { region: string; at?: [number, number]; aka?: string[] }>

export const PLACES: Gazetteer = {
  // Guatemala
  Antigua: { region: "Guatemala", at: [14.5586, -90.7295] },
  "El Paredón": { region: "Guatemala", at: [13.918, -91.075], aka: ["El Paredon"] },

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
}
