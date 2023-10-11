'use strict';

const form = document.querySelector('.form');

const containerWorkouts = document.querySelector('.workouts');

const inputType = document.querySelector('.form__input--type');

const inputDistance = document.querySelector('.form__input--distance');

const inputDuration = document.querySelector('.form__input--duration');

const inputCadence = document.querySelector('.form__input--cadence');

const inputElevation = document.querySelector('.form__input--elevation');

class workout {
  date = new Date();

  id = Math.floor(Math.random() * 26) + Date.now();

  click = 0;

  constructor(distance, duration, coords) {
    this.distance = distance;

    this.duration = duration;

    this.coords = coords;
  }

  _setDecribe() {
    const months = [
      'January',

      'February',

      'March',

      'April',

      'May',

      'June',

      'July',

      'August',

      'September',

      'October',

      'November',

      'December',
    ];

    this.decribe = `${this.name[0].toUpperCase()}${this.name.slice(1)} on ${
      months[this.date.getMonth()]
    }  ${this.date.getDate()}`;
  }
  clicks() {
    this.click++;
  }
}

class Running extends workout {
  constructor(cadence, distance, duration, coords) {
    super(distance, duration, coords);

    this.name = 'running';

    this.cadence = cadence;

    this.calcPace();

    this._setDecribe();
  }

  calcPace() {
    this.pace = this.duration / this.distance;

    return this.pace;
  }
}

class Cycling extends workout {
  constructor(elevationGain, distance, duration, coords) {
    super(distance, duration, coords);

    this.name = 'cycling';

    this.elevationGain = elevationGain;

    this.calcSpeed();

    this._setDecribe();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);

    return this.speed;
  }
}

/////

class App {
  #map;

  #mapEvent;
  #zoomLevel = 13;

  #workouts = [];

  constructor() {
    this._getPosition();

    this._getLocalStorage();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField.bind(this));

    containerWorkouts.addEventListener('click', this._moveOnPopUp.bind(this));

    console.log('app is called');
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),

        function () {
          alert('error');
        }
      );
    } else {
      console.log('there is no navigator');
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#zoomLevel);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords)

      .addTo(this.#map)

      .bindPopup('A pretty CSS popup.<br> Easily customizable.')

      .openPopup();

    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach((work) => this._markerDisplay(work));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    form.classList.remove('hidden');

    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        '';

    form.classList.add('hidden');
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');

    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validationInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const AllPostivenumber = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();

    const type = inputType.value;

    const distance = +inputDistance.value;

    const duration = +inputDuration.value;

    let workout;

    const { lat, lng } = this.#mapEvent.latlng;

    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !validationInputs(distance, duration, cadence) ||
        !AllPostivenumber(distance, duration, cadence)
      )
        return alert('give the positive number');

      workout = new Running(cadence, distance, duration, [lat, lng]);

      this.#workouts.push(workout);
    }

    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;

      if (
        !validationInputs(distance, duration, elevationGain) ||
        !AllPostivenumber(distance, duration)
      )
        return alert('give the positive number');

      workout = new Cycling(elevationGain, distance, duration, [lat, lng]);

      this.#workouts.push(workout);
    }

    this._markerDisplay(workout);

    this._List(workout);

    this._hideForm();
    this._setLocalStorage();
  }

  _markerDisplay(workout) {
    L.marker(workout.coords)

      .addTo(this.#map)

      .bindPopup(
        L.popup({
          maxWidth: '250px',

          minWidth: '100px',

          autoClose: false,

          closeOnClick: false,

          className: `${workout.name}-popup`,
        })
      )

      .setPopupContent(
        `${workout.name === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.decribe} `
      )

      .openPopup();
  }

  _List(workout) {
    let html = `<li class="workout workout--${workout.name}" data-id="${
      workout.id
    }">

          <h2 class="workout__title">${workout.decribe}</h2>

          <div class="workout__details">

          <span class="workout__icon">${
            workout.name === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>

          <span class="workout__value">${workout.distance}</span>

            <span class="workout__unit">km</span>

          </div>

          <div class="workout__details">

            <span class="workout__icon">⏱</span>

            <span class="workout__value">${workout.duration}</span>

            <span class="workout__unit">min</span>

          </div>`;

    if (workout.name === 'running')
      html += ` <div class="workout__details">

            <span class="workout__icon">⚡️</span>

            <span class="workout__value">${workout.pace}</span>

            <span class="workout__unit">min/km</span>

          </div>

          <div class="workout__details">

            <span class="workout__icon">🦶🏼</span>

            <span class="workout__value">${workout.cadence}</span>

            <span class="workout__unit">spm</span>

          </div>

        </li>`;

    if (workout.name === 'cycling')
      html += ` <div class="workout__details">

            <span class="workout__icon">⚡️</span>

            <span class="workout__value">${workout.speed}</span>

            <span class="workout__unit">km/h</span>

          </div>

          <div class="workout__details">

            <span class="workout__icon">⛰</span>

            <span class="workout__value">${workout.elevationGain}</span>

            <span class="workout__unit">m</span>

          </div>

        </li>`;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveOnPopUp(e) {
    const workOutEl = e.target.closest('.workout');
    if (!workOutEl) return;
    const workout = this.#workouts.find(
      (work) => work.id == workOutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // workout.clicks();
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach((work) => this._List(work));
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
