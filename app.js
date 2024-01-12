const displayRecent = document.getElementById("displayRecent");
const display = document.getElementById("display");
const searchBtn = document.getElementById("searchBtn");
const inputElement = document.getElementById("search__input");
const errorMessage = document.getElementById("error");
const autocompleteList = document.getElementById("autocomplete-list");

let days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function createRecentCard(element, index) {
  const card = document.createElement("div");
  card.classList.add("recentCard");
  card.innerHTML = ` <div class="cityName"> ${element.name} </div>
    <div><span>Temperature C</span> ${element.tempC} </div>
    <div><span>Temperature F</span> ${element.tempF} </div>
    <div><span>Wind Kph</span> ${element.windKPH} </div>
    <div>
        <button onclick="deleteData(${index})">DELETE</button>
    </div>`;
  return card;
}

function showDisplayCardData() {
  const dateEle = document.getElementById("date");
  const dayNightImg = document.getElementById("dayNightImg");
  const temp_value = document.getElementById("temp_value");
  const day = document.getElementById("day");
  const timeEle = document.getElementById("time");
  const location = document.getElementById("location");
  const dayNightText = document.getElementById("dayNightText");

  const input = inputElement.value;
  let cityName;

  if (!input) {
    // If no input is provided, try to get the device's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Use reverse geocoding to get the city name from coordinates
          fetch(
            `https://api.weatherapi.com/v1/current.json?key=61d42592d8214bd19ca92102240901&q=${latitude},${longitude}&aqi=no`
          )
            .then((response) => response.json())
            .then((data) => {
              cityName = data.location.name || "Mumbai"; // Default to Mumbai if unable to get location name
              fetchData(cityName);
            })
            .catch((error) => {
              console.error("Error fetching device location:", error);
              // Default to Mumbai in case of any error
              fetchData("Mumbai");
            });
        },
        (error) => {
          console.error("Error getting device location:", error);
          // Default to Mumbai in case of any error
          fetchData("Mumbai");
        }
      );
    } else {
      // If geolocation is not supported, default to Mumbai
      fetchData("Mumbai");
    }
  } else {
    // If input is provided, use the input city
    fetchData(input);
  }

  function fetchData(city) {
    const url = `https://api.weatherapi.com/v1/current.json?key=61d42592d8214bd19ca92102240901&q=${city}&aqi=no`;
    const response = fetch(url);
    response
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could Not Fetch Resource");
        }
        return response.json();
      })
      .then((data) => {
        errorMessage.style.display = "none";
        console.log(data);
        let name = data.location.name;
        let tempC = data.current.temp_c;
        let isDay = data.current.is_day;
        let localtime = data.location.localtime;
        location.textContent = name;
        temp_value.textContent = tempC;

        console.log();

        if (isDay == 1) {
          dayNightImg.setAttribute("src", "images/day.svg");
          dayNightImg.setAttribute("alt", "day");
          dayNightText.textContent = "Day";
        } else {
          dayNightImg.setAttribute("src", "images/night.svg");
          dayNightImg.setAttribute("alt", "night");
          dayNightText.textContent = "Night";
        }

        const date = new Date(localtime);
        day.textContent = days[date.getDay()];

        let currentDay = String(date.getDate()).padStart(2, "0");
        let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
        let currentYear = date.getFullYear();
        let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
        dateEle.textContent = currentDate;

        let time = date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });

        timeEle.textContent = time;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

function showData() {
  displayRecent.innerHTML = "";
  const recentText = document.createElement("h2");
  recentText.textContent = "RECENTS :";
  recentText.classList.add("recentText");
  displayRecent.append(recentText);
  if (localStorage.getItem("recent") == null) {
    recent = [];
  } else {
    recent = JSON.parse(localStorage.getItem("recent"));
  }

  recent.forEach((element, index) => {
    const cardRecent = createRecentCard(element, index);

    displayRecent.prepend(cardRecent);
  });
}

function addData() {
  let cityName = inputElement.value;
  if (!cityName) {
    alert("PLEASE ENTER AN INPUT");
    return;
  }

  const url = `https://api.weatherapi.com/v1/current.json?key=61d42592d8214bd19ca92102240901&q=${cityName}&aqi=no`;
  const response = fetch(url);

  response
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could Not Fetch Resource");
      }
      return response.json();
    })
    .then((data) => {
      errorMessage.style.display = "none";
      console.log(data);

      let name = data.location.name;
      let tempC = data.current.temp_c;
      let tempF = data.current.temp_f;
      let windKPH = data.current.wind_kph;

      let newCityData = {
        name: name,
        tempC: tempC,
        tempF: tempF,
        windKPH: windKPH,
      };

      let recent;

      if (localStorage.getItem("recent") == null) {
        recent = [];
      } else {
        recent = JSON.parse(localStorage.getItem("recent"));
      }

      // Check if the city is already in the recent list
      if (!recent.some((city) => city.name === name)) {
        recent.push(newCityData);
        localStorage.setItem("recent", JSON.stringify(recent));
        showData();
      } else {
        alert("CIty already in recents");
        console.log("City already exists in recent list");
        // You may want to display a message or take other actions here
      }
    })
    .catch((error) => {
      console.log(error);
      // ERROR MESSAGE FOR NOT FOUND
      errorMessage.textContent = "We dont have data for this city";
      errorMessage.style.display = "block";
    });
}

