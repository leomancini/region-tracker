import { renderMap as renderWorld, names as worldNames } from './maps/world.js';
import { renderMap as renderUs, names as usNames } from './maps/us.js';
import { renderMap as renderCanada, names as canadaNames } from './maps/canada.js';
import { renderMap as renderMexico, names as mexicoNames } from './maps/mexico.js';
import { renderMap as renderChina, names as chinaNames } from './maps/china.js';

let currentMap = 'countries';
let userData = { countries: [], states: [], provinces: [], 'ca-provinces': [], 'mx-states': [] };
let username = '';

const mapRenderers = {
  countries: renderWorld,
  states: renderUs,
  'ca-provinces': renderCanada,
  'mx-states': renderMexico,
  provinces: renderChina,
};

const mapLabels = {
  countries: 'countries',
  states: 'states',
  'ca-provinces': 'provinces',
  'mx-states': 'states',
  provinces: 'provinces',
};

const regionNames = {
  countries: worldNames,
  states: usNames,
  'ca-provinces': canadaNames,
  'mx-states': mexicoNames,
  provinces: chinaNames,
};

// Pretty URL slugs <-> internal map keys
const slugToMap = {
  world: 'countries',
  us: 'states',
  canada: 'ca-provinces',
  mexico: 'mx-states',
  china: 'provinces',
};

const mapToSlug = Object.fromEntries(
  Object.entries(slugToMap).map(([slug, key]) => [key, slug])
);

function extractFromUrl() {
  const match = window.location.pathname.match(/^\/user\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_-]+))?/);
  if (!match) return { name: null, map: null };
  const slug = match[2];
  return {
    name: match[1],
    map: slug && slugToMap[slug] ? slugToMap[slug] : null,
  };
}

async function loadUserData() {
  try {
    const res = await fetch(`/api/${username}/regions`);
    if (res.ok) {
      userData = await res.json();
    }
  } catch (err) {
    console.error('Failed to load data:', err);
  }
}

function saveUserData() {
  fetch(`/api/${username}/regions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  }).catch(err => console.error('Failed to save:', err));
}

async function renderMap() {
  const container = document.getElementById('map-container');
  container.innerHTML = '<div class="spinner"></div>';
  await mapRenderers[currentMap](container);
  applyVisitedState();
  updateStats();
}

function applyVisitedState() {
  const visited = new Set(userData[currentMap]);
  const container = document.getElementById('map-container');

  container.querySelectorAll('path[id]').forEach(el => {
    if (visited.has(el.id)) {
      el.classList.add('visited');
    }
  });
}

function getRegionElement(target) {
  let el = target;
  while (el && el.id !== 'map-container') {
    const tag = el.tagName?.toLowerCase();
    if (el.id && (tag === 'path' || tag === 'polygon' || tag === 'g')) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function updateStats() {
  const count = userData[currentMap].length;
  const label = mapLabels[currentMap];
  document.getElementById('stats').textContent = `${count} ${label} visited`;
}

function showTooltip(e, name) {
  const tooltip = document.getElementById('tooltip');
  tooltip.textContent = name;
  tooltip.style.display = 'block';
  tooltip.style.left = (e.clientX + 12) + 'px';
  tooltip.style.top = (e.clientY - 30) + 'px';
}

function hideTooltip() {
  document.getElementById('tooltip').style.display = 'none';
}

function setupEventListeners() {
  document.querySelectorAll('.segment').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.segment.active').classList.remove('active');
      btn.classList.add('active');
      currentMap = btn.dataset.map;
      updateUrl();
      renderMap();
    });
  });

  const container = document.getElementById('map-container');

  container.addEventListener('click', (e) => {
    const region = getRegionElement(e.target);
    if (!region) return;

    const regionId = region.id;
    const list = userData[currentMap];
    const index = list.indexOf(regionId);

    if (index === -1) {
      list.push(regionId);
      region.classList.add('visited');
    } else {
      list.splice(index, 1);
      region.classList.remove('visited');
    }

    updateStats();
    saveUserData();
  });

  container.addEventListener('mouseover', (e) => {
    const region = getRegionElement(e.target);
    if (!region) return;
    const names = regionNames[currentMap] || {};
    const name = names[region.id] || region.id;
    showTooltip(e, name);
  });

  container.addEventListener('mousemove', (e) => {
    const tooltip = document.getElementById('tooltip');
    if (tooltip.style.display === 'block') {
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top = (e.clientY - 30) + 'px';
    }
  });

  container.addEventListener('mouseout', (e) => {
    const region = getRegionElement(e.target);
    if (!region) return;
    hideTooltip();
  });
}

function updateUrl() {
  history.replaceState(null, '', `/user/${username}/${mapToSlug[currentMap]}`);
}

async function startApp(name, initialMap) {
  username = name;
  if (initialMap) {
    currentMap = initialMap;
  }
  document.getElementById('landing').classList.remove('active');
  document.getElementById('loader').classList.add('active');

  await loadUserData();

  // Set the active segment to match currentMap
  document.querySelectorAll('.segment').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.map === currentMap);
  });

  await renderMap();
  updateUrl();

  document.getElementById('loader').classList.remove('active');
  document.getElementById('app').classList.add('active');
  setupEventListeners();
}

function setupLanding() {
  document.getElementById('landing').classList.add('active');
  document.getElementById('landing-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name-input').value.trim().toLowerCase();
    if (name && /^[a-zA-Z0-9_-]+$/.test(name)) {
      startApp(name);
    }
  });
}

async function init() {
  const { name, map } = extractFromUrl();

  if (!name) {
    setupLanding();
    return;
  }

  startApp(name, map);
}

init();
