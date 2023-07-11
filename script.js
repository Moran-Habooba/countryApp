// api requests
const Api_Base = "https://restcountries.com/v3.1";

const $countrySelector = document.getElementById("country-selector");
const $countryInformation = document.getElementById("country-information");

init();
async function init() {
  await populateCountrySelector();
  $countrySelector.addEventListener("change", (e) => {
    countriesSelect(e.target.value);
  });
  countriesSelect($countrySelector.value);
}

async function getAllCountriesNames() {
  const url = `${Api_Base}/all?fields=name`;
  const response = await fetch(url);
  return await response.json();
}

async function getCountryByName(officialName) {
  const response = await fetch(
    `${Api_Base}/name/${officialName}?fullText=true`
  );
  const countryInformation = await response.json();
  return countryInformation[0];
}
// getCountryByName("Israel").then(console.log);

// fetch(`${API_BASE}/all`)
//   .then((resp) => resp.json())
//   .then((countries) => {
//     return countries.map((country) => country.timezones);
//   })
//   .then(console.log);

async function countriesSelect(countryName) {
  const countryInformation = await getCountryByName(countryName);
  $countryInformation.innerHTML = renderCountry(countryInformation);
  displayCountryMap(countryName);
}

function renderCountry({
  name: { common: commonName },
  flags: { svg: flagSvg, alt: flagAlt },
  timezones,
  population,
  capital,
  area,
  languages,
  currencies,
}) {
  return `
  <div class="card w-100">
    <img
      src="${flagSvg}"
      class="card-img-top"
      alt="${flagAlt ? flagAlt : `${commonName} flag`}"
    />
    <div id="map"></div>
    <ul class="list-group list-group-flush">
      <li class="list-group-item d-flex">
        <i class="me-2 bi bi-clock"></i>
        <span class="fw-bold">Timezone: </span>
        <span class="flex-fill text-center">${timezones.join(", ")}</span>
      </li>
      <li class="list-group-item d-flex">
        <i class="me-2 bi bi-people-fill"></i>
        <span class="fw-bold">Population: </span>
        <span class="flex-fill text-center">${population.toLocaleString()}</span>
      </li>
      <li class="list-group-item d-flex">
        <i class="me-2 bi bi-building"></i>
        <span class="fw-bold">Capital: </span>
        <span class="flex-fill text-center">${
          capital ? capital.join(", ") : "Unknown"
        }</span>
      </li>
      <li class="list-group-item d-flex">
        <i class="me-2 bi bi-geo-fill"></i>
        <span class="fw-bold">Area: </span>
        <span class="flex-fill text-center">
          ${area.toLocaleString()} m<sup>2</sup>
        </span>
      </li>
      <li class="list-group-item d-flex">
        <i class="me-2 bi bi-translate"></i>
        <span class="fw-bold">Languages: </span>
        <span class="flex-fill text-center">${
          languages ? Object.values(languages).join(", ") : "Unknown"
        }</span>
      </li>
      <li class="list-group-item d-flex">
        <i class="me-2 bi bi-cash-coin"></i>
        <span class="fw-bold">Currencies: </span>
        <span class="flex-fill text-center">
        ${
          currencies
            ? Object.values(currencies)
                .map(({ name, symbol }) => `${name} (${symbol})`)
                .join(", ")
            : "Unknown"
        }
        </span>
      </li>
    </ul>
  </div>`;
}

async function populateCountrySelector() {
  const countries = await getAllCountriesNames();
  $countrySelector.innerHTML = countries
    .sort((a, b) => (a.name.common > b.name.common ? 1 : -1))
    .map(
      ({ name: { common, official } }) =>
        `<option value="${official}">${common}</option>`
    )
    .join("");
}

async function getCountryCoordinates(officialName) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${officialName}&key=AIzaSyC2q6SU0WuYASzZCdeLBRPbWtceIdSWJBI`
  );
  const data = await response.json();
  if (data.results.length > 0) {
    const location = data.results[0].geometry.location;
    const coordinates = {
      latitude: location.lat,
      longitude: location.lng,
    };
    return coordinates;
  } else {
    return null;
  }
}

async function displayCountryMap(officialName) {
  const coordinates = await getCountryCoordinates(officialName);
  if (coordinates) {
    const mapDiv = document.getElementById("map");
    mapDiv.innerHTML = "";
    const iframe = document.createElement("iframe");
    const zoom = 7;
    iframe.src = `https://www.google.com/maps/embed/v1/place?q=${coordinates.latitude},${coordinates.longitude}&zoom=${zoom}&key=AIzaSyC2q6SU0WuYASzZCdeLBRPbWtceIdSWJBI`;
    iframe.width = "100%";
    iframe.height = "400";
    iframe.allowfullscreen = true;
    mapDiv.appendChild(iframe);
  }
}
