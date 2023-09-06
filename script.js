let offset = 0; // Number of cards in the page
const limit = 10; // Get cards 10 at a time
let finished = false;
let wholeList; // A copy of the whole list of pokemons
let N = 0;
let pokeList; // A list of pokemons to view in the viewport; the one being sorted/truncated.
let prevSearchQuery = '';
let totalCount = 0;

let IMGROOT = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"
let ROOTPATH = "https://pokeapi.co/api/v2/pokemon/"

async function getWholeList() {
    // Function to initialize the list of pokemons
    const myRequest = new Request(`${ROOTPATH}?limit=-1&offset=0`);

    wholeList = await fetch(myRequest)
                .then((response) => response.json())
                .then((data) => {
                    return data;
                })
                .catch(error => {
                    console.error(error);
                });
}

async function displayQueue() {
    let num_displayed = 0;
    let card_group = document.querySelector('.card-group');
    let bottomLink = document.querySelector('.show-more-link');

    // Hide the bottom link first
    bottomLink.style.display = 'none';
    
    // Create and append card nodes
    for (let i = 0; i < limit && ((offset + i) < pokeList.length); ++i) {
        
        // Get pokemon data
        let tmp = pokeList[offset + i].url.split("/");
        let pokeId = tmp[tmp.length - 2];
        let r = new Request(pokeList[offset + i].url);
        let pokedata = await (await fetch(r)).json();

        // Get name and id
        const pokeName = pokedata.name;
        
        // Get img url
        let img_url = `${IMGROOT}${pokeId}.png`

        // Create a card
        let card = document.createElement("a");
        card.classList.add('card');
        card.setAttribute('href', `./pages/detail-view.html?name=${pokeName}`);
        card.setAttribute('target', '_blank');

        // Add name
        let cardName = document.createElement('p');
        cardName.classList.add('card-name');
        cardName.textContent = pokeName;

        // Add img
        let cardImg = document.createElement('img');
        cardImg.setAttribute('src', img_url);
        cardImg.classList.add('card-img');
        
        // Add type
        let cardType = document.createElement('div');
        cardType.classList.add('card-type');
        for (poketype of pokedata['types']) {
            let typeImg = document.createElement('img');
            typeImg.setAttribute('src', `./images/poketypes/${poketype.type.name}.png`);
            typeImg.setAttribute('alt', `${poketype.type.name}.png`)
            cardType.appendChild(typeImg);
        }

        // Add ID
        let cardId = document.createElement('p');
        cardId.classList.add('card-id');
        cardId.textContent = `#${pokeId}`;

        card.appendChild(cardName);
        card.appendChild(cardImg);
        card.appendChild(cardType);
        card.appendChild(cardId);
        card.setAttribute('cardName', pokeName);
        card.setAttribute('cardId', pokeId);
        card_group.appendChild(card);
        num_displayed++;
    }

    // Add the number of displayed cards
    offset += num_displayed;

    if (offset < pokeList.length) {
        // Return the link back to normal
        bottomLink.style.display = 'block';
    }

    let sortButtonContainer = document.querySelector('.sorting-buttons');
    if (num_displayed == 0) {
        sortButtonContainer.style['display'] = 'none';
        let noPokeMessage = document.createElement('div');
        noPokeMessage.classList.add('no-message-block');
        noPokeMessage.classList.add('card');
        noPokeMessage.textContent = "No Pokemons Found!";
        noPokeMessage.style['font-size'] = 'x-large';
        card_group.appendChild(noPokeMessage);
    } else {
        sortButtonContainer.style['display'] = 'flex';
        let noPokeMessage = document.querySelector('.no-message-block');
        if (noPokeMessage !== null) {
            noPokeMessage.parentNode.removeChild(noPokeMessage);
        }
    }
}

async function initializeView() {
    await getWholeList();

    pokeList = wholeList['results'];
    N = Math.min(wholeList.count, wholeList['results'].length);
    offset = 0;
    displayQueue();
}

async function searchCallback(event) {
    let inp = document.getElementById('search-input');
    let input = inp.value;
    
    if (input === prevSearchQuery)
        return;

    prevSearchQuery = input;
    
    let card_group = document.querySelector('.card-group');
    
    
    if (input.length === 0) {
        // Reset if empty string
        event.preventDefault();
        card_group.innerHTML = '';
        pokeList = wholeList['results'];
        offset = 0;
        await displayQueue();
        return;
    }

    // Rest view
    pokeList = [];
    offset = 0;
    card_group.innerHTML = '';

    console.log(`${input}`);
    
    if (!isNaN(input)) {
        // Number input
        let pokeId = parseInt(input);
        console.log(`Integer input received! pokeId = ${pokeId}`);
        
        if (pokeId > 0) {
            for (let i = 0; i < N; ++i) {
                let tmp = wholeList['results'][i].url.split("/");
                let id = parseInt(tmp[tmp.length - 2]);
    
                if (id === pokeId)
                    pokeList.push(wholeList['results'][i]);
            }
        }
        
    } else {
        // String input
        for (let i = 0; i < N; ++i) {
            const pokeName = wholeList['results'][i]['name'];
            if (pokeName.includes(input))
                pokeList.push(wholeList['results'][i]);
        }
    }

    await displayQueue();
}

function compareByName(a, b) {
    const nameNodeA = a.name;
    const nameNodeB = b.name;

    return nameNodeA > nameNodeB ? 1 : nameNodeA < nameNodeB ? -1 : 0;
}

async function sortByNameCallback() {
    let card_group = document.querySelector('.card-group');
    card_group.innerHTML = "";
    pokeList = pokeList.sort(compareByName);
    offset = 0;
    await displayQueue();
}

function compareById(a, b) {
    let tmpA = a.url.split("/");
    let idA = tmpA[tmpA.length - 2];

    let tmpB = b.url.split("/");
    let idB = tmpB[tmpB.length - 2];

    let u = parseInt(idA);
    let v = parseInt(idB);

    return u > v ? 1 : u < v ? -1 : 0;
}

async function sortByIdCallback() {
    let card_group = document.querySelector('.card-group');
    card_group.innerHTML = "";
    pokeList = pokeList.sort(compareById);
    offset = 0;
    await displayQueue();
}

initializeView();

let bottomLink = document.querySelector('.show-more-link');
bottomLink.addEventListener('click', async (event) => {
    await displayQueue();
});

let form = document.querySelector('form');
let searchInput = document.getElementById('search-input');

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await searchCallback(event);
});

let nameSortButton = document.querySelector('.name-sort');
nameSortButton.addEventListener('click', sortByNameCallback);

let idSortButton = document.querySelector('.id-sort');
idSortButton.addEventListener('click', sortByIdCallback);