function deleteData(index) {
  let recent;
  if (localStorage.getItem("recent") == null) {
    recent = [];
  } else {
    recent = JSON.parse(localStorage.getItem("recent"));
  }

  recent.splice(index, 1);
  localStorage.setItem("recent", JSON.stringify(recent));
  showData();
}

searchBtn.addEventListener("click", function () {
  addData();
  showDisplayCardData();
});

document.onload = showData();
document.onload = showDisplayCardData();

let cities = [
  "New York",
  "Paris",
  "London",
  "Tokyo",
  "Rome",
  "Sydney",
  "Beijing",
  "Dubai",
  "Los Angeles",
  "Moscow",
  "Berlin",
  "Rio de Janeiro",
  "Cairo",
  "Mumbai",
  "Toronto",
  "Barcelona",
  "Istanbul",
  "Bangkok",
  "Amsterdam",
  "Athens",
  "San Francisco",
  "Seoul",
  "Madrid",
  "Chicago",
  "Cape Town",
  "Singapore",
  "Vienna",
  "Prague",
  "Dublin",
  "Buenos Aires",
  "Stockholm",
  "Lisbon",
  "Osaka",
  "Warsaw",
  "Mexico City",
  "Jakarta",
  "Hong Kong",
  "Montreal",
  "Zurich",
  "Nairobi",
  "Copenhagen",
  "Helsinki",
  "Brussels",
  "Budapest",
  "Seville",
  "Kuala Lumpur",
  "Dublin",
  "Doha",
  "Manila",
  "Edinburgh",
  "Kyoto",
  "Auckland",
  "Cologne",
  "Oslo",
  "Reykjavik",
  "Tel Aviv",
  "Sao Paulo",
  "Brisbane",
  "Wellington",
  "Edmonton",
  "Vancouver",
  "Ottawa",
  "Cleveland",
  "Detroit",
  "Phoenix",
  "Dallas",
  "Denver",
  "Delhi",
  "Kolkata",
  "Bangalore",
  "Chennai",
  "Houston",
  "Miami",
  "New Orleans",
  "Seattle",
  "Portland",
  "San Diego",
  "Las Vegas",
  "San Antonio",
  "Austin",
  "Atlanta",
  "Philadelphia",
  "Boston",
  "Washington, D.C.",
  "Toronto",
  "Vancouver",
  "Montreal",
  "Calgary",
  "Ottawa",
  "Quebec City",
  "Winnipeg",
  "Halifax",
  "Saskatoon",
  "Regina",
  "St. John's",
];

inputElement.addEventListener("input", function (event) {
  autocomplete(event);
});

inputElement.addEventListener("keydown", function (event) {
  const items = autocompleteList.getElementsByTagName("div");
  let selectedIndex = -1;

  for (let i = 0; i < items.length; i++) {
    if (items[i].classList.contains("selected")) {
      selectedIndex = i;
      break;
    }
  }

  switch (event.key) {
    case "ArrowUp":
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      break;
    case "ArrowDown":
      selectedIndex = (selectedIndex + 1) % items.length;
      break;
    case "Enter":
      if (selectedIndex !== -1) {
        selectCity(items[selectedIndex].innerText);
        return; // Stop further processing to avoid conflict
      }
      break;
  }

  // Update the selected item
  for (let i = 0; i < items.length; i++) {
    items[i].classList.remove("selected");
  }

  if (selectedIndex !== -1) {
    items[selectedIndex].classList.add("selected");
  }
});

function autocomplete(event) {
  const input = event.target.value.toLowerCase();

  // Clear previous suggestions
  autocompleteList.innerHTML = "";

  if (input.length === 0) {
    autocompleteList.style.display = "none";
    return;
  }

  const matchingCities = cities.filter((city) =>
    city.toLowerCase().includes(input)
  );

  matchingCities.forEach((city, index) => {
    const listItem = document.createElement("div");
    listItem.innerHTML = `<div id="autocomplete-list-item" onclick="selectCity('${city}')">${city}</div>`;
    listItem.addEventListener("mouseover", function () {
      selectCityByIndex(index);
    });
    autocompleteList.appendChild(listItem);
  });

  autocompleteList.style.display = "block";
}

function selectCity(city) {
  inputElement.value = city;
  autocompleteList.style.display = "none";
}

function selectCityByIndex(index) {
  const items = autocompleteList.getElementsByTagName("div");

  for (let i = 0; i < items.length; i++) {
    items[i].classList.remove("selected");
  }

  if (index >= 0 && index < items.length) {
    items[index].classList.add("selected");
  }
}
