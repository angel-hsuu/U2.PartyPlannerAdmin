// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2506-Angel"; // Make sure to change this!
const API = BASE + COHORT;


// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

// === API Calls ===

/** Get all parties */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Get one party */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Add new party */
async function addParty(party) {
  try {
    await fetch(API + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(party),
    });
    await getParties();
  } catch (e) {
    console.error(e);
  }
}

/** Delete party */
async function deleteParty(id) {
  try {
    await fetch(API + "/events/" + id, {
      method: "DELETE",
    });
    selectedParty = undefined;
    await getParties();
  } catch (e) {
    console.error(e);
  }
}

/** Get RSVPs */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Get Guests */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `<a href="#selected">${party.name}</a>`;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $items = parties.map(PartyListItem);
  $ul.replaceChildren(...$items);

  return $ul;
}

function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  const $guests = guestsAtParty.map((guest) => {
    const $li = document.createElement("li");
    $li.textContent = guest.name;
    return $li;
  });

  $ul.replaceChildren(...$guests);
  return $ul;
}

function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date}
    </time>
    <address><em>${selectedParty.location}</em></address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
  `;

  $party.querySelector("GuestList").replaceWith(GuestList());

  const $delete = document.createElement("button");
  $delete.textContent = "Delete party";
  $delete.addEventListener("click", () => deleteParty(selectedParty.id));
  $party.appendChild($delete);

  return $party;
}

function NewPartyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>
      Name
      <input name="name" required />
    </label>
    <label>
      Description
      <input name="description" required />
    </label>
    <label>
      Date
      <input name="date" type="date" required />
    </label>
    <label>
      Location
      <input name="location" required />
    </label>
    <button>Add party</button>
  `;

$form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData($form);

  const dateInput = data.get("date");
  const isoDate = new Date(dateInput).toISOString();

  const newParty = {
    name: data.get("name"),
    description: data.get("description"),
    date: isoDate,
    location: data.get("location"),
  };

  console.log("Submitting new party:", newParty); // ✅ Check this

  await addParty(newParty);
  $form.reset();
});


  return $form;
}

// === Render ===

function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <h3>Add a new party</h3>
        <NewPartyForm></NewPartyForm>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("NewPartyForm").replaceWith(NewPartyForm());
}


// === Init ===

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();