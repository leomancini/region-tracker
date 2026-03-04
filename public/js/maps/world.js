import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

let cachedData = null;

async function loadData() {
  if (cachedData) return cachedData;
  const resp = await fetch('/data/world-110m.json');
  cachedData = await resp.json();
  return cachedData;
}

// Countries missing from the 110m dataset, extracted from 50m.
const extraFeatures = [
  { type: 'Feature', id: '383', properties: {}, geometry: { type: 'Polygon', coordinates: [[[20.35,42.83],[20.47,42.86],[20.49,42.88],[20.46,42.93],[20.48,42.95],[20.62,43.03],[20.65,43.07],[20.66,43.1],[20.64,43.13],[20.61,43.18],[20.62,43.2],[20.7,43.23],[20.76,43.26],[20.8,43.26],[20.82,43.24],[20.82,43.21],[20.85,43.17],[20.89,43.15],[20.97,43.12],[21.06,43.09],[21.13,43.04],[21.22,42.96],[21.24,42.91],[21.32,42.87],[21.4,42.83],[21.39,42.75],[21.66,42.68],[21.72,42.68],[21.75,42.67],[21.75,42.65],[21.73,42.6],[21.62,42.42],[21.61,42.39],[21.53,42.35],[21.52,42.33],[21.54,42.28],[21.56,42.25],[21.39,42.22],[21.33,42.19],[21.3,42.13],[21.29,42.1],[21.26,42.1],[21.21,42.13],[21.14,42.18],[21.06,42.17],[20.78,42.07],[20.75,42.02],[20.75,41.9],[20.72,41.87],[20.69,41.85],[20.58,41.87],[20.57,41.87],[20.58,41.92],[20.58,42.01],[20.52,42.17],[20.49,42.22],[20.41,42.28],[20.35,42.31],[20.24,42.34],[20.19,42.43],[20.1,42.52],[20.06,42.55],[20.07,42.56],[20.09,42.63],[20.06,42.69],[20.03,42.73],[20.05,42.76],[20.13,42.76],[20.19,42.75],[20.22,42.8],[20.35,42.83]]]}}, // Kosovo
];

// Split overseas territories out of their parent country's MultiPolygon.
// Each entry: [parentId, newId, test] where test(polygon) returns true for the territory.
const territoriesToSplit = [
  ['250', '254', poly => d3.geoCentroid({ type: 'Polygon', coordinates: poly })[0] < -20], // French Guiana
];

function splitTerritories(features) {
  const result = [];
  for (const feature of features) {
    const rule = territoriesToSplit.find(([pid]) => pid === String(feature.id));
    if (!rule || feature.geometry.type !== 'MultiPolygon') {
      result.push(feature);
      continue;
    }
    const [, newId, test] = rule;
    const parentPolys = [];
    const splitPolys = [];
    for (const poly of feature.geometry.coordinates) {
      (test(poly) ? splitPolys : parentPolys).push(poly);
    }
    if (splitPolys.length) {
      result.push({ ...feature, geometry: { type: 'MultiPolygon', coordinates: parentPolys } });
      result.push({ type: 'Feature', id: newId, properties: {}, geometry: { type: 'MultiPolygon', coordinates: splitPolys } });
    } else {
      result.push(feature);
    }
  }
  return result;
}

export async function renderMap(container) {
  const world = await loadData();
  const countries = topojson.feature(world, world.objects.countries);
  countries.features = splitTerritories(countries.features);
  countries.features.push(...extraFeatures);

  container.innerHTML = '';

  const width = 960, height = 500;
  const padTop = 40, padBottom = 25;
  const projection = d3.geoNaturalEarth1().fitExtent(
    [[0, padTop], [width, height - padBottom]], countries
  );
  const path = d3.geoPath(projection);

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  svg.selectAll("path.country")
    .data(countries.features)
    .join("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("id", d => d.id);
}

export const names = {
  '004':'Afghanistan','008':'Albania','012':'Algeria','024':'Angola','032':'Argentina',
  '036':'Australia','040':'Austria','050':'Bangladesh','056':'Belgium','064':'Bhutan',
  '068':'Bolivia','070':'Bosnia and Herzegovina','072':'Botswana','076':'Brazil',
  '100':'Bulgaria','104':'Myanmar','108':'Burundi','116':'Cambodia','120':'Cameroon',
  '124':'Canada','140':'Central African Republic','148':'Chad','152':'Chile','156':'China',
  '170':'Colombia','178':'Congo','180':'DR Congo','188':'Costa Rica','191':'Croatia',
  '192':'Cuba','196':'Cyprus','203':'Czechia','208':'Denmark','262':'Djibouti',
  '214':'Dominican Republic','218':'Ecuador','818':'Egypt','222':'El Salvador',
  '226':'Equatorial Guinea','232':'Eritrea','233':'Estonia','231':'Ethiopia',
  '242':'Fiji','246':'Finland','250':'France','266':'Gabon','270':'Gambia',
  '268':'Georgia','276':'Germany','288':'Ghana','300':'Greece','320':'Guatemala',
  '324':'Guinea','328':'Guyana','332':'Haiti','340':'Honduras','348':'Hungary',
  '352':'Iceland','356':'India','360':'Indonesia','364':'Iran','368':'Iraq',
  '372':'Ireland','376':'Israel','380':'Italy','384':'Ivory Coast','388':'Jamaica',
  '392':'Japan','400':'Jordan','398':'Kazakhstan','404':'Kenya','408':'North Korea',
  '410':'South Korea','414':'Kuwait','417':'Kyrgyzstan','418':'Laos','428':'Latvia',
  '422':'Lebanon','426':'Lesotho','430':'Liberia','434':'Libya','440':'Lithuania',
  '442':'Luxembourg','450':'Madagascar','454':'Malawi','458':'Malaysia','466':'Mali',
  '478':'Mauritania','484':'Mexico','496':'Mongolia','498':'Moldova','504':'Morocco',
  '508':'Mozambique','516':'Namibia','524':'Nepal','528':'Netherlands','540':'New Caledonia',
  '554':'New Zealand','558':'Nicaragua','562':'Niger','566':'Nigeria','578':'Norway',
  '512':'Oman','586':'Pakistan','591':'Panama','598':'Papua New Guinea','600':'Paraguay',
  '604':'Peru','608':'Philippines','616':'Poland','620':'Portugal','630':'Puerto Rico',
  '634':'Qatar','642':'Romania','643':'Russia','646':'Rwanda','682':'Saudi Arabia',
  '686':'Senegal','688':'Serbia','694':'Sierra Leone','702':'Singapore','703':'Slovakia',
  '705':'Slovenia','706':'Somalia','710':'South Africa','728':'South Sudan','724':'Spain',
  '144':'Sri Lanka','729':'Sudan','740':'Suriname','748':'Eswatini','752':'Sweden',
  '756':'Switzerland','760':'Syria','158':'Taiwan','762':'Tajikistan','834':'Tanzania',
  '764':'Thailand','768':'Togo','780':'Trinidad and Tobago','788':'Tunisia','792':'Turkey',
  '795':'Turkmenistan','800':'Uganda','804':'Ukraine','784':'UAE','826':'United Kingdom',
  '840':'United States','858':'Uruguay','860':'Uzbekistan','862':'Venezuela',
  '704':'Vietnam','887':'Yemen','894':'Zambia','716':'Zimbabwe',
  '010':'Antarctica','304':'Greenland','732':'W. Sahara',
  '499':'Montenegro','807':'North Macedonia','275':'Palestine',
  '254':'French Guiana','383':'Kosovo'
};
