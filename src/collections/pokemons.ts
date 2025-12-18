import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_POKEMONS } from "../utils";
import { PokemonType } from "../types";

export const createPokemon = async (
  name: string,
  description: string,
  height: number,
  weight: number,
  types: PokemonType[]
) => {
  const db = getDB();

  const result = await db.collection(COLLECTION_POKEMONS).insertOne({
    name,
    description,
    height,
    weight,
    types,
  });

  return await getPokemonById(result.insertedId.toString());
};

export const getPokemons = async (page?: number, size?: number) => {
  const db = getDB();
  const localPage = page || 1;
  const localSize = size || 10;

  return await db
    .collection(COLLECTION_POKEMONS)
    .find()
    .skip((localPage - 1) * localSize)
    .limit(localSize)
    .toArray();
};

export const getPokemonById = async (id: string) => {
  const db = getDB();
  if (!ObjectId.isValid(id)) return null;
  return await db.collection(COLLECTION_POKEMONS).findOne({ _id: new ObjectId(id) });
};