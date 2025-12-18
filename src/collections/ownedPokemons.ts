import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_OWNED_POKEMONS, COLLECTION_TRAINERS, COLLECTION_POKEMONS } from "../utils";

const random1to100 = () => Math.floor(Math.random() * 100) + 1;

export const catchPokemon = async (trainerId: string, pokemonId: string, nickname?: string) => {
  const db = getDB();

  if (!ObjectId.isValid(trainerId)) throw new Error("Invalid trainerId");
  if (!ObjectId.isValid(pokemonId)) throw new Error("Invalid pokemonId");

  const trainerObjId = new ObjectId(trainerId);
  const pokemonObjId = new ObjectId(pokemonId);

  const trainer = await db.collection(COLLECTION_TRAINERS).findOne({ _id: trainerObjId });
  if (!trainer) throw new Error("Trainer not found");

  const team = trainer.pokemons || [];
  if (team.length >= 6) throw new Error("You can only have 6 pokemons");

  const pokemon = await db.collection(COLLECTION_POKEMONS).findOne({ _id: pokemonObjId });
  if (!pokemon) throw new Error("Pokemon not found");

  const ownedResult = await db.collection(COLLECTION_OWNED_POKEMONS).insertOne({
    trainerId: trainerId,
    pokemon: pokemonId,
    nickname: nickname || pokemon.name,
    attack: random1to100(),
    defense: random1to100(),
    speed: random1to100(),
    special: random1to100(),
    level: random1to100(),
  });

  const ownedId = ownedResult.insertedId.toString();

  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: trainerObjId },
    { $addToSet: { pokemons: ownedId } }
  );

  return await getOwnedPokemonById(ownedId);
};

export const getOwnedPokemonById = async (ownedPokemonId: string) => {
  const db = getDB();
  if (!ObjectId.isValid(ownedPokemonId)) return null;
  return await db
    .collection(COLLECTION_OWNED_POKEMONS)
    .findOne({ _id: new ObjectId(ownedPokemonId) });
};

export const freePokemon = async (trainerId: string, ownedPokemonId: string) => {
  const db = getDB();

  if (!ObjectId.isValid(trainerId)) throw new Error("Invalid trainerId");
  if (!ObjectId.isValid(ownedPokemonId)) throw new Error("Invalid ownedPokemonId");

  const trainerObjId = new ObjectId(trainerId);
  const ownedObjId = new ObjectId(ownedPokemonId);

  const owned = await db.collection(COLLECTION_OWNED_POKEMONS).findOne({ _id: ownedObjId });
  if (!owned) throw new Error("OwnedPokemon not found");

  if (owned.trainerId !== trainerId) throw new Error("You can only free your own pokemon");

  type TrainerDoc = {
    pokemons: string[];
  };
  
  await db.collection<TrainerDoc>(COLLECTION_TRAINERS).updateOne(
    { _id: trainerObjId },
    { $pull: { pokemons: ownedPokemonId } }
  );
  

  await db.collection(COLLECTION_OWNED_POKEMONS).deleteOne({ _id: ownedObjId });

  return await db.collection(COLLECTION_TRAINERS).findOne({ _id: trainerObjId });
};