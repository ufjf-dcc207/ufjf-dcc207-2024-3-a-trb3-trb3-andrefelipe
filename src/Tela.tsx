import { useEffect, useState, useRef } from "react";
import Prompt from "./Prompt";
import "./Tela.css";

interface PokemonCard {
  id: string;
  name: string;
  image: string;
  virada: boolean;
  matched: boolean;
}

export default function Tela() {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [viradas, setViradas] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const isCheckingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    fetchPokemon();
  }, []);

  async function fetchPokemon() {
    const totalPares = 6;
    const pokemonIds = Array.from({ length: totalPares }, () => Math.floor(Math.random() * 151) + 1);

    const responses = await Promise.all(
      pokemonIds.map((id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()))
    );

    let newCards = responses.flatMap((pokemon) => [
      { id: pokemon.id + "A", name: pokemon.name, image: pokemon.sprites.front_default, virada: true, matched: false },
      { id: pokemon.id + "B", name: pokemon.name, image: pokemon.sprites.front_default, virada: true, matched: false }
    ]);

    newCards = newCards.sort(() => Math.random() - 0.5);
    setCards(newCards);

    timeoutRef.current = window.setTimeout(() => {
      setCards((prev) => prev.map((card) => ({ ...card, virada: false })));
      setGameStarted(true);
    }, 3000);
  }

  function handleCardClick(index: number) {
    if (!gameStarted || isCheckingRef.current || cards[index].virada || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].virada = true;
    setCards(newCards);
    setViradas([...viradas, index]);

    if (viradas.length === 1) {
      isCheckingRef.current = true;
      setTimeout(() => checkMatch(newCards, viradas[0], index), 1000);
    }
  }

  function checkMatch(updatedCards: PokemonCard[], firstIndex: number, secondIndex: number) {
    if (updatedCards[firstIndex].name === updatedCards[secondIndex].name) {
      updatedCards[firstIndex].matched = true;
      updatedCards[secondIndex].matched = true;
    } else {
      updatedCards[firstIndex].virada = false;
      updatedCards[secondIndex].virada = false;
    }

    setCards([...updatedCards]);
    setViradas([]);
    isCheckingRef.current = false;
  }

  function handleNovaPartida() {
    setCards([]);
    setViradas([]);
    setGameStarted(false);
    isCheckingRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    fetchPokemon();
  }

  return (
    <div className="container">
      <h1>Jogo da Memória Pokémon</h1>
      {cards.length === 0 ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`card ${card.virada || card.matched ? "virada" : ""}`}
              onClick={() => handleCardClick(index)}
            >
              {card.virada || card.matched ? <img src={card.image} alt={card.name} /> : "?"}
            </div>
          ))}
        </div>
      )}

      <Prompt onNovaPartida={handleNovaPartida} />
    </div>
  );
}
