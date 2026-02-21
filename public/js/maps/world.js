import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

let cachedData = null;

async function loadData() {
  if (cachedData) return cachedData;
  const resp = await fetch('/data/world-110m.json');
  cachedData = await resp.json();
  return cachedData;
}

export async function renderMap(container) {
  const world = await loadData();
  const countries = topojson.feature(world, world.objects.countries);
  const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

  container.innerHTML = '';

  const width = 960, height = 500;
  const projection = d3.geoNaturalEarth1().fitSize([width, height], countries);
  const path = d3.geoPath(projection);

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  svg.selectAll("path.country")
    .data(countries.features)
    .join("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("id", d => d.id);

  svg.append("path")
    .datum(borders)
    .attr("class", "borders")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .style("pointer-events", "none");
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
  '499':'Montenegro','807':'North Macedonia','275':'Palestine'
};
