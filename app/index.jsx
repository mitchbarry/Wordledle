import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, FlatList, TouchableWithoutFeedback } from "react-native";
import tw from "twrnc";
import dictionary from '../constants/dictionary'; // Import the dictionary

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
    setCurrentInput(text);
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
    console.log("Generating hints based on guesses:", guesses);

    const requiredLetters = new Set();
    const mustExclude = new Set();
    const positionConstraints = Array(WORD_LENGTH).fill(null);

    for (const row of guesses) {
      for (let j = 0; j < WORD_LENGTH; j++) {
        const { letter, color } = row[j];
        if (letter === "") continue; // Skip empty guesses
        if (color === "green") {
          positionConstraints[j] = letter;
          requiredLetters.add(letter);
        } else if (color === "yellow") {
          requiredLetters.add(letter);
        } else if (color === "red") {
          mustExclude.add(letter);
        }
      }
    }

    console.log("Required Letters:", [...requiredLetters]);
    console.log("Must Exclude:", [...mustExclude]);
    console.log("Position Constraints:", positionConstraints);

    const filteredHints = dictionary.filter(word => {
      let isPossible = true;

      for (const letter of mustExclude) {
        if (word.includes(letter)) {
          // console.log(`Fail (red): ${word} should not include ${letter}`);
          isPossible = false;
          break;
        }
      }

      if (isPossible) {
        for (let j = 0; j < WORD_LENGTH; j++) {
          if (positionConstraints[j] && word[j] !== positionConstraints[j]) {
            // console.log(`Fail (green): ${word} has ${word[j]} at ${j}, expected ${positionConstraints[j]}`);
            isPossible = false;
            break;
          }
        }
      }

      if (isPossible) {
        for (const letter of requiredLetters) {
          if (!word.includes(letter)) {
            console.log(`Fail (yellow/green): ${word} should include ${letter}`);
            isPossible = false;

          }
        }
      }

      return isPossible;
    });

    console.log("Filtered Hints: ", filteredHints);
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
            <Text style={tw`text-lg text-white`}>{box.letter}</Text>
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
        value={currentInput}
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
            <Text key={index} style={tw`text-lg`}>{hint}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default Index;
