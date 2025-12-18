export type TrainerDB = {
    _id: string;
    name: string;
    password: string;
    pokemons: string[];
  };
  
  export type PokemonType =
    | "NORMAL"
    | "FIRE"
    | "WATER"
    | "GRASS"
    | "ELECTRIC"
    | "ICE"
    | "FIGHTING"
    | "POISON"
    | "GROUND"
    | "FLYING"
    | "PSYCHIC"
    | "BUG"
    | "ROCK"
    | "GHOST"
    | "DRAGON"
    | "DARK"
    | "STEEL"
    | "FAIRY";
  
  export type PokemonDB = {
    _id: string;
    name: string;
    description: string;
    height: number;
    weight: number;
    types: PokemonType[];
  };
  
  export type OwnedPokemonDB = {
    _id: string;
    trainerId: string;
    pokemon: string;
    nickname: string;
    attack: number;
    defense: number;
    speed: number;
    special: number;
    level: number;
  };