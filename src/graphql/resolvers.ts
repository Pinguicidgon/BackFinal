import { IResolvers } from "@graphql-tools/utils";
import { signToken } from "../auth";
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_OWNED_POKEMONS, COLLECTION_POKEMONS } from "../utils";

import { createTrainer, validateTrainer } from "../collections/Trainers";
import { createPokemon, getPokemons, getPokemonById } from "../collections/pokemons";
import { catchPokemon, freePokemon, getOwnedPokemonById } from "../collections/ownedPokemons";

export const resolvers: IResolvers = {
  Query: {
    me: async (_parent, _args, { user }) => {
      if (!user) return null;
      return {
        _id: user._id.toString(),
        ...user,
      };
    },

    pokemons: async (_parent, { page, size }) => {
      return await getPokemons(page, size);
    },

    pokemon: async (_parent, { id }) => {
      return await getPokemonById(id);
    },
  },

  Mutation: {
    startJourney: async (_parent, { name, password }) => {
      const trainerId = await createTrainer(name, password);
      return signToken(trainerId);
    },

    login: async (_parent, { name, password }) => {
      const trainer = await validateTrainer(name, password);
      if (!trainer) throw new Error("Invalid credentials");
      return signToken(trainer._id.toString());
    },

    createPokemon: async (_parent, { name, description, height, weight, types }, { user }) => {
      if (!user) throw new Error("You must be logged in");
      return await createPokemon(name, description, height, weight, types);
    },

    catchPokemon: async (_parent, { pokemonId, nickname }, { user }) => {
      if (!user) throw new Error("You must be logged in");
      return await catchPokemon(user._id.toString(), pokemonId, nickname);
    },

    freePokemon: async (_parent, { ownedPokemonId }, { user }) => {
      if (!user) throw new Error("You must be logged in");
      return await freePokemon(user._id.toString(), ownedPokemonId);
    },
  },

  Trainer: {
    pokemons: async (parent) => {
      const db = getDB();
      const ids = parent.pokemons || [];
      if (ids.length === 0) return [];

      const objIds = ids.filter((id: string) => ObjectId.isValid(id)).map((id: string) => new ObjectId(id));

      return await db
        .collection(COLLECTION_OWNED_POKEMONS)
        .find({ _id: { $in: objIds } })
        .toArray();
    },
  },

  OwnedPokemon: {
    pokemon: async (parent) => {
      const db = getDB();
      const pokemonId = parent.pokemon;
      if (!pokemonId || !ObjectId.isValid(pokemonId)) return null;

      return await db.collection(COLLECTION_POKEMONS).findOne({ _id: new ObjectId(pokemonId) });
    },
  },
};