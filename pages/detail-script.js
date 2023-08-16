let params = new URLSearchParams(document.location.search);
let absPosPrev = "";
let absPosNex = "";
const ROOTPATH = "https://pokeapi.co/api/v2/";
const POKEMONSUFFIX = "pokemon/";
const IMGROOT = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

async function checkAbsolutePos() {
    let pokeName = params.get('name');

    let r = new Request(`${ROOTPATH}${POKEMONSUFFIX}?limit=-1&offset=0`);

    let wholeList = await fetch(r)
                .then((response) => response.json())
                .then((data) => {
                    return data;
                })
                .catch(error => {
                    console.error(error);
                });

    const N = wholeList.results.length;
    for (let i = 0; i < N; ++i) {
        if (wholeList.results[i].name === pokeName) {

            let prev_idx = i - 1;
            let next_idx = i + 1;

            if (prev_idx >= 0) {
                absPosPrev = wholeList.results[prev_idx].name;
            } else {
                absPosPrev = "";
            }

            if (next_idx < N) {
                absPosNext = wholeList.results[next_idx].name;
            } else {
                absPosNext = "";
            }

            break;
            
        }
    }
}

async function renderDetail() {
    // console.log(params);

    // Get the name from the URL
    let pokeName = params.get('name');

    // Get json from api
    let r = new Request(`${ROOTPATH}${POKEMONSUFFIX}${pokeName}`);
    let pokeData = await (await fetch(r)).json();

    // Get name
    let pokeId = pokeData.id;

    // Set Figure Caption
    let pokeCaption = document.querySelector('.detail-container .avatar figcaption');
    pokeCaption.textContent = `#${pokeId} - ${pokeName}`;

    // Set Figure Image
    let im = document.querySelector('.avatar figure img');
    let img_url = `${IMGROOT}${pokeId}.png`;
    im.setAttribute('src', img_url);

    // Set types
    let pokeTypes = document.querySelector('.types');
    for (const t of pokeData.types) {
        let im_url = `../images/poketypes/${t.type.name}.png`;
        let typeImg = document.createElement('img');
        typeImg.setAttribute('src', im_url);
        typeImg.setAttribute('alt', `${t.type.name}.png`)
        pokeTypes.appendChild(typeImg);
    }

    // Set weaknesses
    // All in no-damage-to + (All in half-damage-to but not in double-damage-to)
    let pokeWeakList = document.querySelector('.weaknesses');
    let weaknesses = new Set();
    for (const type of pokeData.types) {
        let typeQuery = new Request(`${type.type.url}`);
        let typeData = await (await fetch(typeQuery)).json();
        
        // Add half-damage-to
        for (const d of typeData.damage_relations.half_damage_to) {
            weaknesses.add(d.name);
        }

        // Remove double-damage-to
        for (const d of typeData.damage_relations.double_damage_to) {
            weaknesses.delete(d.name);
        }

        // Add no-damage-to
        for (const d of typeData.damage_relations.no_damage_to) {
            weaknesses.add(d.name);
        }
    }
    for (const w of weaknesses) {
        let pokeWeak = document.createElement('img');
        pokeWeak.classList.add('weakness');
        pokeWeak.setAttribute('src', `../images/poketypes/${w}.png`);
        pokeWeakList.appendChild(pokeWeak);
    }

    // Show detail one by one
    let pokeDetail = document.querySelector('.info-list');


    // (Base) Stats
    let pokeStats = document.querySelector('.stats-container .stats');
    let numericalStats = {};
    for (const stat of pokeData.stats) {
        numericalStats[stat.stat.name] = stat.base_stat;
    }
    // pokeDetail.appendChild(pokeStats);
    const otherNumericalStats = [['base exp', 'base_experience'], ['height', 'height'], ['weight', 'weight']];
    for (const [key, val] of otherNumericalStats) {
        numericalStats[key] = pokeData[val];
    }

    for (const [class_name, stat_value] of Object.entries(numericalStats)) {
        // console.log(class_name, stat_value)
        let pokeStatContainer = document.createElement('div');
        pokeStatContainer.classList.add('stat-container');

        let pokeStat = document.createElement('div');
        pokeStat.classList.add('stat');
        pokeStat.textContent = class_name;

        let pokeStatVal = document.createElement('div');
        pokeStatVal.classList.add('stat-val');
        pokeStatVal.textContent = stat_value;

        pokeStatContainer.appendChild(pokeStat);
        pokeStatContainer.appendChild(pokeStatVal);
        pokeStats.appendChild(pokeStatContainer);
    }

    // Abilities
    let pokeAbilities = document.querySelector('.abilities-container .abilities');
    for (const ability of pokeData.abilities) {
        let abilityCard = document.createElement('div');
        abilityCard.classList.add('ability');
        abilityCard.textContent = ability.ability.name;
        pokeAbilities.appendChild(abilityCard);
    }

    // Buttons
    let prevButton = document.querySelector('.prev-button');
    let nextButton = document.querySelector('.next-button');
    
    await checkAbsolutePos();

    if (absPosPrev !== "") {
        prevButton.style.visibility = 'visible';
        prevButton.setAttribute('href', `./detail-view.html?name=${absPosPrev}`)
        
    } else {
        prevButton.style.visibility = 'hidden';
    }

    if (absPosNext !== "") {
        nextButton.style.visibility = 'visible';
        nextButton.setAttribute('href', `./detail-view.html?name=${absPosNext}`)
    } else {
        nextButton.style.visibility = 'hidden';
    }
}

renderDetail();