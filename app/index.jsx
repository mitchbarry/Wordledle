import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, FlatList, TouchableWithoutFeedback } from "react-native";
import tw from "twrnc";
import dictionary from '../constants/dictionary';

const WORD_LENGTH = 5;
const MAX_TRIES = 6;

const Index = () => {
  const [guesses, setGuesses] = useState(Array(MAX_TRIES).fill("").map(() => Array(WORD_LENGTH).fill({ letter: "", color: "gray" })));
  const [currentInput, setCurrentInput] = useState("");
  const [hints, setHints] = useState([]);

  const handleBoxPress = (rowIndex, colIndex) => {
    setGuesses(prevGuesses => {
      const updatedGuesses = [...prevGuesses];
      let currentColor = updatedGuesses[rowIndex][colIndex].color;
      const nextColor = currentColor === "gray" ? "yellow" : currentColor === "yellow" ? "green" : currentColor === "green" ? "red" : "gray";
      updatedGuesses[rowIndex][colIndex].color = nextColor;
      return updatedGuesses;
    });
  };

  const handleInputChange = (text) => {
    setCurrentInput(text.toLowerCase());
  };

  const handleInputSubmit = () => {
    setGuesses(prevGuesses => {
      const updatedGuesses = [...prevGuesses];
      const emptyRowIndex = updatedGuesses.findIndex(row => row.every(box => box.letter === ""));
      if (emptyRowIndex !== -1 && currentInput.length === WORD_LENGTH) {
        updatedGuesses[emptyRowIndex] = currentInput.split("").map(letter => ({ letter, color: "gray" }));
        setCurrentInput("");
      }
      return updatedGuesses;
    });
  };

  const generateHints = () => {
    const requiredLetters = {};
    const mustExclude = new Set();
    const positionConstraints = Array(WORD_LENGTH).fill(null);

    let allColored = true;

    for (const row of guesses) {
      for (let j = 0; j < WORD_LENGTH; j++) {
        const { letter, color } = row[j];
        if (letter === "") continue; // skip the empty boxes if they are empty for some reason
        if (color === "gray") {
          allColored = false;
          break;
        }
        if (color === "green") {
          positionConstraints[j] = letter.toLowerCase();
          requiredLetters[letter.toLowerCase()] = (requiredLetters[letter.toLowerCase()] || 0) + 1;
        } else if (color === "yellow") {
          requiredLetters[letter.toLowerCase()] = (requiredLetters[letter.toLowerCase()] || 0) + 1;
        } else if (color === "red") {
          mustExclude.add(letter.toLowerCase());
        }
      }
      if (!allColored) break;
    }

    if (!allColored) {
      alert("Please ensure all letters have a color other than gray.");
      return;
    }

    const filteredHints = dictionary.filter(word => {
      let isPossible = true;

      // check for excluded letters (reds)
      for (const letter of mustExclude) {
        if (word.includes(letter)) {
          isPossible = false;
          break;
        }
      }

      if (isPossible) {
        // check for position constraints (greens)
        for (let j = 0; j < WORD_LENGTH; j++) {
          if (positionConstraints[j] && word[j] !== positionConstraints[j]) {
            isPossible = false;
            break;
          }
        }
      }

      if (isPossible) {
        // check for required letters (yellow/greens)
        for (const letter in requiredLetters) {
          if ((word.match(new RegExp(letter, "g")) || []).length < requiredLetters[letter]) {
            isPossible = false;
            break;
          }
        }
      }

      return isPossible;
    });

    setHints(filteredHints);
  };

  const renderGuess = ({ item: row, index: rowIndex }) => (
    <View style={tw`flex-row mb-2`}>
      {row.map((box, colIndex) => (
        <TouchableWithoutFeedback key={colIndex} onPress={() => handleBoxPress(rowIndex, colIndex)}>
          <View style={[
            tw`w-8 h-8 border-2 mx-1 justify-center items-center`,
            { borderColor: "gray", backgroundColor: box.color }
          ]}>
            <Text style={tw`text-lg text-white`}>{box.letter.toUpperCase()}</Text>
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );

  return (
    <View style={tw`flex-1 justify-center items-center p-5 bg-black`}>
      <Text style={tw`text-4xl font-bold mb-5 text-white`}>Wordledle</Text>
      <FlatList
        data={guesses}
        renderItem={renderGuess}
        keyExtractor={(item, index) => index.toString()}
        style={tw`mb-5`}
      />
      <TextInput
        style={tw`h-10 border border-gray-400 px-3 mb-5 w-4/5 text-white`}
        placeholder="Enter your guess"
        placeholderTextColor="gray"
        value={currentInput.toUpperCase()}
        onChangeText={handleInputChange}
        maxLength={WORD_LENGTH}
      />
      <TouchableOpacity
        style={tw`bg-blue-500 p-3 rounded mb-5`}
        onPress={handleInputSubmit}
      >
        <Text style={tw`text-white text-center`}>Submit Guess</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-green-500 p-3 rounded mb-5`}
        onPress={generateHints}
      >
        <Text style={tw`text-white text-center`}>Receive Hints</Text>
      </TouchableOpacity>
      {hints.length > 0 && (
        <View style={tw`bg-white p-5 rounded w-full max-w-md`}>
          <Text style={tw`text-lg font-bold mb-3`}>Possible Words:</Text>
          {hints.map((hint, index) => (
            <Text key={index} style={tw`text-lg`}>{hint.toUpperCase()}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default Index;
