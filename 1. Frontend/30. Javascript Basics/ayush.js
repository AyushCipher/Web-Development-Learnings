async function getPokemonNames() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
    const data = await response.json();
    const names = data.results.map(pokemon => pokemon.name);
    
    console.log('Pokémon names:', names);

    // Print each name separately
    names.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

  } catch (error) {
    console.error('Error fetching Pokémon:', error);
  }
}

getPokemonNames();
