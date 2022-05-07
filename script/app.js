"use strict";

const weatherBlock = document.querySelector("#weather");
const APIKEY = "1777adfd099da3724796805f98c06875";
let weatherStorage = {};
//вызов функцию
function init() {
  weatherBlock.innerHTML = `
	<div class="weather__loading">
	<img src="img/loading.svg" alt="Loading...">
	</div>
	`;
  setTimeout(() => {
    getWeather();
  }, 1000);
}
// Запрашиваем погоду. Записываем в Storage. Прописывем город
async function loadWeatherApi() {
  let city = "";
  if (localStorage.getItem("weatherCity") === null) {
    await geoData();
  }
  city = localStorage.getItem("weatherCity");

  const server = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=metric`;

  return await fetch(server, { method: "GET" })
    .then((response) => response.json())
    .then((resultsWeather) => {
      localStorage.setItem("weather", JSON.stringify(resultsWeather));
      return resultsWeather;
    });
}
//Запрашиваем погоду из Storage
function getData() {
  let resultWeather;
  if (localStorage.getItem("weather") !== null) {
    const storageData = JSON.parse(localStorage.getItem("weather"));
    if (parseInt(new Date().getTime() / 1000) - storageData.dt > 60 * 60) {
      resultWeather = loadWeatherApi();
    } else {
      resultWeather = storageData;
    }
  } else {
    resultWeather = loadWeatherApi();
  }
  return resultWeather;
}
//Переводим цельсий в фаренгейт
function celToFar(temp) {
  return Math.round(temp * 1.8 + 32);
}
//переключение цельсий/фаренгейт
async function change() {
  const weatherData = await prepareData();
  const switcher = document.querySelector(".switch-btn");
  let temp, feelLike, symbol;
  if (switcher.classList.contains("switch-on")) {
    switcher.classList.remove("switch-on");
    switcher.classList.add("switch-off");
    temp = weatherData.main.temp_farengheit;
    feelLike = weatherData.main.feels_like_farengheit;
    symbol = "&deg;F";
  } else {
    switcher.classList.remove("switch-off");
    switcher.classList.add("switch-on");
    temp = weatherData.main.temp;
    feelLike = weatherData.main.feels_like;
    symbol = "&deg;C";
  }

  document.getElementById("temp-value").innerHTML = temp + " " + symbol;
  document.getElementById("feelslike-value").innerHTML =
    feelLike + " " + symbol;
}
//подготавливаем данные погоды.
async function prepareData() {
  const weatherData = await getData();
  weatherData.main.temp_farengheit = celToFar(weatherData.main.temp);
  weatherData.main.feels_like_farengheit = celToFar(
    weatherData.main.feels_like
  );
  weatherData.main.temp = Math.round(weatherData.main.temp);
  weatherData.main.feels_like = Math.round(weatherData.main.feels_like);
  return weatherData;
}
//меняем цвета
function colors(e) {
  if (e.target.classList.contains("color")) {
    document
      .querySelector("#weather")
      .setAttribute("class", "weather " + e.target.classList[1]);
  }
}
//механизм открытия-закрытия панели цветов
function toggleColorPanel(e) {
  const target = getClosest(e.target, ".weather");
  if (e.target.classList.contains("click")) {
    document.querySelector(".colors-wrap").classList.toggle("colors-wrap_show");
  }
  if (!target) {
    return false;
  } else {
    document.querySelector(".colors-wrap").classList.remove("colors-wrap_show");
  }
}
//Отслеживание взаимодействия с цветами и температурой
document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("switch-btn")) {
    change();
  }
  toggleColorPanel(e);
  colors(e);
});
function getClosest(node, css) {
  while (node) {
    if (node.nodeType == 1 && node.matches(css)) {
      return node;
    } else {
      node = node.parentNode;
    }
  }
  return null;
}
//получаем координаты пользователя
function geolocation() {
  if (navigator.geolocation) {
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej);
    });
  } else {
    return {
      lat: 46.48144126498019,
      lon: 30.71990450933392,
    };
  }
}
//запрашиваем назание населенного пункта иходя из полученых координат. Записываем в localStorage
async function geoData() {
  let geoPosition;
  await geolocation().then((position) => {
    geoPosition = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
  });
  const server = `http://api.openweathermap.org/geo/1.0/reverse?lat=${geoPosition.lat}&lon=${geoPosition.lon}&appid=${APIKEY}`;
  return await fetch(server, { method: "GET" })
    .then((response) => response.json())
    .then((resultsGeoData) => {
      localStorage.setItem("weatherCity", resultsGeoData[0].name);
    });
}
//рендер виджета
async function getWeather() {
  const data = await prepareData();

  const location = data.name;
  const weatherIcon = data.weather[0].icon;
  const weatherDescription = data.weather[0].main;
  const colorsWrapTemplate = `<div class="colors-wrap">
		  <div class="colors">
		  <button class="click" value="click">click!</button>
		  <button type="button" class="color blue"></button>
		  <button type="button" class="color yellow"></button>
		  <button type="button" class="color green"></button>
		  <button type="button" class="color black"></button>
		  <button type="button" class="color white"></button>
		  </div>
		  </div>`;
  const template = `
		<div class="weather__header">
		  <div class="weather__main">
			<div class="weather__city">${location}</div>
			<div class="weather__status">${weatherDescription}</div>
		  </div>
		  <div class="weather__icon">
			<img src="http://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherDescription}" />
		  </div>
		</div>
		<div class="weather__temp"> Temperature: <span id="temp-value"></span> </div>
		<div class="weather_feel-like">Feels like: <span id="feelslike-value"></span></div>
		<div class="switch-wrapper"><span class="deg">&deg;F</span><div class="switch-btn switch-off"></div><span class="deg">&deg;C</span></div>
		
	  `;
  weatherBlock.innerHTML = template;
  weatherBlock.insertAdjacentHTML("afterend", colorsWrapTemplate);
  change();
}
init();

// async function loadWeather() {
// 	const weatherData = await getData();
// 	weatherBlock.innerHTML = `
// 	  <div class="weather__loading">
// 	  <img src="img/loading.svg" alt="Loading...">
// 	  </div>
// 	  `;
// 	console.log(weatherData);
// 	  const server =
// 	    "https://api.openweathermap.org/data/2.5/weather?q=Odesa&appid=1777adfd099da3724796805f98c06875&units=metric";

// 	  const response = await fetch(server, { method: "GET" });
// 	  const responseResult = await response.json();

// 	  localStorage.setItem("weather", JSON.stringify(responseResult));
// 	  weatherStorage = JSON.parse(localStorage.getItem("weather"));
// 	  let t = responseResult.dt;
// 	  console.log(t);
// 	  let timestamp = weatherStorage.dt;
// 	  console.log(timestamp);
// 	  console.log(weatherStorage);

// 	  if (response.ok) {
// 	    weatherData = responseResult;
// 	    weatherData.main.temp_farengheit = celToFar(weatherData.main.temp);
// 	    weatherData.main.feels_like_farengheit = celToFar(
// 	      weatherData.main.feels_like
// 	    );
// 	    weatherData.main.temp = Math.round(weatherData.main.temp);
// 	    weatherData.main.feels_like = Math.round(weatherData.main.feels_like);
// 	    getWeather();
// 	  } else {
// 	    weatherBlock.innerHTML = responseResult.message;
// 	  }
//   }
